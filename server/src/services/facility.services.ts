import { FacilityStatus, Prisma } from "../../generated/prisma"
import prisma from "../lib/prisma"

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

const create = (data: Prisma.FacilityCreateInput) => {
  return prisma.facility.create({
    data
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

const findMany = (status?: FacilityStatus) => {
  return prisma.facility.findMany({
    where: { deletedAt: null, ...(status ? { status } : {}) },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { staff: true }
      }
    }
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
  findDeletedById,
  softDeleteById,
  restoreById,
  countCheckedInStays,
}