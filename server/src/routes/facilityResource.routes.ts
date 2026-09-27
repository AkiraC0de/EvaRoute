import express from 'express'
import verifyAuthentication from '../middlewares/verifyAuthentication'
import verifyAuthorization from '../middlewares/verifyAuthorization'
import { PERMISSION_TYPES } from '../configs/permissionConfig'

import {
  handleGetResources,
  handleGetResource,
  handleCreateResource,
  handleUpdateResource,
  handleDeleteResource
} from '../controllers/facilityResource.controllers'

const facilityResourceRoute = express.Router({ mergeParams: true })

facilityResourceRoute.use(verifyAuthentication)

// List resources of a facility
facilityResourceRoute.get('/', verifyAuthorization(PERMISSION_TYPES.FETCH_RESOURCE), handleGetResources)

// Fetch a single resource
facilityResourceRoute.get('/:resourceId', verifyAuthorization(PERMISSION_TYPES.FETCH_RESOURCE), handleGetResource)

// Create a new resource
facilityResourceRoute.post('/', verifyAuthorization(PERMISSION_TYPES.EDIT_RESOURCE), handleCreateResource)

// Update a resource (adjust counts / availability)
facilityResourceRoute.patch('/:resourceId', verifyAuthorization(PERMISSION_TYPES.EDIT_RESOURCE), handleUpdateResource)

// Delete a resource
facilityResourceRoute.delete('/:resourceId', verifyAuthorization(PERMISSION_TYPES.EDIT_RESOURCE), handleDeleteResource)

export default facilityResourceRoute
