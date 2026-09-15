import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import { 
  handleAssignStaff,
  handleGetFacilityStaffs,
  handlePatchFacility,
  handleRegisterFacility
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

// facilityRoute.get("/") // NOT DONE

facilityRoute.post("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

// Asssign staff to facility
facilityRoute.post("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleAssignStaff)

// List staffs of a facility
facilityRoute.get("/:facilityId/staff", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleGetFacilityStaffs)

// Not done
facilityRoute.delete("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleRegisterFacility)

facilityRoute.patch("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.EDIT_FACILITY), handlePatchFacility)

export default facilityRoute