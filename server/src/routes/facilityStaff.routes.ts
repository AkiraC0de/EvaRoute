import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import {
  handleGetFacilityStaffs,
  handleAssignStaff,
  handleDismissStaff
} from "../controllers/facilityStaff.controllers"

const facilityStaffRoute = express.Router({ mergeParams: true })

facilityStaffRoute.use(verifyAuthentication)

// List members of a facility
facilityStaffRoute.get("/", verifyAuthorization(PERMISSION_TYPES.FETCH_STAFF), handleGetFacilityStaffs)

// Assign, or transfer, a staff to this facility
facilityStaffRoute.post("/:userId", verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleAssignStaff)

// Dismiss a staff from this facility
facilityStaffRoute.delete("/:userId", verifyAuthorization(PERMISSION_TYPES.DISMISS_STAFF), handleDismissStaff)

export default facilityStaffRoute
