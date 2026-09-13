import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { UserRole } from '../../generated/prisma'

import { 
  handleRegisterFacility
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

facilityRoute.post("/", verifyAuthentication, verifyAuthorization(UserRole.ADMIN), handleRegisterFacility)

export default facilityRoute