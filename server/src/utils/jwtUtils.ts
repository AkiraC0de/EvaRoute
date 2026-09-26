import { Request } from 'express'
import jwt from "jsonwebtoken"
import { Token, TokenType, UserRole, Prisma  } from "../../generated/prisma"

export type AuthContext = {
  userId: string,
  role: UserRole
}

export type TokenWithUser = Prisma.TokenGetPayload<{
  include: {
    user: true
  }
}>

export type AccessTokenPayload = {
  id: string,
  role: UserRole
}

// to be able to set the decoded jwt access token in req.auth 
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext,
      token?: TokenWithUser
    }
  }
}

export const createAccessToken = (payload: AccessTokenPayload) => {
  const secretKey = process.env.JWT_SECRET_KEY
  if(!secretKey) {
    throw new Error("JWT_SECRET_KEY is missing from .env")
  }

  return jwt.sign(payload, secretKey, {
    expiresIn: "15m"
  })
}

export const verifyAccessToken = (token: string) => {
  const secretKey = process.env.JWT_SECRET_KEY
  if(!secretKey) {
    throw new Error("JWT_SECRET_KEY is missing from .env")
  }

  return jwt.verify(token, secretKey) 
}