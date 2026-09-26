/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `facilities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "facilities_address_key" ON "facilities"("address");

-- CreateIndex
CREATE INDEX "facility_resource_facilityId_type_idx" ON "facility_resource"("facilityId", "type");

-- CreateIndex
CREATE INDEX "facility_staff_facilityId_idx" ON "facility_staff"("facilityId");

-- CreateIndex
CREATE INDEX "facility_staff_staffId_idx" ON "facility_staff"("staffId");

-- CreateIndex
CREATE INDEX "tokens_type_userId_idx" ON "tokens"("type", "userId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
