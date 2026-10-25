import prisma from "../lib/prisma.js"
import { EvacueeAgeGroup, FacilityStatus } from "../../generated/prisma/index.js"
import { BadRequestMsgError, NotFoundError } from "../core/ApiError.js"

const findById = (stayId: string) => {
  return prisma.facilityStay.findUnique({
    where: { id: stayId },
    include: { members: true, facility: true }
  })
}

// Abuse bound, NOT pagination: stay history is append-only and every stay
// nests its members, so cap what a single listing can pull. Newest first with
// an `id` tiebreaker — matches the (facilityId, checkedInAt) supporting index
// and keeps ordering stable when several stays share a checkedInAt.
const STAY_LIST_MAX = 1000

const findByFacilityId = (facilityId: string, status?: "ACTIVE" | "CHECKED_OUT") => {
  return prisma.facilityStay.findMany({
    where: {
      facilityId,
      ...(status === "ACTIVE" ? { checkedOutAt: null } : {}),
      ...(status === "CHECKED_OUT" ? { checkedOutAt: { not: null } } : {})
    },
    include: { members: true },
    orderBy: [{ checkedInAt: "desc" }, { id: "asc" }],
    take: STAY_LIST_MAX
  })
}

/**
 * Human-readable Check-In ID: "0001" — zero-padded, sequential per facility
 * (4 digits, cap 9999 per center; a center is never expected to exceed it).
 * The unique (facilityId, checkInCode) index backs it.
 */
const CHECK_IN_CODE_CAP = 9999

type CheckInData = {
  familyName: string
  members: { fullName: string; ageGroup: EvacueeAgeGroup }[]
}

/**
 * Transactional check-in: capacity guard, stay + members insert and ticket
 * allocation commit atomically. The facility row lock serializes concurrent
 * check-ins per facility (and with it the code allocation), so the guard can
 * no longer be raced and codes can no longer collide.
 */
const checkIn = async (facilityId: string, data: CheckInData) => {
  return prisma.$transaction(async (tx) => {
    // Serialize per facility — first statement, before any read.
    // The deletedAt filter pairs with softDeleteById's lock: a check-in either
    // lands before a delete (the delete then sees the stay and refuses) or
    // after it (this lookup matches nothing and the check-in 404s).
    await tx.$queryRaw`SELECT id FROM "facilities" WHERE id = ${facilityId}::uuid AND "deletedAt" IS NULL FOR UPDATE`

    const facility = await tx.facility.findFirst({
      where: { id: facilityId, deletedAt: null },
      select: { name: true, maxCapacity: true, status: true }
    })
    if (!facility) {
      throw new NotFoundError("Facility not found.")
    }

    // UNAVAILABLE facilities cannot accept check-ins (public listings already
    // hide them). LIMITED is a legacy legal value that still accepts check-ins.
    if (facility.status === FacilityStatus.UNAVAILABLE) {
      throw new BadRequestMsgError(`Facility ${facility.name} is currently unavailable and cannot accept check-ins.`)
    }

    // Idempotency guard under the facility lock: one ACTIVE stay per family
    // name per facility — a retried check-in (timeout, double-click) must not
    // create a second stay and consume a second batch of slots. Name matching
    // is case-insensitive (same family, different casing on retry).
    const activeStay = await tx.facilityStay.findFirst({
      where: {
        facilityId,
        checkedOutAt: null,
        familyName: { equals: data.familyName, mode: "insensitive" }
      },
      select: { id: true }
    })
    if (activeStay) {
      throw new BadRequestMsgError(`Family ${data.familyName} is already checked in to facility ${facility.name}. Check them out before checking in again.`)
    }

    // Capacity guard, re-checked under the lock: the whole family must fit.
    const activeMembers = await tx.facilityStayMember.count({
      where: { stay: { facilityId, checkedOutAt: null } }
    })
    const remaining = facility.maxCapacity - activeMembers
    if (data.members.length > remaining) {
      throw new BadRequestMsgError(
        `Not enough capacity for this household. Only ${remaining} slot${remaining === 1 ? '' : 's'} left in facility ${facility.name}.`
      )
    }

    // Allocate from MAX(checkInCode)+1 (NOT count()+1 — deletion gaps would
    // otherwise land on an existing code forever).
    const rows = await tx.$queryRaw<{ max: number | null }[]>`SELECT MAX("checkInCode"::int) AS max FROM "facility_stays" WHERE "facilityId" = ${facilityId}::uuid`
    const seq = (rows[0]?.max ?? 0) + 1
    if (seq > CHECK_IN_CODE_CAP) {
      throw new BadRequestMsgError("This facility has reached its maximum check-in capacity of 9999.")
    }

    return tx.facilityStay.create({
      data: {
        familyName: data.familyName,
        checkInCode: String(seq).padStart(4, "0"),
        facility: { connect: { id: facilityId } },
        members: {
          create: data.members.map(member => ({
            fullName: member.fullName,
            ageGroup: member.ageGroup
          }))
        }
      },
      include: { members: true }
    })
  })
}

/**
 * Conditional check-out: only flips stays that are still checked in, so a
 * concurrent double check-out cannot overwrite checkedOutAt. Returns the
 * updateMany result — `count === 0` means "already checked out".
 */
const checkOut = (stayId: string) => {
  return prisma.facilityStay.updateMany({
    where: { id: stayId, checkedOutAt: null },
    data: { checkedOutAt: new Date() }
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
  checkIn,
  checkOut,
  countActiveMembers,
  getOccupancy
}
