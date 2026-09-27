import prisma from "../lib/prisma"

const findMembershipByUserId = (userId: string) => {
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

const transferStaff = (userId: string, newFacilityId: string) => {
  return prisma.facilityStaff.update({
    where: { userId },
    data: { facilityId: newFacilityId }
  })
}

const deleteStaff = (facilityId: string, userId: string) => {
  return prisma.facilityStaff.delete({
    where: {
      facilityId_userId: {
        facilityId,
        userId
      }
    }
  })
}

export default {
  findMembershipByUserId,
  findByFacilityId,
  findStaff,
  create,
  transferStaff,
  deleteStaff
}
