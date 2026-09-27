-- AlterTable
ALTER TABLE "facility_stay_members" RENAME CONSTRAINT "FacilityStayMember_pkey" TO "facility_stay_members_pkey";

-- AlterTable
ALTER TABLE "facility_stays" RENAME CONSTRAINT "FacilityStay_pkey" TO "facility_stays_pkey";

-- RenameForeignKey
ALTER TABLE "facility_stay_members" RENAME CONSTRAINT "FacilityStayMember_stayId_fkey" TO "facility_stay_members_stayId_fkey";

-- RenameForeignKey
ALTER TABLE "facility_stays" RENAME CONSTRAINT "FacilityStay_facilityId_fkey" TO "facility_stays_facilityId_fkey";
