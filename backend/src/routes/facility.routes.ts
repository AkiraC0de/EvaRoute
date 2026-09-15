import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import { 
  handleAssignStaff,
  handleDismissStaff,
  handleGetFacilityStaffs,
  handlePatchFacility,
  handleRegisterFacility
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

// facilityRoute.get("/") // NOT DONE

facilityRoute.post("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

// Not done
facilityRoute.delete("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleRegisterFacility)

facilityRoute.patch("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.EDIT_FACILITY), handlePatchFacility)

// -- Staffs

// List staffs of a facility
facilityRoute.get("/:facilityId/staff", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.FETCH_STAFF), handleGetFacilityStaffs)

// Asssign staff to facility
facilityRoute.post("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleAssignStaff)

// dismiss staff to facility
facilityRoute.delete("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DISMISS_STAFF), handleDismissStaff)

 
export default facilityRoute