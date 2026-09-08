import prisma from "../lib/prisma"
import { Prisma, TokenType, Token } from "../../generated/prisma/client";

const findByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.findUnique({
    where: { 
      userId_type: {
        userId,
        type
      }
    }
  })
}

const deleteByUserIdType = (userId: string, type: TokenType) => {
  return prisma.token.delete({
    where: { 
      userId_type: {
        userId,
        type
      }
    }
  })
}

export const create = (data: Prisma.TokenCreateInput) => {
  return prisma.token.create({
    data
  })
}

export const createEmailVerify = (userId: string, otp: string, expiresAt: Date) => {
  return prisma.token.create({
    data: {
      userId,
      type: "EMAIL_VERIFY",
      expiresAt,
      payload: {
        otp,
        attempt: 0
      }
    }
  })
}