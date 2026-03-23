// Script to fix the database schema mismatch
const { PrismaClient } = require('@prisma/client');

async function fixDatabase(retries = 3) {
  let prisma;
  
  // Improve DATABASE_URL for connection reliability on cold starts
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connect_timeout')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}connect_timeout=60&pool_timeout=60&socket_timeout=60`;
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
        
        // Drop old columns if they exist
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
        
        // Step 1: Add new columns
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "income" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "monthlyBills" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "food" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "transport" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "subscriptions" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "misc" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);`;
        
        console.log('✅ Added new columns');
        
        // Step 2: Set updatedAt for existing rows
        await prisma.$executeRaw`UPDATE "Budget" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;`;
        
        // Step 3: Make updatedAt NOT NULL
        await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;`;
        await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET NOT NULL;`;
        
        console.log('✅ Set updatedAt defaults');
      }
      
      // Step 4: Add unique constraint on userId if it doesn't exist
      const constraints = await prisma.$queryRaw`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'Budget' AND constraint_type = 'UNIQUE';
      `;
      
      const hasUserIdUnique = constraints.some((c) => 
        c.constraint_name === 'Budget_userId_key'
      );
      
      if (!hasUserIdUnique) {
        await prisma.$executeRaw`ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_key" UNIQUE ("userId");`;
        console.log('✅ Added unique constraint on userId');
      }
      
      console.log('✅ Database schema is up to date!');
      return; // Success!

    } catch (error) {
      console.error(`⚠️  Attempt ${i} failed:`, error.message);
      
      if (i === retries) {
        console.error('❌ Migration failed after multiple attempts.');
        console.error('Full error:', error);
        process.exit(1);
      }
      
      const delay = 5000 * i;
      console.log(`⏳ Waiting ${delay/1000}s before next retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      await prisma.$disconnect();
    }
  }
}

fixDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
