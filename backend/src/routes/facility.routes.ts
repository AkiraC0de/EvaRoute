import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import facilityStaffRoute from "./facilityStaff.routes"

import {
  handleDeleteFacility,
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
facilityRoute.use("/:facilityId/staff", facilityStaffRoute)

export default facilityRoute
