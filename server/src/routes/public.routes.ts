import express from "express"

import {
  handleGetPublicFacilities,
  handleGetRouteToFacility
} from "../controllers/public.controllers.js"
import rateLimit from "../middlewares/rateLimit.js"

const publicRoute = express.Router()

// Public: no auth — consumed by the public React app (clients/public).
// Bounded per IP: the routing endpoint proxies to a paid upstream and both
// endpoints scan the facility table per request.
const publicLimiter = rateLimit({
  scope: "public",
  windowMs: 60_000,
  max: 30,
  message: "Too many requests. Please slow down."
})

// List facilities (end-user view), optionally with distance from a point
publicRoute.get("/facility", publicLimiter, handleGetPublicFacilities)

// Route/directions from a point to a specific facility
publicRoute.get("/route/:facilityId", publicLimiter, handleGetRouteToFacility)

export default publicRoute
