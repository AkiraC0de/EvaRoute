import prisma from "../lib/prisma"
import { Prisma } from "../../generated/prisma/client"

const findById = (id: string) => {
  return prisma.facilityStaff.findUnique({
    where: { id },
    include: {
      user: true,
      facility: true
    }
  })
}

const findByUserId = (userId: string) => {
  return prisma.facilityStaff.findUnique({
    where: { userId },
    include: {
      facility: true
    }
  })
}

const findByFacilityId = (facilityId: string) => {
  return prisma.facilityStaff.findMany({
    where: { facilityId },
    include: {
      user: true
    }
  })
}


const findStaff = (facilityId: string, userId: string) => {
  return prisma.facilityStaff.findUnique({
    where: { 
      facilityId_userId: {
        userId,
        facilityId
      }
     },
    include: {
      user: true
    }
  })
}

const create = (facilityId: string, userId: string) => {
  return prisma.facilityStaff.create({
  data: {
    user: {
      connect: {
        id: userId
      }
    },
    facility: {
      connect: {
        id: facilityId
      }
    }
  }
})
}

const update = (id: string, data: Prisma.FacilityStaffUpdateInput) => {
  return prisma.facilityStaff.update({
    where: { id },
    data
  })
}

const deleteById = (id: string) => {
  return prisma.facilityStaff.delete({
    where: { id }
  })
}

export default {
  findById,
  findByUserId,
  findByFacilityId,
  create,
  update,
  deleteById,
  findStaff
}
