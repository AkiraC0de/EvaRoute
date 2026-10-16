-- Human-readable Check-In ID for facility stays: "0001" — zero-padded,
-- sequential PER FACILITY (4 digits, cap 9999 per center), unique within the
-- facility. Backfills existing rows per facility, then locks the column down.
-- NOTE: additive only — never drops anything from the shared database.
ALTER TABLE "facility_stays" ADD COLUMN "checkInCode" TEXT;

-- Backfill: per-facility running number by check-in time. The window function
-- lives in a FROM subquery — Postgres forbids window functions in UPDATE SET.
UPDATE "facility_stays" s
SET "checkInCode" = lpad(x.rn::text, 4, '0')
FROM (
  SELECT id, row_number() OVER (PARTITION BY "facilityId" ORDER BY "checkedInAt") AS rn
  FROM "facility_stays"
) x
WHERE x.id = s.id AND s."checkInCode" IS NULL;

ALTER TABLE "facility_stays" ALTER COLUMN "checkInCode" SET NOT NULL;

CREATE UNIQUE INDEX "facility_stays_facilityId_checkInCode_key"
  ON "facility_stays"("facilityId", "checkInCode");
