import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import {
  handleGetStays,
  handleGetOccupancy,
  handleGetStay,
  handleCheckIn,
  handleCheckOut
} from '../controllers/facilityStay.controllers'

const facilityStayRoute = express.Router({ mergeParams: true })

facilityStayRoute.use(verifyAuthentication)

// List stays of a facility (optionally ?status=ACTIVE|CHECKED_OUT)
facilityStayRoute.get('/', verifyAuthorization(PERMISSION_TYPES.FETCH_STAY), handleGetStays)

// Occupancy summary (families, adults, children, remaining capacity)
facilityStayRoute.get('/occupancy', verifyAuthorization(PERMISSION_TYPES.FETCH_STAY), handleGetOccupancy)

// Fetch a single stay with its members
facilityStayRoute.get('/:stayId', verifyAuthorization(PERMISSION_TYPES.FETCH_STAY), handleGetStay)

// Check in a family with its members
facilityStayRoute.post('/', verifyAuthorization(PERMISSION_TYPES.CHECK_IN), handleCheckIn)

// Check out a checked-in family
facilityStayRoute.post('/:stayId/checkout', verifyAuthorization(PERMISSION_TYPES.CHECK_OUT), handleCheckOut)

export default facilityStayRoute
