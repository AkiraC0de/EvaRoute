import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import { 
  handlePatchFacility,
  handleRegisterFacility
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

// facilityRoute.get("/") // NOT DONE

facilityRoute.post("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

facilityRoute.patch("/:facilityId", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.PATCH_FACILITY), handlePatchFacility)

export default facilityRoute