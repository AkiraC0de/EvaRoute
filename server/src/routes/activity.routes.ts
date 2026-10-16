import { Router } from "express"
import { handleGetActivities, handleGetActivityStats } from "../controllers/activity.controllers.js"
import verifyAuthentication from '../middlewares/verifyAuthentication.js'
import verifyAuthorization from '../middlewares/verifyAuthorization.js'
import { PERMISSION_TYPES } from "../configs/permissionConfig.js"

const activityRoute = Router()

activityRoute.get(
  "/stats",
  verifyAuthentication,
  verifyAuthorization(PERMISSION_TYPES.FETCH_ACTIVITY),
  handleGetActivityStats
)

activityRoute.get(
  "/",
  verifyAuthentication,
  verifyAuthorization(PERMISSION_TYPES.FETCH_ACTIVITY),
  handleGetActivities
)

export default activityRoute
