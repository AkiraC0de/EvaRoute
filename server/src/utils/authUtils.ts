import crypto from "crypto"
import { BadRequestMsgError } from "../core/ApiError"
import { Request } from "express"
import { AuthContext, TokenWithUser } from "./jwtUtils"
import { Prisma, Token, User } from "../../generated/prisma"
import { REFRESH_TOKEN } from "../configs/tokenConfig"

// return random 5 digit string
export const generateOTP = () => {
  return crypto.randomInt(10000, 100000).toString() 
}

export const cryptoHash = (string: string) => {
  return crypto.createHash("sha256")
                   .update(string)
                   .digest("hex");
}

export const cryptoHashCompare = (string: string, hashString: string) => {
  const hashedInputString = crypto.createHash("sha256")
                   .update(string)
                   .digest("hex");

  return hashedInputString === hashString
}

export const generateCryptoTokenHash = () => {
  const token = generateCryptoToken()
  const tokenHash = cryptoHash(token)

  return [token, tokenHash]
}

export const generateCryptoToken = () => {
  const TOKEN_BYTES = 32; // 256 bits of entropy

  return crypto.randomBytes(TOKEN_BYTES).toString('hex')
}

export const extractBearerToken = (req: Request) => {
  const authorization = req.headers.authorization || req.headers.Authorization as String
  if(!authorization) {
      throw new BadRequestMsgError('Authorization in request headers is required.')
  }
  
  if(!authorization.startsWith('Bearer ')) {
      throw new BadRequestMsgError('Invalid Authorization format. Valid : Bearer <token>')
  }
  // Extract the token from authorization
  return authorization.split(' ')[1]
}

export const requireAuth = (req: Request): AuthContext => {
  if (!req.auth) {
    throw new Error("Authentication required.")
  }

  return req.auth
}

export const requireToken = (req: Request): TokenWithUser => {
  if (!req.token) {
    throw new Error("Token required.")
  }

  return req.token
}

export const getRefeshTokenExpirationDate = (keepLogin: boolean) => {
  const date = new Date()
  if (!keepLogin) {
    date.setHours(
      date.getHours() + 1
    )
  } else {
    date.setDate(
      date.getDate() + REFRESH_TOKEN.DEFAULT_EXPIRATION_IN_DAYS
    )
  }

  return date;
}