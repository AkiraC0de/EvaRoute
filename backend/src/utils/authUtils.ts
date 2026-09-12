import crypto from "crypto"
import { BadRequestMsgError } from "../core/ApiError"
import { Request } from "express"
import { AuthContext } from "./jwtUtils"

// return random 5 digit string
export const generateOTP = () => {
  return crypto.randomInt(10000, 100000).toString() 
}

export const cryptoHash = (string: string, hashingAlorithm: string = "sha256") => {
  return crypto.createHash("sha256")
                   .update(string)
                   .digest("hex");
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

export function requireAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw new Error("Authentication required.")
  }

  return req.auth
}