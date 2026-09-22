import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import { 
  handleAssignStaff,
  handleTransferStaff,
  handleDeleteFacility,
  handleDismissStaff,
  handleGetFacilityStaffs,
  handlePatchFacility,
  handleRegisterFacility,
  handleGetFacility
} from "../controllers/facility.controllers"

const facilityRoute = express.Router()

// fetch facility  
facilityRoute.get("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.FETCH_FACILITY), handleGetFacility)

// Register new facility on the map
facilityRoute.post("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

// soft delete facility
facilityRoute.delete("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleDeleteFacility)

// patch facility's data, such as status
facilityRoute.patch("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.EDIT_FACILITY), handlePatchFacility)

// -- Staffs

// List staffs of a facility
facilityRoute.get("/:facilityId/staff", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.FETCH_STAFF), handleGetFacilityStaffs)

// Asssign staff to facility
facilityRoute.post("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleAssignStaff)

// Transfer staff between facilities (PATCH)
facilityRoute.patch("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.ASSIGN_STAFF), handleTransferStaff)

// dismiss staff to facility
facilityRoute.delete("/:facilityId/staff/:userId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.DISMISS_STAFF), handleDismissStaff)

 
export default facilityRoute