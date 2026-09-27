import prisma from "../lib/prisma"
import { Prisma, User } from "../../generated/prisma/client";

const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
  })
}

const findByIdWithFacility = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      facilityStaff: {
        include: { facility: true }
      }
    }
  })
}

const findByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  })
}

const create = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ 
    data
  })
}

const update = (id: string ,data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data
  })
}

const findManyStaff = (filter: {
  unassigned?: boolean
  facilityId?: string
  search?: string
  status?: "ACTIVE" | "INACTIVE"
}) => {
  return prisma.user.findMany({
    where: {
      role: "FACILITY_STAFF",
      ...(filter.status ? { isActive: filter.status === "ACTIVE" } : {}),
      ...(filter.unassigned ? { facilityStaff: null } : {}),
      ...(filter.facilityId ? { facilityStaff: { facilityId: filter.facilityId } } : {}),
      ...(filter.search
        ? {
            OR: [
              { email: { contains: filter.search, mode: "insensitive" } },
              { firstName: { contains: filter.search, mode: "insensitive" } },
              { lastName: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      facilityStaff: {
        include: { facility: true }
      }
    },
    orderBy: { createdAt: "asc" }
  })
}

const setActive = (id: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id },
    data: { isActive }
  })
}

const deleteById = (id: string) => {
  return prisma.user.delete({
    where: { id }
  })
}

const updatePassword = (id: string, newPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      password: newPassword
    }
  })
}

export default {
  create,
  update,
  updatePassword,
  setActive,
  deleteById,
  findManyStaff,
  findById,
  findByIdWithFacility,
  findByEmail
}
