/**
 * User roles, mirroring the server's UserRole enum
 * (server/prisma/schema.prisma) and the ROLE_PERMISSIONS map
 * (server/src/configs/permissionConfig.ts).
 *
 * NOTE ON SECURITY: hiding nav items and guarding routes here are UI
 * conveniences, not a security boundary. Every API route already enforces its
 * own authorization server-side (verifyAuthorization + ROLE_PERMISSIONS), so a
 * tampered client gains nothing. Keep both layers in sync when adding roles.
 */
export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  FACILITY_STAFF: "FACILITY_STAFF",
});

/** Roles that may use the staff portal at all. */
export const ALL_PORTAL_ROLES = Object.freeze([ROLES.ADMIN, ROLES.FACILITY_STAFF]);

/** True when `user` holds one of `roles`. */
export const hasRole = (user, roles) => Boolean(user && roles.includes(user.role));
