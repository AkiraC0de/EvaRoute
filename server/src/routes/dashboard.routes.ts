import { Router } from "express"
import { handleGetDashboardSummary } from "../controllers/dashboard.controllers.js"
import verifyAuthentication from "../middlewares/verifyAuthentication.js"
import verifyAuthorization from "../middlewares/verifyAuthorization.js"
import { PERMISSION_TYPES } from "../configs/permissionConfig.js"

const dashboardRoute = Router()

dashboardRoute.get(
  "/summary",
  verifyAuthentication,
  verifyAuthorization(PERMISSION_TYPES.FETCH_DASHBOARD),
  handleGetDashboardSummary
)

export default dashboardRoute
