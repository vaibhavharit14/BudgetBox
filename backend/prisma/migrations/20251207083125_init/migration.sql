/*
  Warnings:

  - You are about to drop the column `amount` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "amount",
DROP COLUMN "title",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "food" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "income" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "misc" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "monthlyBills" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subscriptions" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "transport" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
