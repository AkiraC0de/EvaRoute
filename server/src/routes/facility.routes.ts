import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication.js'
import verifyAuthorization from '../middlewares/verifyAuthorization.js'
import { PERMISSION_TYPES } from '../configs/permissionConfig.js'

import facilityStaffRoute from "./facilityStaff.routes.js"
import facilityResourceRoute from "./facilityResource.routes.js"
import facilityStayRoute from "./facilityStay.routes.js"

import {
  handleDeleteFacility,
  handlePatchFacility,
  handleRegisterFacility,
  handleGetFacility,
  handleBulkToggleFacilities
} from "../controllers/facility.controllers.js"

const facilityRoute = express.Router()

// Every facility route requires authentication (nested routers inherit this too)
facilityRoute.use(verifyAuthentication)

// fetch facility
facilityRoute.get("/", verifyAuthorization(PERMISSION_TYPES.FETCH_FACILITY), handleGetFacility)

// Register new facility on the map
facilityRoute.post("/", verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

// bulk soft delete / restore (registry bulk actions; ADMIN)
facilityRoute.post("/bulk-toggle", verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleBulkToggleFacilities)

// soft delete facility
facilityRoute.delete("/:facilityId", verifyAuthorization(PERMISSION_TYPES.DELETE_FACILITY), handleDeleteFacility)

// patch facility's data, such as status
facilityRoute.patch("/:facilityId", verifyAuthorization(PERMISSION_TYPES.EDIT_FACILITY), handlePatchFacility)

// Staff membership
facilityRoute.use("/:facilityId/staff", facilityStaffRoute)

// Resources
facilityRoute.use("/:facilityId/resource", facilityResourceRoute)

// Stays (evacuee check-in / check-out)
facilityRoute.use("/:facilityId/stay", facilityStayRoute)

export default facilityRoute
