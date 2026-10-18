/* One-off: stays' checkedInAt per day vs the activity log (logging gap?). */
import prisma from "../src/lib/prisma.ts";

const stays = await prisma.facilityStay.findMany({
  select: { checkedInAt: true, checkedOutAt: true, facilityId: true, familyName: true },
  orderBy: { checkedInAt: "desc" },
});
const stayDays: Record<string, number> = {};
for (const stay of stays) {
  if (!stay.checkedInAt) continue;
  const day = stay.checkedInAt.toISOString().slice(0, 10);
  stayDays[day] = (stayDays[day] ?? 0) + 1;
}
console.log("stays total:", stays.length, "active (no checkout):", stays.filter((s) => !s.checkedOutAt).length);
console.log("stays checked-in per day:", JSON.stringify(stayDays));
console.log("newest 8 stays:");
for (const stay of stays.slice(0, 8)) {
  console.log(
    stay.checkedInAt?.toISOString() ?? "never",
    "checkedOut:",
    stay.checkedOutAt?.toISOString() ?? "-",
    stay.facilityId,
    stay.familyName,
  );
}
await prisma.$disconnect();
