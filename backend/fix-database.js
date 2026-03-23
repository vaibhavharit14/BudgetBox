// Script to fix the database schema mismatch
const { PrismaClient } = require('@prisma/client');

async function fixDatabase(retries = 10) {
  let prisma;
  
  // Improve DATABASE_URL for connection reliability on cold starts
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL;
    
    // Add SSL mode if missing
    if (!url.includes('sslmode=')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}sslmode=require`;
    }
    
    // Add timeouts if missing
    if (!url.includes('connect_timeout')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}connect_timeout=60&pool_timeout=60&socket_timeout=60`;
    }

    process.env.DATABASE_URL = url;
    console.log('📡 Using DATABASE_URL (modified with SSL and timeout params)');
  }

  prisma = new PrismaClient();

  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`🔄 Fixing database schema (Attempt ${i}/${retries})...`);
      
      // Verification query to wake up the DB
      await prisma.$queryRaw`SELECT 1`;
      console.log('📡 Database connection established.');

      // Check current table structure
      const tableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Budget'
        ORDER BY ordinal_position;
      `;
      
      if (!tableInfo || tableInfo.length === 0) {
        console.log('⚠️  Budget table not found or empty info. Skipping manual fix.');
      } else {
        console.log('Current Budget table columns count:', tableInfo.length);
        
        // Check if old columns exist
        const hasOldColumns = tableInfo.some((col) => 
          col.column_name === 'title' || col.column_name === 'amount'
        );
        
        const hasNewColumns = tableInfo.some((col) => 
          col.column_name === 'income' || col.column_name === 'monthlyBills'
        );
        
        if (hasOldColumns) {
          console.log('⚠️  Old columns detected. Cleaning up...');
          try {
            await prisma.$executeRaw`ALTER TABLE "Budget" DROP COLUMN IF EXISTS "title";`;
            await prisma.$executeRaw`ALTER TABLE "Budget" DROP COLUMN IF EXISTS "amount";`;
            console.log('✅ Dropped old columns');
          } catch (err) {
            console.log('⚠️  Note on dropping old columns:', err.message);
          }
        }
        
        if (!hasNewColumns) {
          console.log('⚠️  New columns missing. Adding them...');
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "income" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "monthlyBills" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "food" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "transport" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "subscriptions" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "misc" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);`;
          console.log('✅ Added new columns');
          
          await prisma.$executeRaw`UPDATE "Budget" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET NOT NULL;`;
          console.log('✅ Set updatedAt defaults');
        }
        
        const constraints = await prisma.$queryRaw`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'Budget' AND constraint_type = 'UNIQUE';
        `;
        
        if (!constraints.some(c => c.constraint_name === 'Budget_userId_key')) {
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_key" UNIQUE ("userId");`;
          console.log('✅ Added unique constraint on userId');
        }
      }
      
      console.log('✅ Database schema is up to date!');
      return; // Success!

    } catch (error) {
      console.error(`⚠️  Attempt ${i} failed:`, error.message);
      
      if (i === retries) {
        console.error('❌ Migration failed after multiple attempts. Proceeding to app start anyway (server will keep retrying).');
        return; // Don't crash the deploy process, let the server retry
      }
      
      const delay = 10000; // Consistent 10s wait
      console.log(`⏳ Waiting ${delay/1000}s before next retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }
}

fixDatabase().catch(err => {
  console.error('Fatal error in fix-database script:', err);
  // Don't process.exit(1) to avoid killing the deploy prematurely
});
