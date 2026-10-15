import { Router } from "express"
import { handleGetActivities, handleGetActivityStats } from "../controllers/activity.controllers"
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from "../configs/permissionConfig"

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
