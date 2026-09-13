/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tokens_userId_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_userId_type_key" ON "tokens"("userId", "type");
