-- CreateEnum
CREATE TYPE "FacilityResourceType" AS ENUM ('FIXED_VALUE', 'DYNAMIC_VALUE');

-- CreateTable
CREATE TABLE "facility_resource" (
    "id" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityResourceType" NOT NULL DEFAULT 'FIXED_VALUE',
    "isAvailable" BOOLEAN,
    "availableValue" INTEGER,
    "maxValue" INTEGER,

    CONSTRAINT "facility_resource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facility_resource" ADD CONSTRAINT "facility_resource_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
