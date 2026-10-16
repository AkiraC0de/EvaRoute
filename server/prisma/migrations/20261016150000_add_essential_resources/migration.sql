-- Mandatory essential resources (Electricity / Generator, Drinkable Water,
-- Comfort Room (CR)) for every facility.
--
-- 1. Adds the EssentialResourceType enum + nullable identifier column.
-- 2. ADOPTS existing rows that already represent an essential (matched by
--    canonical/legacy names) — preserving their recorded status. Per facility
--    and category only the lowest-id row is adopted, so duplicates can never
--    violate the unique index.
-- 3. Creates only the MISSING essentials, defaulting them to Unavailable.
-- 4. Enforces uniqueness (facilityId, essentialType) at the database level.
--
-- Idempotent: re-running creates nothing new (the NOT EXISTS guard holds).
-- Additive only — never drops or overwrites existing data.

CREATE TYPE "EssentialResourceType" AS ENUM ('ELECTRICITY', 'WATER', 'COMFORT_ROOM');

ALTER TABLE "facility_resource" ADD COLUMN "essentialType" "EssentialResourceType";

-- Adopt existing rows (deterministic winner: lowest id per facility/category).
UPDATE "facility_resource" r
SET "essentialType" = 'ELECTRICITY'
WHERE lower(r."name") IN ('electricity', 'generator', 'generators', 'electricity / generator')
  AND NOT EXISTS (
    SELECT 1 FROM "facility_resource" x
    WHERE x."facilityId" = r."facilityId" AND x."id" < r."id"
      AND lower(x."name") IN ('electricity', 'generator', 'generators', 'electricity / generator')
  );

UPDATE "facility_resource" r
SET "essentialType" = 'WATER'
WHERE lower(r."name") IN ('water', 'drinkable water', 'drinking water')
  AND NOT EXISTS (
    SELECT 1 FROM "facility_resource" x
    WHERE x."facilityId" = r."facilityId" AND x."id" < r."id"
      AND lower(x."name") IN ('water', 'drinkable water', 'drinking water')
  );

UPDATE "facility_resource" r
SET "essentialType" = 'COMFORT_ROOM'
WHERE lower(r."name") IN ('comfort room', 'comfort room (cr)', 'cr', 'toilet', 'toilets', 'restroom', 'restrooms')
  AND NOT EXISTS (
    SELECT 1 FROM "facility_resource" x
    WHERE x."facilityId" = r."facilityId" AND x."id" < r."id"
      AND lower(x."name") IN ('comfort room', 'comfort room (cr)', 'cr', 'toilet', 'toilets', 'restroom', 'restrooms')
  );

-- Create the missing essentials (Unavailable until someone says otherwise).
INSERT INTO "facility_resource" ("id", "facilityId", "name", "type", "isAvailable", "essentialType")
SELECT gen_random_uuid(), f."id", v."name", 'BOOLEAN', false, v."key"::"EssentialResourceType"
FROM "facilities" f
CROSS JOIN (
  VALUES
    ('Electricity / Generator', 'ELECTRICITY'),
    ('Drinkable Water', 'WATER'),
    ('Comfort Room (CR)', 'COMFORT_ROOM')
) AS v("name", "key")
WHERE NOT EXISTS (
  SELECT 1 FROM "facility_resource" r
  WHERE r."facilityId" = f."id" AND r."essentialType" = v."key"::"EssentialResourceType"
);

CREATE UNIQUE INDEX "facility_resource_facilityId_essentialType_key"
  ON "facility_resource"("facilityId", "essentialType");
