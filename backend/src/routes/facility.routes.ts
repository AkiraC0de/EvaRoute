import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { UserRole } from '../../generated/prisma'

import { 
  handleRegisterFacility
} from '../controllers/facility.controllers'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

const facilityRoute = express.Router()

// facilityRoute.get("/") // NOT DONE

facilityRoute.post("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.REGISTER_FACILITY), handleRegisterFacility)

facilityRoute.patch("/", verifyAuthentication, verifyAuthorization(PERMISSION_TYPES.PATCH_FACILITY), handleRegisterFacility)

export default facilityRoute