import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "express"
import { BadRequestMsgError, ForbiddenError, UnauthorizedError } from "../core/ApiError.js"
import { AccessTokenPayload } from "../utils/jwtUtils.js"
import { extractBearerToken } from "../utils/authUtils.js"
import userService from "../services/user.services.js"

const verifyAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req)

  const secretKey = process.env.JWT_SECRET_KEY
  if(!secretKey) {
    throw new Error("JWT_SECRET_KEY is missing from .env")
  }

  let decoded: AccessTokenPayload
  try {
    decoded = jwt.verify(token, secretKey) as AccessTokenPayload
  } catch {
    throw new UnauthorizedError("Access Token is invalid or expired.")
  }

  // The JWT alone is not authority: re-check the account on every request so a
  // deleted user loses access immediately, a deactivated one gets a clear 403,
  // and a demoted user can never act with their stale token role (the token's
  // role may be up to 15 minutes old). The DB role wins.
  const user = await userService.findById(decoded.id)
  if (!user) {
    throw new UnauthorizedError("Access Token is invalid or expired.")
  }
  if (!user.isActive) {
    throw new ForbiddenError("This account has been deactivated. Contact an administrator.")
  }

  req.auth = {
    userId: user.id,
    role: user.role
  }
  next()
}

export default verifyAuthentication