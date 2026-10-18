/**
 * EvaRoute Staff (admin client) API — public surface.
 *
 * This barrel re-exports every domain module so `lib/api` keeps working as a
 * single import target (`import * as api from "../lib/api"`, `import { login }
 * from "../../lib/api"`, `import { ApiError } from "../../lib/api"`).
 *
 * Modules:
 *   client.js    — request core, ApiError, access-token storage, session refresh
 *   auth.js      — login, sign-out, password reset / change
 *   facility.js  — assigned facility, facility CRUD, facility staff assignment
 *   resources.js — facility resource CRUD
 *   staff.js     — staff account management
 *   stays.js     — stays / occupancy / check-in / check-out
 *   activity.js  — activity log + stats
 *   dashboard.js — dashboard summary
 */

// client.js is re-exported by name (not `export *`) so the barrel's public
// surface stays identical to the old flat api.js — `request` is exported from
// client.js for the sibling domain modules but is NOT part of the public API.
export {
  ApiError,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  setUnauthorizedHandler,
  refreshSession,
  refreshAccessToken,
} from "./client.js";
export * from "./auth.js";
export * from "./facility.js";
export * from "./resources.js";
export * from "./staff.js";
export * from "./stays.js";
export * from "./activity.js";
export * from "./dashboard.js";
