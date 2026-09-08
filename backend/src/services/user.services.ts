import prisma from "../lib/prisma"
import { Prisma } from "../../generated/prisma/client";

export const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
  })
}

export const findByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  })
}

export const create = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ 
    data
  })
}

export const update = (id: string ,data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data
  })
}

export const updatePassword = (id: string, newPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      password: newPassword
    }
  })
}
