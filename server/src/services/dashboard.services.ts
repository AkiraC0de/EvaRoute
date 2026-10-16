import prisma from "../lib/prisma.js"
import { UserRole } from "../../generated/prisma/index.js"

/**
 * Dashboard summary aggregates for GET /api/v1/dashboard/summary.
 *
 * One round of grouped queries computes everything the admin Overview needs
 * (facility states, live occupancy from active stays, staff states, rolling
 * activity windows, per-facility load) — replacing the client-side N+1
 * summing the Overview used to do. Scope: pass `facilityId` to scope every
 * number to one facility (FACILITY_STAFF always is), omit it for the whole
 * network (ADMIN).
 *
 * Occupancy semantics match facilityStay.services.getOccupancy: a person is
 * "on site" while their stay has checkedOutAt = null; families = active stays.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const getSummary = async (facilityId?: string) => {
  const facilityWhere = {
    deletedAt: null,
    ...(facilityId ? { id: facilityId } : {})
  }
  const stayWhere = {
    checkedOutAt: null,
    ...(facilityId ? { facilityId } : {})
  }
  const scopedStay = facilityId ? { facilityId } : {}
  const staffWhere = {
    role: UserRole.FACILITY_STAFF,
    ...(facilityId ? { facilityStaff: { facilityId } } : {})
  }

  const now = Date.now()
  const dayAgo = new Date(now - DAY_MS)
  const weekAgo = new Date(now - 7 * DAY_MS)

  const [
    facilityRows,
    deletedCount,
    activeStays,
    checkIns24h,
    checkOuts24h,
    events7d,
    staffTotal,
    staffActive,
    staffUnassigned
  ] = await Promise.all([
    prisma.facility.findMany({
      where: facilityWhere,
      select: { id: true, name: true, status: true, maxCapacity: true }
    }),
    prisma.facility.count({
      where: { deletedAt: { not: null }, ...(facilityId ? { id: facilityId } : {}) }
    }),
    prisma.facilityStay.findMany({
      where: stayWhere,
      select: { id: true, facilityId: true }
    }),
    prisma.facilityStay.count({ where: { checkedInAt: { gte: dayAgo }, ...scopedStay } }),
    prisma.facilityStay.count({ where: { checkedOutAt: { gte: dayAgo }, ...scopedStay } }),
    prisma.activityLog.count({ where: { createdAt: { gte: weekAgo }, ...scopedStay } }),
    prisma.user.count({ where: staffWhere }),
    prisma.user.count({ where: { ...staffWhere, isActive: true } }),
    facilityId
      ? Promise.resolve(0)
      : prisma.user.count({ where: { role: UserRole.FACILITY_STAFF, facilityStaff: null } })
  ])

  const members = activeStays.length
    ? await prisma.facilityStayMember.findMany({
        where: { stayId: { in: activeStays.map((stay) => stay.id) } },
        select: { stayId: true, ageGroup: true }
      })
    : []

  // Roll members up per facility + age group in JS (active population is small).
  const perFacility = new Map<string, { occupied: number; families: number; children: number; adults: number }>()
  const stayFacility = new Map(activeStays.map((stay) => [stay.id, stay.facilityId]))
  for (const stay of activeStays) {
    const entry = perFacility.get(stay.facilityId) ?? { occupied: 0, families: 0, children: 0, adults: 0 }
    entry.families += 1
    perFacility.set(stay.facilityId, entry)
  }
  for (const member of members) {
    const fid = stayFacility.get(member.stayId)
    if (!fid) continue
    const entry = perFacility.get(fid) ?? { occupied: 0, families: 0, children: 0, adults: 0 }
    entry.occupied += 1
    if (member.ageGroup === "CHILD") entry.children += 1
    else entry.adults += 1
    perFacility.set(fid, entry)
  }

  const facilityLoad = facilityRows
    .map((facility) => {
      const live = perFacility.get(facility.id) ?? { occupied: 0, families: 0, children: 0, adults: 0 }
      return {
        id: facility.id,
        name: facility.name,
        status: facility.status as string,
        maxCapacity: facility.maxCapacity,
        occupied: live.occupied,
        families: live.families,
        pct: facility.maxCapacity > 0
          ? Math.round((live.occupied / facility.maxCapacity) * 1000) / 10
          : 0
      }
    })
    .sort((a, b) => b.pct - a.pct)

  const totalCapacity = facilityRows.reduce((sum, f) => sum + f.maxCapacity, 0)
  const totalOccupied = members.length
  const byStatus: Record<string, number> = {}
  for (const facility of facilityRows) {
    byStatus[facility.status as string] = (byStatus[facility.status as string] ?? 0) + 1
  }

  return {
    scope: facilityId ?? "network",
    facilities: {
      total: facilityRows.length,
      byStatus,
      deleted: deletedCount
    },
    capacity: {
      total: totalCapacity,
      occupied: totalOccupied,
      pct: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 1000) / 10 : 0
    },
    occupants: {
      total: totalOccupied,
      children: members.filter((m) => m.ageGroup === "CHILD").length,
      adults: members.filter((m) => m.ageGroup === "ADULT").length,
      families: activeStays.length
    },
    staff: {
      total: staffTotal,
      active: staffActive,
      disabled: staffTotal - staffActive,
      unassigned: staffUnassigned
    },
    activity: {
      last24h: { checkIns: checkIns24h, checkOuts: checkOuts24h },
      last7d: { events: events7d }
    },
    facilityLoad
  }
}

export default {
  getSummary
}
