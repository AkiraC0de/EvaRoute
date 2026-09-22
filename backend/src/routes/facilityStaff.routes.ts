import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import {
  handleAssignStaff,
  handleTransferStaff,
  handleDismissStaff,
  handleGetFacilityStaffs
} from "../controllers/facilityStaff.controllers"

const facilityStaffRoute = express.Router({ mergeParams: true })

// List staffs of a facility
facilityStaffRoute.get("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.FETCH_STAFF), handleGetFacilityStaffs)

// Asssign staff to facility
facilityStaffRoute.post("/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleAssignStaff)

// Transfer staff between facilities (PATCH)
facilityStaffRoute.patch("/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleTransferStaff)

// dismiss staff to facility
facilityStaffRoute.delete("/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DISMISS_STAFF), handleDismissStaff)

export default facilityStaffRoute
