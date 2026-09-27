import express from "express"

import {
  handleGetPublicFacilities,
  handleGetRouteToFacility
} from "../controllers/public.controllers"

const publicRoute = express.Router()

// Public: no auth — consumed by the public React app (clients/public)

// List facilities (end-user view), optionally with distance from a point
publicRoute.get("/facility", handleGetPublicFacilities)

// Route/directions from a point to a specific facility
publicRoute.get("/route/:facilityId", handleGetRouteToFacility)

export default publicRoute
