import { FacilityStatus, Prisma } from "../../generated/prisma"
import prisma from "../lib/prisma"

const findById = (facilityId: string) => {
  return prisma.facility.findUnique({
    where: {
      id: facilityId
    }
  })
}

const findByLongLat = (location: [longitude: number, latitude: number] ) => {
  return prisma.facility.findUnique({
    where: {
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

export default {
  create,
  update,
  updateStatus,
  deleteById,
  findByLongLat,
  findById,
}