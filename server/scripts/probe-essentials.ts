import prisma from "../src/lib/prisma.js"

/** One-off probe: essential_type values on facility_resource. Delete after use. */
const run = async () => {
  const rows = await prisma.facilityResource.findMany({
    select: { name: true, essentialType: true, facility: { select: { name: true } } },
    orderBy: [{ essentialType: "asc" }, { name: "asc" }],
  })
  for (const r of rows) {
    console.log(`${r.essentialType ?? "NULL"} | ${r.name} | ${r.facility.name}`)
  }
  const counts = await prisma.facilityResource.groupBy({
    by: ["essentialType"],
    _count: true,
  })
  console.log("counts:", JSON.stringify(counts))
}

run()
  .catch((err) => {
    console.log("ERROR:", err.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
