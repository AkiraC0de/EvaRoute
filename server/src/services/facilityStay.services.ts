import prisma from "../lib/prisma.js"
import { Prisma } from "../../generated/prisma/index.js"

const findById = (stayId: string) => {
  return prisma.facilityStay.findUnique({
    where: { id: stayId },
    include: { members: true, facility: true }
  })
}

const findByFacilityId = (facilityId: string, status?: "ACTIVE" | "CHECKED_OUT") => {
  return prisma.facilityStay.findMany({
    where: {
      facilityId,
      ...(status === "ACTIVE" ? { checkedOutAt: null } : {}),
      ...(status === "CHECKED_OUT" ? { checkedOutAt: { not: null } } : {})
    },
    include: { members: true },
    orderBy: { checkedInAt: "desc" }
  })
}

/**
 * Human-readable Check-In ID: "0001" — zero-padded, sequential per facility
 * (4 digits, cap 9999 per center; a center is never expected to exceed it).
 * The unique (facilityId, checkInCode) index backs it; a collision (concurrent
 * check-ins racing the counter) retries before giving up.
 */
const generateCheckInCode = async (facilityId: string): Promise<string> => {
  const seq = (await prisma.facilityStay.count({ where: { facilityId } })) + 1
  return String(seq).padStart(4, "0")
}

const create = async (data: Omit<Prisma.FacilityStayCreateInput, "checkInCode">) => {
  const facilityId = (data.facility as { connect: { id: string } }).connect.id
  for (let attempt = 0; attempt <= 3; attempt += 1) {
    try {
      return await prisma.facilityStay.create({
        data: { ...data, checkInCode: await generateCheckInCode(facilityId) },
        include: { members: true }
      })
    } catch (err) {
      // P2002 = unique-constraint violation on (facilityId, checkInCode) ->
      // try the next number.
      const isUniqueViolation = (err as { code?: string })?.code === "P2002"
      if (!isUniqueViolation || attempt === 3) throw err
    }
  }
  throw new Error("Could not allocate a check-in code.")
}

const checkOut = (stayId: string) => {
  return prisma.facilityStay.update({
    where: { id: stayId },
    data: { checkedOutAt: new Date() },
    include: { members: true }
  })
}

// Every person currently checked in (both age groups), used for the capacity guard.
const countActiveMembers = (facilityId: string) => {
  return prisma.facilityStayMember.count({
    where: { stay: { facilityId, checkedOutAt: null } }
  })
}

const getOccupancy = async (facilityId: string) => {
  const grouped = await prisma.facilityStayMember.groupBy({
    by: ["ageGroup"],
    where: { stay: { facilityId, checkedOutAt: null } },
    _count: { _all: true }
  })

  const adults = grouped.find(g => g.ageGroup === "ADULT")?._count._all ?? 0
  const children = grouped.find(g => g.ageGroup === "CHILD")?._count._all ?? 0

  const families = await prisma.facilityStay.count({
    where: { facilityId, checkedOutAt: null }
  })

  return { families, adults, children, members: adults + children }
}

export default {
  findById,
  findByFacilityId,
  create,
  checkOut,
  countActiveMembers,
  getOccupancy
}
