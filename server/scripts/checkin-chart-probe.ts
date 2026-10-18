/* One-off: why does the trend chart show 0 while check-ins exist? */
import prisma from "../src/lib/prisma.ts";
import activityLog from "../src/services/activityLog.services.ts";

// 1. Do STAY_CHECKED_IN log rows carry a facilityId at all?
const checkins = await prisma.activityLog.findMany({
  where: { action: "STAY_CHECKED_IN" },
  select: { createdAt: true, facilityId: true, facilityName: true },
  orderBy: { createdAt: "desc" },
});
console.log(`STAY_CHECKED_IN rows: ${checkins.length}`);
for (const row of checkins.slice(0, 12)) {
  console.log(
    row.createdAt.toISOString(),
    "facilityId=",
    row.facilityId ?? "NULL",
    row.facilityName ?? "",
  );
}

// 2. countByDay with and without a facility filter.
const facilities = await prisma.facility.findMany({ select: { id: true, name: true } });
console.log("facilities:", JSON.stringify(facilities));

const from = new Date();
from.setUTCDate(from.getUTCDate() - 13);
const to = new Date();

const global = await activityLog.countByDay({ from, to });
const globalCheckIns = global.reduce((sum, day) => sum + day.checkIns, 0);
console.log(
  "countByDay GLOBAL checkIns:",
  globalCheckIns,
  JSON.stringify(global.map((d) => `${d.date}:${d.checkIns}`)),
);

for (const facility of facilities) {
  const scoped = await activityLog.countByDay({ from, to, facilityId: facility.id });
  const scopedCheckIns = scoped.reduce((sum, day) => sum + day.checkIns, 0);
  console.log(
    "countByDay facility=",
    facility.name,
    "checkIns:",
    scopedCheckIns,
    JSON.stringify(scoped.map((d) => `${d.date}:${d.checkIns}`)),
  );
}

await prisma.$disconnect();
