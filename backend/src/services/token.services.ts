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
        attempt: 0
      }
    }
  })
}

const createReqResetPass = (userId: string, otp: string, token: string, expiresAt?: Date) => {
  const EXPIRATION_IN_MIN = 15

  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_IN_MIN)
  
  return prisma.token.create({
    data: {
      userId,
      type: "REQ_RESET_PASS",
      expiresAt : expiresAt ?? expirationDate,
      token,
      payload: {
        otp,
        attempt: 0
      }
    }
  })
}


export default {
  findByUserIdType,
  deleteByUserIdType,
  create,
  createEmailVerify,
  createReqResetPass,
}