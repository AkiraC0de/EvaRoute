import express from "express"
import verifyAuthentication from "../middlewares/verifyAuthentication"
import verifyAuthorization from "../middlewares/verifyAuthorization"
import { PERMISSION_TYPES } from "../configs/permissionConfig"

import {
  handleCreateStaffAccount,
  handleListStaffs,
  handleGetStaff,
  handlePatchStaff,
  handleActivateStaff,
  handleDeactivateStaff,
  handleResetStaffPassword,
  handleDeleteStaff
} from "../controllers/staff.controllers"

const staffRoute = express.Router()

staffRoute.use(verifyAuthentication)

// Create a new staff account (returns a one-time default password)
staffRoute.post("/", verifyAuthorization(PERMISSION_TYPES.REGISTER_STAFF_ACC), handleCreateStaffAccount)

// List all staff accounts (filters: unassigned, facilityId, search, status)
staffRoute.get("/", verifyAuthorization(PERMISSION_TYPES.FETCH_ALL_STAFF), handleListStaffs)

// Fetch a single staff account with their assigned facility
staffRoute.get("/:userId", verifyAuthorization(PERMISSION_TYPES.FETCH_ALL_STAFF), handleGetStaff)

// Edit a staff account's name fields
staffRoute.patch("/:userId", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handlePatchStaff)

// Reactivate a deactivated staff account
staffRoute.post("/:userId/activate", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleActivateStaff)

// Deactivate a staff account and sign them out of all devices
staffRoute.post("/:userId/deactivate", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleDeactivateStaff)

// Reset a staff account's password to a new default (returned once, response only)
staffRoute.post("/:userId/reset-password", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleResetStaffPassword)

// Permanently delete a staff account (cascades facility membership and sessions)
staffRoute.delete("/:userId", verifyAuthorization(PERMISSION_TYPES.DELETE_STAFF_ACC), handleDeleteStaff)

export default staffRoute
