import { UserRole } from "../../generated/prisma"
import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "express"
import { BadRequestMsgError, UnauthorizedError } from "../core/ApiError"
import { AccessTokenPayload } from "../utils/jwtUtils"

const verifyAuthentication = (requiredRole: UserRole) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization || req.headers.Authorization as String
    if(!authorization) {
        throw new BadRequestMsgError('Authorization in request headers is required.')
    }
    
    if(!authorization.startsWith('Bearer ')) {
        throw new BadRequestMsgError('Invalid Authorization format. Valid : Bearer <token>')
    }
    // Extract the token from authorization
    const token = authorization.split(' ')[1]

    const secretKey = process.env.JWT_SECRET_KEY
    if(!secretKey) {
      throw new Error("JWT_SECRET_KEY is missing from .env")
    }

    try {
      const user = jwt.verify(token, secretKey) as AccessTokenPayload
      req.user = user
      next()
    } catch {
      throw new UnauthorizedError(
        "Access Token is invalid or expired."
      )
    }

  }
}

export default verifyAuthentication