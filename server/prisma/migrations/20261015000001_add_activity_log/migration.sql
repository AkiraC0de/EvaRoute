-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('AUTH_LOGIN', 'AUTH_SIGN_OUT', 'AUTH_SIGN_OUT_ALL', 'AUTH_PASSWORD_RESET_REQUESTED', 'AUTH_PASSWORD_RESET', 'FACILITY_CREATED', 'FACILITY_UPDATED', 'FACILITY_DELETED', 'FACILITY_RESTORED', 'STAFF_ACCOUNT_CREATED', 'STAFF_ACCOUNT_UPDATED', 'STAFF_ACTIVATED', 'STAFF_DEACTIVATED', 'STAFF_PASSWORD_RESET', 'STAFF_DELETED', 'STAFF_ASSIGNED', 'STAFF_DISMISSED', 'RESOURCE_CREATED', 'RESOURCE_UPDATED', 'RESOURCE_DELETED', 'STAY_CHECKED_IN', 'STAY_CHECKED_OUT');

-- NOTE: the schema diff also proposed reverting DB drift on "FacilityStatus"
-- (dropping the "LIMITED" variant that exists only in the database). That
-- revert is DELIBERATELY excluded here: it is pre-existing drift owned by
-- another contributor and dropping it would destroy their data model.
-- Reconcile separately (either add LIMITED to schema.prisma or remove it
-- from the DB on purpose).

-- CreateTable
CREATE TABLE "activity_log" (
    "id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "actorId" UUID,
    "actorEmail" TEXT NOT NULL,
    "actorName" TEXT,
    "actorRole" "UserRole" NOT NULL,
    "facilityId" UUID,
    "facilityName" TEXT,
    "targetId" UUID,
    "targetLabel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- CreateIndex
CREATE INDEX "activity_log_facilityId_createdAt_idx" ON "activity_log"("facilityId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_log_action_createdAt_idx" ON "activity_log"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
