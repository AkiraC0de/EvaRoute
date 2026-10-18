/* One-off: live-verify GET /activity/stats facilityId scoping end-to-end. */
import prisma from "../src/lib/prisma.ts";
import { createAccessToken } from "../src/utils/jwtUtils.ts";
import { UserRole } from "../generated/prisma/index.js";

const admin = await prisma.user.findFirst({
  where: { role: UserRole.ADMIN },
  select: { id: true, email: true, role: true },
});
if (!admin) throw new Error("no admin user");
const token = createAccessToken({ id: admin.id, role: admin.role });

const from = new Date();
from.setUTCDate(from.getUTCDate() - 13);
const base = "http://localhost:3000/api/v1/activity/stats";
const qs = `interval=day&from=${encodeURIComponent(from.toISOString())}`;

const scenarios: Array<[string, string]> = [
  ["GLOBAL (no facilityId)", `${base}?${qs}`],
  ["Camarin", `${base}?${qs}&facilityId=72901848-657e-4389-a7fb-a3df091c06b0`],
  ["Verify Hub", `${base}?${qs}&facilityId=d961a7d5-cf5a-4065-b2ec-e69769f326a4`],
];

for (const [label, url] of scenarios) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  const timeline = body?.data?.timeline ?? body?.timeline ?? null;
  const checkIns = Array.isArray(timeline)
    ? timeline.map((d: { date: string; checkIns: number }) => `${d.date}:${d.checkIns}`).join(" ")
    : JSON.stringify(body).slice(0, 200);
  console.log(`${label} -> HTTP ${res.status} :: ${checkIns}`);
}

await prisma.$disconnect();
