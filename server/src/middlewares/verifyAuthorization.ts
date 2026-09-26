import { UserRole } from "../../generated/prisma"
import { Request, Response, NextFunction } from "express"
import { ForbiddenError } from "../core/ApiError"
import { PermissionsType, ROLE_PERMISSIONS } from "../configs/permissionConfig"

// This middleware should always be used after verifyAuthentication
// As it relies on req.user value from access token payload

const verifyAuthorization = (requiredPermissions: PermissionsType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !ROLE_PERMISSIONS[req.auth.role].includes(requiredPermissions)) {
      throw new ForbiddenError( "You do not have permission to access this resource.")
    }

    next()
  }
} 

export default verifyAuthorization