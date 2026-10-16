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

const create = (data: Prisma.FacilityStayCreateInput) => {
  return prisma.facilityStay.create({
    data,
    include: { members: true }
  })
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
