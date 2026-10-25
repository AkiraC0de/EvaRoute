import { REFRESH_TOKEN } from "../configs/tokenConfig.js"
import prisma from "../lib/prisma.js"
import { getRefreshTokenExpirationDate } from "../utils/authUtils.js"

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
      expiresAt: expiresAt ?? getRefreshTokenExpirationDate(true)
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

// Rotation grace: mark a rotated row instead of deleting it (see
// REFRESH_TOKEN.ROTATION_GRACE_MS). `expiresAt` is deliberately left alone —
// it carries the session horizon (30d keep-login vs 1h) and grace-window
// successors must inherit the ORIGINAL horizon, not a shortened one.
// Idempotent: only the FIRST rotation stamps the row (updateMany with
// rotatedAt: null) — a replay of an already-rotated token must not extend its
// grace window.
const markRotated = (tokenId: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      id: tokenId,
      rotatedAt: null
    },
    data: {
      rotatedAt: new Date()
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
  markRotated,
  deleteAllByUserIdExcept,
  deleteAllByUserId
}