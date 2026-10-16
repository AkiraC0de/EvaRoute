import { Request, Response } from 'express'
import { validateData, paramErr } from '../utils/validatorUtils.js'
import { createResourceSchema, updateResourceSchema } from '../validations/facilityResource.validations.js'

import facilityResourceServices from '../services/facilityResource.services.js'
import { SuccessMsgResponse, SuccessResponse } from '../core/ApiResponse.js'
import { BadRequestMsgError, NotFoundError } from '../core/ApiError.js'
import { assertFacilityAccess } from '../utils/facilityUtils.js'
import { isEssentialName } from '../utils/essentialResources.js'
import { ActivityAction } from '../../generated/prisma/index.js'
import { logActivity } from '../utils/activityUtils.js'

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

  // The three mandatory essentials are managed by the facility itself — a
  // custom resource may not shadow one (that's how accidental duplicates
  // happen), whether created or renamed into the name.
  if(isEssentialName(data.name)){
    throw new BadRequestMsgError('Essential resources are part of every facility — update its status instead of creating a copy.')
  }

  const resource = await facilityResourceServices.create({
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable ?? null,
    availableValue: data.availableValue ?? null,
    maxValue: data.maxValue ?? null,
    facility: { connect: { id: facilityId } }
  })

  await logActivity(req, ActivityAction.RESOURCE_CREATED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: resource.id, label: resource.name },
    metadata: {
      type: resource.type,
      availableValue: resource.availableValue,
      maxValue: resource.maxValue,
      isAvailable: resource.isAvailable
    }
  })

  return new SuccessResponse(`Resource ${data.name} has been added to facility ${facility.name}.`, { resource }).send(res)
}

export const handleUpdateResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const resourceId = req.params.resourceId as string
  if(!facilityId || !resourceId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'resourceId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

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

    // The three mandatory essentials are managed by the facility itself — a
    // custom resource may not shadow one (that's how accidental duplicates
    // happen), whether created or renamed into the name.
    if(isEssentialName(data.name)){
      throw new BadRequestMsgError('Essential resources are part of every facility — update its status instead of creating a copy.')
    }
  }

  const updatedResource = await facilityResourceServices.update(resourceId, {
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable,
    availableValue: data.availableValue,
    maxValue: data.maxValue
  })

  await logActivity(req, ActivityAction.RESOURCE_UPDATED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: resource.id, label: updatedResource.name },
    metadata: {
      before: {
        name: resource.name,
        type: resource.type,
        isAvailable: resource.isAvailable,
        availableValue: resource.availableValue,
        maxValue: resource.maxValue
      },
      after: {
        name: updatedResource.name,
        type: updatedResource.type,
        isAvailable: updatedResource.isAvailable,
        availableValue: updatedResource.availableValue,
        maxValue: updatedResource.maxValue
      }
    }
  })

  return new SuccessResponse(`Resource ${updatedResource.name} has been updated.`, { resource: updatedResource }).send(res)
}

export const handleDeleteResource = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  const resourceId = req.params.resourceId as string
  if(!facilityId || !resourceId){
    throw new BadRequestMsgError(paramErr(['facilityId', 'resourceId']))
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  // Mandatory essentials are never removable through the resource API.
  if(resource.essentialType){
    throw new BadRequestMsgError('Essential resources cannot be removed. Update its status instead.')
  }

  await facilityResourceServices.deleteById(resourceId)

  await logActivity(req, ActivityAction.RESOURCE_DELETED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: resourceId, label: resource.name }
  })

  return new SuccessMsgResponse(`Resource ${resource.name} has been removed from the facility.`).send(res)
}
