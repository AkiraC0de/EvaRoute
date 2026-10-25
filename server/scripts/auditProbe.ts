import prisma from "../src/lib/prisma.js"

// READ-ONLY probe: verify DB-side facts before the migration pass.
// 1. FacilityStatus enum values (schema drift check)
// 2. facilities unique constraint + facility_staff index names
// 3. rows using a status outside the Prisma schema enum
// 4. token.payload column type (jsonb vs json — the atomic increment SQL needs it)
async function main() {
  const enums = await prisma.$queryRaw`
    SELECT t.typname::text AS typname, e.enumlabel::text AS enumlabel
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname ILIKE '%FacilityStatus%'
    ORDER BY t.typname, e.enumsortorder
  `
  const constraints = await prisma.$queryRaw`
    SELECT conname::text AS conname, contype::text AS contype, pg_get_constraintdef(oid)::text AS def
    FROM pg_constraint
    WHERE conrelid = 'facilities'::regclass
  `
  const indexes = await prisma.$queryRaw`
    SELECT tablename::text AS tablename, indexname::text AS indexname, indexdef::text AS indexdef
    FROM pg_indexes
    WHERE tablename IN ('facilities', 'facility_staff')
  `
  const statusCounts = await prisma.$queryRaw`
    SELECT status::text AS status, count(*)::int AS n
    FROM facilities
    GROUP BY status::text
  `
  const payloadType = await prisma.$queryRaw`
    SELECT data_type::text AS data_type, udt_name::text AS udt_name
    FROM information_schema.columns
    WHERE table_name = 'token' AND column_name = 'payload'
  `
  const deleted = await prisma.$queryRaw`
    SELECT count(*)::int AS n FROM facilities WHERE "deletedAt" IS NOT NULL
  `
  // Pre-migration check for DB-07: duplicate (facilityId, name) resource rows
  const resourceDupes = await prisma.$queryRaw`
    SELECT "facilityId"::text AS facility_id, name::text AS name, count(*)::int AS n
    FROM facility_resource
    GROUP BY "facilityId", name
    HAVING count(*) > 1
    LIMIT 20
  `
  console.log(JSON.stringify({ enums, constraints, indexes, statusCounts, payloadType, deleted, resourceDupes }, null, 2))
  process.exit(0)
}

main().catch((e) => {
  console.error("PROBE FAILED:", e)
  process.exit(1)
})
