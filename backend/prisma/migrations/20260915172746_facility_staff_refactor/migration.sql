/*
  Warnings:

  - You are about to drop the column `staffId` on the `facility_staff` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `facility_staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facilityId,userId]` on the table `facility_staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `facility_staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "facility_staff" DROP CONSTRAINT "facility_staff_staffId_fkey";

-- DropIndex
DROP INDEX "facility_staff_staffId_idx";

-- DropIndex
DROP INDEX "facility_staff_staffId_key";

-- AlterTable
ALTER TABLE "facility_staff" DROP COLUMN "staffId",
ADD COLUMN     "userId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_userId_key" ON "facility_staff"("userId");

-- CreateIndex
CREATE INDEX "facility_staff_userId_idx" ON "facility_staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_facilityId_userId_key" ON "facility_staff"("facilityId", "userId");

-- AddForeignKey
ALTER TABLE "facility_staff" ADD CONSTRAINT "facility_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
