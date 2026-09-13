import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { UserRole } from '../../generated/prisma'

import { 
  handleRegisterFacility
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

facilityRoute.get("/") // NOT DONE

facilityRoute.post("/", verifyAuthentication, verifyAuthorization([UserRole.ADMIN, UserRole.FACILITY_STAFF]), handleRegisterFacility)

facilityRoute.patch("/", verifyAuthentication, verifyAuthorization([UserRole.ADMIN, UserRole.FACILITY_STAFF]))

export default facilityRoute