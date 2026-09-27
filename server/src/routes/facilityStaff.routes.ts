import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import {
  handleDismissStaff,
  handleListStaffs,
  handleGetStaff,
  handlePatchStaff,
  handleCreateStaffAccount,
  handleActivateStaff,
  handleDeactivateStaff,
  handleResetStaffPassword,
  handleDeleteStaff
} from "../controllers/facilityStaff.controllers"

const facilityStaffRoute = express.Router({ mergeParams: true })

// List all staff accounts (filters: unassigned, facilityId, search, status)
facilityStaffRoute.get("/", verifyAuthorization(PERMISSION_TYPES.FETCH_ALL_STAFF), handleListStaffs)

// Fetch a single staff account with their assigned facility
facilityStaffRoute.get("/:userId", verifyAuthorization(PERMISSION_TYPES.FETCH_ALL_STAFF), handleGetStaff)

// Edit a staff account's name fields
facilityStaffRoute.patch("/:userId", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handlePatchStaff)

// create a staff account
facilityStaffRoute.post("/", verifyAuthorization(PERMISSION_TYPES.REGISTER_STAFF_ACC), handleCreateStaffAccount)

// Reactivate a deactivated staff account
facilityStaffRoute.post("/:userId/activate", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleActivateStaff)

// Dismiss or Remove a staff from its current facility
facilityStaffRoute.post("/:userId/dismiss", verifyAuthorization(PERMISSION_TYPES.DISMISS_STAFF), handleDismissStaff)

// Deactivate a staff account and sign them out of all devices
facilityStaffRoute.post("/:userId/deactivate", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleDeactivateStaff)

// Reset a staff account's password to a new default (returned once, response only)
facilityStaffRoute.post("/:userId/reset-password", verifyAuthorization(PERMISSION_TYPES.EDIT_STAFF_ACC), handleResetStaffPassword)

// Permanently delete a staff account (cascades facility membership and sessions)
facilityStaffRoute.delete("/:userId", verifyAuthorization(PERMISSION_TYPES.DELETE_STAFF_ACC), handleDeleteStaff)

export default facilityStaffRoute
