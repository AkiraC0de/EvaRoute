import { UserRole } from "../../generated/prisma"
import { Response, NextFunction } from "express"
import { RequestAfterAuth } from "../utils/jwtUtils"
import { ForbiddenError } from "../core/ApiError"

// This middleware should always be used after verifyAuthentication
// As it relies on req.user value from access token payload

const verifyAuthorization = (requiredUserRole: UserRole) => {
  return (req: RequestAfterAuth, res: Response, next: NextFunction) => {
    if (req.auth.role !== requiredUserRole) {
      throw new ForbiddenError( "You do not have permission to access this resource.")
    }

    next()
  }
} 

export default verifyAuthorization