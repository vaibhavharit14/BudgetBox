// Script to fix the database schema mismatch
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔄 Fixing database schema...');
    
    // Check current table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Budget'
      ORDER BY ordinal_position;
    `;
    
    console.log('Current Budget table columns:', tableInfo);
    
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
        console.log('⚠️  Could not drop old columns (may already be dropped):', err.message);
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
    console.log('\n📝 Next step: Run "npm run generate" to regenerate Prisma client');
    
    if (false) {
      console.log('⚠️  Unknown schema state. The table will be created by Prisma migrations.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();

