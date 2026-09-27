-- Drop redundant index (User.email @unique already creates one)
DROP INDEX IF EXISTS "users_email_idx";

-- Align FacilityStay table names with the @@map convention of other models
ALTER TABLE IF EXISTS "FacilityStay" RENAME TO "facility_stays";
ALTER TABLE IF EXISTS "FacilityStayMember" RENAME TO "facility_stay_members";

ALTER INDEX IF EXISTS "FacilityStay_facilityId_checkedOutAt_idx" RENAME TO "facility_stays_facilityId_checkedOutAt_idx";
ALTER INDEX IF EXISTS "FacilityStayMember_stayId_idx" RENAME TO "facility_stay_members_stayId_idx";
