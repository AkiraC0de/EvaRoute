-- Audit remediation (2026-10-25, pass 2) — backing constraints + indexes.

-- 1) DB-07 / SL-20: one resource NAME per facility. Duplicate-name creates
-- were check-then-act races with no constraint behind them; concurrent creates
-- could both pass the pre-check. Verified free of existing duplicates before
-- applying. P2002 on this key is mapped to a friendly 409 by the error handler.
CREATE UNIQUE INDEX IF NOT EXISTS "facility_resource_facilityId_name_key"
  ON "facility_resource" ("facilityId", "name");

-- 2) DB-13: the activity feed supports an actorId filter with createdAt
-- ordering and had no supporting index.
CREATE INDEX IF NOT EXISTS "activity_log_actorId_createdAt_idx"
  ON "activity_log" ("actorId", "createdAt");

-- 3) DB-15: per-facility stay listings order by checkedInAt and were unindexed.
CREATE INDEX IF NOT EXISTS "facility_stays_facilityId_checkedInAt_idx"
  ON "facility_stays" ("facilityId", "checkedInAt");
