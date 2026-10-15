import { Router } from "express"
import { handleGetDashboardSummary } from "../controllers/dashboard.controllers"
import verifyAuthentication from "../middlewares/verifyAuthentication"
import verifyAuthorization from "../middlewares/verifyAuthorization"
import { PERMISSION_TYPES } from "../configs/permissionConfig"

const dashboardRoute = Router()

dashboardRoute.get(
  "/summary",
  verifyAuthentication,
  verifyAuthorization(PERMISSION_TYPES.FETCH_DASHBOARD),
  handleGetDashboardSummary
)

export default dashboardRoute
