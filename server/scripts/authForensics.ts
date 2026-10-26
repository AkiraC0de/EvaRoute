import prisma from "../src/lib/prisma.js"

// READ-ONLY: how did the refresh-token family end? (reuse-detection forensics)
async function main() {
  const rows = await prisma.$queryRaw`
    SELECT "userId"::text AS user_id,
           count(*)::int AS total,
           count("rotatedAt")::int AS rotated,
           min("createdAt")::text AS first_created,
           max("createdAt")::text AS last_created,
           max("rotatedAt")::text AS last_rotated,
           max("expiresAt")::text AS last_expires
    FROM refresh_token
    GROUP BY "userId"
    ORDER BY max("createdAt") DESC
    LIMIT 8
  `
  const recent = await prisma.$queryRaw`
    SELECT id::text, "userId"::text AS user_id, "createdAt"::text, "rotatedAt"::text, "expiresAt"::text
    FROM refresh_token
    ORDER BY "createdAt" DESC
    LIMIT 12
  `
  console.log(JSON.stringify({ rows, recent }, null, 2))
  process.exit(0)
}

main().catch((e) => {
  console.error("PROBE FAILED:", e)
  process.exit(1)
})
