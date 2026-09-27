import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import facilityStaffRoute from "./facilityStaff.routes"
import facilityResourceRoute from "./facilityResource.routes"

import {
  handleDeleteFacility,
  handlePatchFacility,
  handleRegisterFacility,
  handleGetFacility
} from "../controllers/facility.controllers"

const facilityRoute = express.Router()

// Every facility route requires authentication (nested routers inherit this too)
facilityRoute.use(verifyAuthentication)

// fetch facility
facilityRoute.get("/", verifyAuthorization(PERMISSION_TYPES.FETCH_FACILITY), handleGetFacility)

// Register new facility on the map
facilityRoute.post("/", verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

// soft delete facility
facilityRoute.delete("/:facilityId", verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleDeleteFacility)

// patch facility's data, such as status
facilityRoute.patch("/:facilityId", verifyAuthorization(PERMISSION_TYPES.EDIT_FACILITY), handlePatchFacility)

// Staff membership
facilityRoute.use("/:facilityId/staff", facilityStaffRoute)

// Resources
facilityRoute.use("/:facilityId/resource", facilityResourceRoute)

export default facilityRoute
