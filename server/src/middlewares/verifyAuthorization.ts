import { UserRole } from "../../generated/prisma/index.js"
import { Request, Response, NextFunction } from "express"
import { ForbiddenError } from "../core/ApiError.js"
import { PermissionsType, ROLE_PERMISSIONS } from "../configs/permissionConfig.js"

// This middleware should always be used after verifyAuthentication
// As it relies on req.user value from access token payload

const verifyAuthorization = (requiredPermissions: PermissionsType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Optional chaining + ?? false: a role missing from ROLE_PERMISSIONS is a
    // 403 (unknown role has no permissions), never a TypeError-turned-500.
    if (!req.auth || !(ROLE_PERMISSIONS[req.auth.role]?.includes(requiredPermissions) ?? false)) {
      throw new ForbiddenError( "You do not have permission to access this resource.")
    }

    next()
  }
} 

export default verifyAuthorization