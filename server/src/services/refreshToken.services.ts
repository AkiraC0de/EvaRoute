import { REFRESH_TOKEN } from "../configs/tokenConfig"
import prisma from "../lib/prisma"
import { getRefeshTokenExpirationDate } from "../utils/authUtils"

const findByToken = (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      token: tokenHash
    }
  })
}

const create = (userId: string, tokenHash: string, expiresAt?: Date) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt: expiresAt ?? getRefeshTokenExpirationDate(true)
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

// Sign-out-all-others: kill every session of a user except the given one.
const deleteAllByUserIdExcept = (userId: string, keepTokenId: string) => {
  return prisma.refreshToken.deleteMany({
    where: {
      userId,
      id: { not: keepTokenId }
    }
  })
}

// Kill every session of a user (no exceptions).
const deleteAllByUserId = (userId: string) => {
  return prisma.refreshToken.deleteMany({
    where: { userId }
  })
}

export default {
  deleteById,
  deleteByToken,
  create,
  findByToken,
  deleteAllByUserIdExcept,
  deleteAllByUserId
}