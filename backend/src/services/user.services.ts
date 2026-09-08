import prisma from "../lib/prisma"
import { Prisma } from "../../generated/prisma/client";

const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
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
  findById,
  findByEmail
}
