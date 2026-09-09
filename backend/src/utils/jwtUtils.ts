import jwt from "jsonwebtoken"
import { UserRole  } from "../../generated/prisma"

type AccessTokenPayload = {
  id: string,
  role: UserRole
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