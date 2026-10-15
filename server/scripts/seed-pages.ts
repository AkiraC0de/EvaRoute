/* Adds 30 spread-out activity rows so pagination has multiple pages. */
import prisma from "../src/lib/prisma"
import { ActivityAction, UserRole } from "../generated/prisma"

const KINDS = [
  { action: ActivityAction.STAY_CHECKED_IN, label: "Test Family A", md: { familyName: "Test Family A", members: 2, adults: 1, children: 1 } },
  { action: ActivityAction.STAY_CHECKED_OUT, label: "Test Family B", md: { familyName: "Test Family B", durationMinutes: 90 } },
  { action: ActivityAction.RESOURCE_UPDATED, label: "Cots", md: { before: { availableValue: 9 }, after: { availableValue: 7 } } },
  { action: ActivityAction.AUTH_LOGIN, label: null, md: { keepLogin: true } },
  { action: ActivityAction.STAFF_ASSIGNED, label: "Verify Staff", md: {} }
]

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@verify.test" } })
  const facility = await prisma.facility.findFirst({ where: { name: "Verify Hub" } })
  if (!admin || !facility) throw new Error("run seed.ts first")

  const base = Date.now()
  for (let i = 0; i < 30; i += 1) {
    const kind = KINDS[i % KINDS.length]
    await prisma.activityLog.create({
      data: {
        action: kind.action,
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: "Verify Admin",
        actorRole: UserRole.ADMIN,
        facilityId: kind.action === ActivityAction.AUTH_LOGIN ? null : facility.id,
        facilityName: kind.action === ActivityAction.AUTH_LOGIN ? null : facility.name,
        targetLabel: kind.label,
        metadata: kind.md,
        // Spread over the last 4 days so the timeline has day groups
        createdAt: new Date(base - i * 3.2 * 3600 * 1000)
      }
    })
  }
  const total = await prisma.activityLog.count()
  console.log("inserted 30 rows; total now:", total)
}

main().finally(() => prisma.$disconnect())
