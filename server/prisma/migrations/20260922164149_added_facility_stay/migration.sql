/*
  Warnings:

  - Added the required column `maxCapacity` to the `facilities` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvacueeAgeGroup" AS ENUM ('CHILD', 'ADULT');

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "maxCapacity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "FacilityStay" (
    "id" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "familyName" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedOutAt" TIMESTAMP(3),

    CONSTRAINT "FacilityStay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityStayMember" (
    "id" UUID NOT NULL,
    "stayId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "ageGroup" "EvacueeAgeGroup" NOT NULL,

    CONSTRAINT "FacilityStayMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityStay_facilityId_checkedOutAt_idx" ON "FacilityStay"("facilityId", "checkedOutAt");

-- CreateIndex
CREATE INDEX "FacilityStayMember_stayId_idx" ON "FacilityStayMember"("stayId");

-- AddForeignKey
ALTER TABLE "FacilityStay" ADD CONSTRAINT "FacilityStay_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityStayMember" ADD CONSTRAINT "FacilityStayMember_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FacilityStay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
