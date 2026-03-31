const { PrismaClient } = require('@prisma/client');

async function fixDatabase(retries = 10) {
  let prisma;
  
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL;
    if (!url.includes('sslmode=')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}sslmode=require`;
    }
    if (!url.includes('connect_timeout')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}connect_timeout=60&pool_timeout=60&socket_timeout=60`;
    }
    process.env.DATABASE_URL = url;
  }

  prisma = new PrismaClient();

  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`🔄 Syncing database schema (Attempt ${i}/${retries})...`);
      await prisma.$queryRaw`SELECT 1`;

      const tableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Budget'
        ORDER BY ordinal_position;
      `;
      
      if (tableInfo && tableInfo.length > 0) {
        const hasOldColumns = tableInfo.some((col) => 
          col.column_name === 'title' || col.column_name === 'amount'
        );
        
        const hasNewColumns = tableInfo.some((col) => 
          col.column_name === 'income' || col.column_name === 'monthlyBills'
        );
        
        if (hasOldColumns) {
          console.log('⚠️  Cleaning up legacy columns...');
          await prisma.$executeRaw`ALTER TABLE "Budget" DROP COLUMN IF EXISTS "title";`;
          await prisma.$executeRaw`ALTER TABLE "Budget" DROP COLUMN IF EXISTS "amount";`;
        }
        
        if (!hasNewColumns) {
          console.log('⚠️  Migrating to new schema structure...');
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "income" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "monthlyBills" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "food" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "transport" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "subscriptions" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "misc" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);`;
          
          await prisma.$executeRaw`UPDATE "Budget" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;`;
          await prisma.$executeRaw`ALTER TABLE "Budget" ALTER COLUMN "updatedAt" SET NOT NULL;`;
        }
        
        const constraints = await prisma.$queryRaw`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'Budget' AND constraint_type = 'UNIQUE';
        `;
        
        if (!constraints.some(c => c.constraint_name === 'Budget_userId_key')) {
          await prisma.$executeRaw`ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_key" UNIQUE ("userId");`;
        }
      }
      
      console.log('✅ Database schema is up to date.');
      return;

    } catch (error) {
      console.error(`⚠️  Database sync attempt ${i} failed:`, error.message);
      if (i === retries) return;
      await new Promise(resolve => setTimeout(resolve, 10000));
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }
}

fixDatabase().catch(err => {
  console.error('Fatal error in database sync script:', err);
});
