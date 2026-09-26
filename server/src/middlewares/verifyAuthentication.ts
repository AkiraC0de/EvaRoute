import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "express"
import { BadRequestMsgError, UnauthorizedError } from "../core/ApiError"
import { AccessTokenPayload } from "../utils/jwtUtils"
import { extractBearerToken } from "../utils/authUtils"

const verifyAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req)

  const secretKey = process.env.JWT_SECRET_KEY
  if(!secretKey) {
    throw new Error("JWT_SECRET_KEY is missing from .env")
  }

  try {
    const decoded = jwt.verify(token, secretKey) as AccessTokenPayload
    req.auth = {
      userId: decoded.id,
      role: decoded.role

    }
    next()
  } catch {
    throw new UnauthorizedError("Access Token is invalid or expired.")
  }

}

export default verifyAuthentication