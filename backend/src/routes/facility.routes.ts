import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { UserRole } from '../../generated/prisma'

import { 
  handleDeleteFacility,
  handleGetFacility,
  handleListFacilities,
  handleListResources,
  handleCreateResource,
  handleUpdateResource,
  handleDeleteResource,
  handleCreatePersonnel,
  handleGetMyFacility,
  handleListMyResources,
  handleCreateMyResource,
  handleUpdateMyResource,
  handleDeleteMyResource,
  handleUpdateMyFacility,
  handleRegisterFacility,
  handleUpdateFacility,
} from '../controllers/facility.controllers'

const facilityRoute = express.Router()

const staffRoute = express.Router()
staffRoute.use(verifyAuthentication, verifyAuthorization(UserRole.FACILITY_STAFF))
staffRoute.get("/", handleGetMyFacility)
staffRoute.patch("/", handleUpdateMyFacility)
staffRoute.get("/resources", handleListMyResources)
staffRoute.post("/resources", handleCreateMyResource)
staffRoute.patch("/resources/:resourceId", handleUpdateMyResource)
staffRoute.delete("/resources/:resourceId", handleDeleteMyResource)

facilityRoute.use(verifyAuthentication, verifyAuthorization(UserRole.ADMIN))
facilityRoute.get("/", handleListFacilities)
facilityRoute.post("/", handleRegisterFacility)
facilityRoute.get("/:facilityId", handleGetFacility)
facilityRoute.patch("/:facilityId", handleUpdateFacility)
facilityRoute.delete("/:facilityId", handleDeleteFacility)
facilityRoute.get("/:facilityId/resources", handleListResources)
facilityRoute.post("/:facilityId/resources", handleCreateResource)
facilityRoute.patch("/:facilityId/resources/:resourceId", handleUpdateResource)
facilityRoute.delete("/:facilityId/resources/:resourceId", handleDeleteResource)
facilityRoute.post("/:facilityId/staff", handleCreatePersonnel)

export { staffRoute }

export default facilityRoute