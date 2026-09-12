import prisma from "../lib/prisma"
import { Prisma, TokenType, Token } from "../../generated/prisma/client";

const findByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.findFirst({
    where: { 
      userId,
      type
    }
  })
}

const findByToken = (token: string, type: TokenType) => {
  return prisma.token.findUnique({
    where: {
      token,
      type
    },
    include: {
      user: true,
    },
  })
}

const deleteByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.deleteMany({
    where: {
      userId,
      type
    }
  })
}

const create = (data: Prisma.TokenCreateInput) => {
  return prisma.token.create({
    data
  })
}

const createEmailVerify = (userId: string, otp: string, token: string, expiresAt?: Date) => {
  const EXPIRATION_IN_MIN = 15

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_IN_MIN)
  
  return prisma.token.create({
    data: {
      userId,
      type: "EMAIL_VERIFY",
      expiresAt : expiresAt ?? expirationDate,
      token,
      payload: {
        otp,
        attempts: 0
      }
    }
  })
}

const createReqResetPass = (userId: string, hashOtp: string, hashToken: string, expiresAt?: Date) => {
  const EXPIRATION_IN_MIN = 15

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_IN_MIN)
  
  return prisma.token.create({
    data: {
      userId,
      type: TokenType.REQ_RESET_PASS,
      expiresAt : expiresAt ?? expirationDate,
      token: hashToken,
      payload: {
        otp: hashOtp,
        attempts: 0
      }
    }
  })
}

const createResetPass = (userId: string, hashToken: string, expiresAt?: Date) => {
  const EXPIRATION_IN_MIN = 15

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_IN_MIN)
  
  return prisma.token.create({
    data: {
      userId,
      type: TokenType.RESET_PASS,
      expiresAt : expiresAt ?? expirationDate,
      token: hashToken
    }
  })
}

const incrementAttemptById = async (tokenId: string) => {
  const token = await prisma.token.findUnique({
    where: {
      id: tokenId
    }
  })

  if (!token) {
    throw new Error("Token not found.")
  }

  const payload = token.payload as {
    otp: string
    attempts: number
  }

  return prisma.token.update({
    where: {
      id: tokenId
    },
    data: {
      payload: {
        ...payload,
        attempts: payload.attempts + 1
      }
    }
  })
}

const deleteById = (tokenId: string) => {
  return prisma.token.delete({
    where: {
      id: tokenId
    }
  })
}

export default {
  findByUserIdType,
  deleteByUserIdType,
  create,
  createEmailVerify,
  createReqResetPass,
  findByToken,
  incrementAttemptById,
  deleteById,
  createResetPass
}