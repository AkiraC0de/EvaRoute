import { Request, Response } from 'express'
import { validateData } from '../utils/validatorUtils'
import { createResourceSchema, updateResourceSchema } from '../validations/facilityResource.validations'

import facilityServices from '../services/facility.services'
import facilityStaffServices from '../services/facilityStaff.services'
import facilityResourceServices from '../services/facilityResource.services'
import { SuccessMsgResponse, SuccessResponse } from '../core/ApiResponse'
import { BadRequestMsgError, ForbiddenError, NotFoundError } from '../core/ApiError'
import { requireAuth } from '../utils/authUtils'
import { UserRole } from '../../generated/prisma'

// Shared access check: admin may access any facility; staff only their own.
const assertFacilityAccess = async (req: Request, facilityId: string) => {
  const { userId, role } = requireAuth(req)

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError('Facility not found.')
  }

  if (role !== UserRole.ADMIN) {
    const isMember = await facilityStaffServices.findStaff(facilityId, userId)
    if(!isMember){
      throw new ForbiddenError('You are not part of this facility.')
    }
  }

  return facility
}

const paramErr = (names: string[]) => `Missing required parameter${names.length > 1 ? 's' : ''}: ${names.join(', ')}.`

export const handleGetResources = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError(paramErr(['facilityId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const resources = await facilityResourceServices.findByFacilityId(facilityId)

  return new SuccessResponse(
    `Resources of facility ${facility.name}.`,
    { resources, count: resources.length }
  ).send(res)
}

export const handleGetResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const resourceId = req.params.resourceId as string
  if(!facilityId || !resourceId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'resourceId']))
  }

  await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  return new SuccessResponse('Resource fetched.', { resource }).send(res)
}

export const handleCreateResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError(paramErr(['facilityId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const data = validateData<typeof createResourceSchema>(createResourceSchema, req.body)

  const duplicate = await facilityResourceServices.findByNameInFacility(facilityId, data.name)
  if(duplicate){
    throw new BadRequestMsgError('A resource with this name already exists in this facility.')
  }

  const resource = await facilityResourceServices.create({
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable ?? null,
    availableValue: data.availableValue ?? null,
    maxValue: data.maxValue ?? null,
    facility: { connect: { id: facilityId } }
  })

  return new SuccessResponse(`Resource ${data.name} has been added to facility ${facility.name}.`, { resource }).send(res)
}

export const handleUpdateResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const resourceId = req.params.resourceId as string
  if(!facilityId || !resourceId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'resourceId']))
  }

  await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  const data = validateData<typeof updateResourceSchema>(updateResourceSchema, req.body)

  // Cross-field guard: combined update must stay valid for the resource type
  const effectiveType = data.type ?? resource.type
  if (effectiveType === 'QUANTITY') {
    const newAvailable = data.availableValue ?? resource.availableValue
    const newMax = data.maxValue ?? resource.maxValue
    if (newAvailable !== null && newMax !== null && newAvailable > newMax) {
      throw new BadRequestMsgError('availableValue cannot exceed maxValue.')
    }
  }

  if (data.name && data.name !== resource.name) {
    const duplicate = await facilityResourceServices.findByNameInFacility(facilityId, data.name)
    if(duplicate){
      throw new BadRequestMsgError('A resource with this name already exists in this facility.')
    }
  }

  const updatedResource = await facilityResourceServices.update(resourceId, {
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable,
    availableValue: data.availableValue,
    maxValue: data.maxValue
  })

  return new SuccessResponse(`Resource ${updatedResource.name} has been updated.`, { resource: updatedResource }).send(res)
}

export const handleDeleteResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const resourceId = req.params.resourceId as string
  if(!facilityId || !resourceId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'resourceId']))
  }

  await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  await facilityResourceServices.deleteById(resourceId)

  return new SuccessMsgResponse(`Resource ${resource.name} has been removed from the facility.`).send(res)
}
