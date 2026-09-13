import { FacilityStatus, Prisma } from "../../generated/prisma"
import prisma from "../lib/prisma"

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
}