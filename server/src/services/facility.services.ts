import { EssentialResourceType, FacilityStatus, Prisma } from "../../generated/prisma/index.js"
import prisma from "../lib/prisma.js"
import { ESSENTIAL_RESOURCES } from "../utils/essentialResources.js"

const findById = (facilityId: string) => {
  return prisma.facility.findFirst({
    where: {
      id: facilityId,
      deletedAt: null
    }
  })
}

const findByLongLat = (location: [longitude: number, latitude: number] ) => {
  return prisma.facility.findUnique({
    where: {
      deletedAt: null,
      longitude_latitude: {
        longitude: new Prisma.Decimal(location[0]),
        latitude: new Prisma.Decimal(location[1])
      }
    }
  })
}

/**
 * Registers a facility together with its three mandatory essential resources
 * in ONE transaction — a facility can never exist half-configured. Caller may
 * pre-set initial availability per essential; anything omitted defaults to
 * Unavailable (never assume a service exists just because the facility does).
 */
const create = async (
  data: Prisma.FacilityCreateInput,
  essentials?: ReadonlyArray<{ essentialType: EssentialResourceType; isAvailable: boolean }>
) => {
  return prisma.$transaction(async (tx) => {
    const facility = await tx.facility.create({ data })

    const requested = new Map((essentials ?? []).map((entry) => [entry.essentialType, entry.isAvailable]))
    await tx.facilityResource.createMany({
      data: ESSENTIAL_RESOURCES.map((entry) => ({
        facilityId: facility.id,
        name: entry.name,
        type: "BOOLEAN" as const,
        isAvailable: requested.get(entry.type) ?? false,
        essentialType: entry.type,
      })),
    })

    return facility
  })
} 

const update = (facilityId: string, data: Prisma.FacilityUpdateInput) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data
  })
}  

const updateStatus = (facilityId: string, status: FacilityStatus) => {
  return prisma.facility.update({
    where: {
      id: facilityId
    },
    data: {
      status
    }
  })
} 

const deleteById = (facilityId: string) => {
  return prisma.facility.delete({
    where: {
      id: facilityId
    }
  })
}

const findMany = (status?: FacilityStatus, deleted?: boolean) => {
  return prisma.facility.findMany({
    where: {
      ...(deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { staff: true }
      }
    }
  })
}

const findManyAvailableWithResources = () => {
  return prisma.facility.findMany({
    where: { deletedAt: null, status: FacilityStatus.AVAILABLE },
    include: { resource: true },
    orderBy: { createdAt: "asc" },
  })
}
const findDeletedById = (facilityId: string) => {
  return prisma.facility.findFirst({
    where: { id: facilityId, deletedAt: { not: null } }
  })
}

const softDeleteById = (facilityId: string) => {
  return prisma.facility.update({
    where: { id: facilityId },
    data: { deletedAt: new Date() }
  })
}

const restoreById = (facilityId: string) => {
  return prisma.facility.update({
    where: { id: facilityId },
    data: { deletedAt: null }
  })
}

const countCheckedInStays = (facilityId: string) => {
  return prisma.facilityStay.count({
    where: { facilityId, checkedOutAt: null }
  })
}

export default {
  create,
  update,
  updateStatus,
  deleteById,
  findByLongLat,
  findById,
  findMany,
  findManyAvailableWithResources,
  findDeletedById,
  softDeleteById,
  restoreById,
  countCheckedInStays,
}