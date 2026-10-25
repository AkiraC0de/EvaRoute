-- Audit remediation (2026-10-25) — integrity + index fixes.

-- 1) Coordinate uniqueness scoped to ACTIVE facilities.
-- The global (longitude, latitude) unique index blocked soft-deleted
-- facilities' coordinates from ever being reused, while the app's conflict
-- checks filter `deletedAt: null` — the DB contradicted the app semantics and
-- create/restore at such coordinates died with P2002/500.
-- NOTE: schema.prisma cannot express partial indexes and keeps its
-- @@unique declaration (also powering the `longitude_latitude` unique input).
-- Future `prisma migrate diff` runs will suggest re-creating the full unique —
-- prune that statement (intentional documented drift).
DROP INDEX IF EXISTS "facilities_longitude_latitude_key";
CREATE UNIQUE INDEX IF NOT EXISTS "facilities_longitude_latitude_key"
  ON "facilities" ("longitude", "latitude")
  WHERE "deletedAt" IS NULL;

-- 2) facility_staff: drop redundant indexes (pure write amplification —
-- userId is already covered by its @unique index, and facilityId is the
-- leftmost prefix of the (facilityId, userId) unique index).
DROP INDEX IF EXISTS "facility_staff_userId_idx";
DROP INDEX IF EXISTS "facility_staff_facilityId_idx";
