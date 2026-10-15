/* Minimal QA seed: accounts + facility + activity rows (direct prisma). */
import prisma from "../src/lib/prisma"
import bcrypt from "bcryptjs"
import { ActivityAction, UserRole } from "../generated/prisma"

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@verify.test" },
    update: { isActive: true },
    create: {
      email: "admin@verify.test",
      password: await bcrypt.hash("Verify#Admin2026", 10),
      role: "ADMIN",
      firstName: "Verify",
      lastName: "Admin",
      isSetupDone: true
    }
  })
  const staff = await prisma.user.upsert({
    where: { email: "staff@verify.test" },
    update: { isActive: true },
    create: {
      email: "staff@verify.test",
      password: await bcrypt.hash("Verify#Staff2026", 10),
      role: "FACILITY_STAFF",
      firstName: "Verify",
      lastName: "Staff",
      isSetupDone: true
    }
  })
  const facility = await prisma.facility.upsert({
    where: { longitude_latitude: { longitude: 123.0, latitude: 10.0 } },
    update: { deletedAt: null },
    create: { name: "Verify Hub", address: "123 Test St", maxCapacity: 50, latitude: 10.0, longitude: 123.0 }
  })
  await prisma.facilityStaff.upsert({
    where: { facilityId_userId: { facilityId: facility.id, userId: staff.id } },
    update: {},
    create: { facilityId: facility.id, userId: staff.id }
  })

  const rows: Array<Parameters<typeof prisma.activityLog.create>[0]["data"]> = [
    {
      action: ActivityAction.STAY_CHECKED_IN,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: "Reyes Family",
      metadata: { stayId: "qa-1", familyName: "Reyes Family", members: 3, adults: 2, children: 1 }
    },
    {
      action: ActivityAction.RESOURCE_UPDATED,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: "Cots",
      metadata: { before: { availableValue: 12, maxValue: 20 }, after: { availableValue: 9, maxValue: 20 } }
    },
    {
      action: ActivityAction.RESOURCE_CREATED,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: "Cots",
      metadata: { type: "QUANTITY", availableValue: 12, maxValue: 20 }
    },
    {
      action: ActivityAction.STAY_CHECKED_OUT,
      actorId: staff.id, actorEmail: staff.email, actorName: "Verify Staff", actorRole: UserRole.FACILITY_STAFF,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: "Cruz Family",
      metadata: { stayId: "qa-2", familyName: "Cruz Family", durationMinutes: 125 }
    },
    {
      action: ActivityAction.STAFF_ASSIGNED,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: "Verify Staff",
      metadata: {}
    },
    {
      action: ActivityAction.AUTH_LOGIN,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      metadata: { keepLogin: true }
    },
    {
      action: ActivityAction.FACILITY_UPDATED,
      actorId: admin.id, actorEmail: admin.email, actorName: "Verify Admin", actorRole: UserRole.ADMIN,
      facilityId: facility.id, facilityName: facility.name,
      targetLabel: facility.name,
      metadata: { before: { status: "AVAILABLE" }, after: { status: "UNAVAILABLE" } }
    }
  ]
  for (const data of rows) await prisma.activityLog.create({ data })
  console.log("seeded", rows.length, "activity rows")
}

main().finally(() => prisma.$disconnect())
