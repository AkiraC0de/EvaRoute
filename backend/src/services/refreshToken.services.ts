import { REFRESH_TOKEN } from "../configs/tokenConfig"
import prisma from "../lib/prisma"

const create = (userId: string, tokenHash: string, expiresAt?: Date) => {
  const defaultExpirationDate = new Date()
  defaultExpirationDate.setDate(REFRESH_TOKEN.DEFAULT_EXPIRATION_IN_DAYS)
  return prisma.refreshToken.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt: expiresAt ?? defaultExpirationDate
    }
  })
}

const deleteById = (tokenId: string) => {
  return prisma.refreshToken.delete({
    where: {
      id: tokenId
    }
  })
} 

const deleteByToken = (token: string) => {
  return prisma.refreshToken.delete({
    where: {
      token
    }
  })
}

export default {
  deleteById,
  deleteByToken,
  create
}