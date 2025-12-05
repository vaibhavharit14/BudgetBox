-- Migration to update Budget table schema
-- This migration transforms the old schema (title, amount) to new schema (income, monthly_bills, etc.)

-- Step 1: Add new columns
ALTER TABLE "Budget" 
ADD COLUMN IF NOT EXISTS "income" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "monthly_bills" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "food" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "transport" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "subscriptions" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "misc" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Step 2: Set updatedAt default for existing rows
UPDATE "Budget" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Step 3: Make updatedAt NOT NULL and set default
ALTER TABLE "Budget" 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 4: Drop old columns (if they exist)
ALTER TABLE "Budget" 
DROP COLUMN IF EXISTS "title",
DROP COLUMN IF EXISTS "amount";

-- Step 5: Add unique constraint on userId (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Budget_userId_key'
    ) THEN
        ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_key" UNIQUE ("userId");
    END IF;
END $$;


