import { Request, Response } from 'express'
import { validateData, parseUuidParam } from '../utils/validatorUtils.js'
import { createResourceSchema, updateResourceSchema } from '../validations/facilityResource.validations.js'

import facilityResourceServices from '../services/facilityResource.services.js'
import { SuccessMsgResponse, SuccessResponse } from '../core/ApiResponse.js'
import { BadRequestMsgError, NotFoundError } from '../core/ApiError.js'
import { assertFacilityAccess } from '../utils/facilityUtils.js'
import { isEssentialName } from '../utils/essentialResources.js'
import { ActivityAction } from '../../generated/prisma/index.js'
import { logActivity } from '../utils/activityUtils.js'

export const handleGetResources = async (req: Request, res: Response) => {
  const facilityId = parseUuidParam(req.params.facilityId, 'facilityId')

  const facility = await assertFacilityAccess(req, facilityId)

  const resources = await facilityResourceServices.findByFacilityId(facilityId)

  return new SuccessResponse(
    `Resources of facility ${facility.name}.`,
    { resources, count: resources.length }
  ).send(res)
}

export const handleGetResource = async (req: Request, res: Response) => {
  const facilityId = parseUuidParam(req.params.facilityId, 'facilityId')
  const resourceId = parseUuidParam(req.params.resourceId, 'resourceId')

  await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  return new SuccessResponse('Resource fetched.', { resource }).send(res)
}

export const handleCreateResource = async (req: Request, res: Response) => {
  const facilityId = parseUuidParam(req.params.facilityId, 'facilityId')

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

  // The unique (facilityId, name) constraint backs the pre-check above — a
  // concurrent create that slips past it still gets the friendly 400.
  const resource = await facilityResourceServices.create({
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable ?? null,
    availableValue: data.availableValue ?? null,
    maxValue: data.maxValue ?? null,
    facility: { connect: { id: facilityId } }
  }).catch((err: { code?: string }) => {
    if (err?.code === "P2002") {
      throw new BadRequestMsgError('A resource with this name already exists in this facility.')
    }
    throw err
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
  const facilityId = parseUuidParam(req.params.facilityId, 'facilityId')
  const resourceId = parseUuidParam(req.params.resourceId, 'resourceId')

  const facility = await assertFacilityAccess(req, facilityId)

  const resource = await facilityResourceServices.findById(resourceId)
  if(!resource || resource.facilityId !== facilityId){
    throw new NotFoundError('Resource not found.')
  }

  const data = validateData<typeof updateResourceSchema>(updateResourceSchema, req.body)

  // Mandatory essentials keep their contract exactly like the delete path:
  // they may not be renamed to arbitrary names or have their type altered.
  if (
    resource.essentialType &&
    ((data.name !== undefined && data.name !== resource.name) ||
      (data.type !== undefined && data.type !== resource.type))
  ) {
    throw new BadRequestMsgError('Essential resources cannot be renamed or have their type changed. Update its status instead.')
  }

  // Type invariants hold for the EFFECTIVE type (incoming `type` if provided,
  // otherwise the existing row's) — even when `type` is absent from the patch.
  const effectiveType = data.type ?? resource.type
  if (effectiveType === 'QUANTITY') {
    if (data.isAvailable !== undefined) {
      throw new BadRequestMsgError('isAvailable must not be set for QUANTITY resources.')
    }
    const newAvailable = data.availableValue ?? resource.availableValue
    const newMax = data.maxValue ?? resource.maxValue
    if (newAvailable !== null && newMax !== null && newAvailable > newMax) {
      throw new BadRequestMsgError('availableValue cannot exceed maxValue.')
    }
  }
  if (effectiveType === 'BOOLEAN') {
    if (data.availableValue !== undefined) {
      throw new BadRequestMsgError('availableValue must not be set for BOOLEAN resources.')
    }
    if (data.maxValue !== undefined) {
      throw new BadRequestMsgError('maxValue must not be set for BOOLEAN resources.')
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

  // A type flip must not leave the old type's fields behind — null the stale
  // opposite-type fields in the same write.
  const typeFlip = data.type !== undefined && data.type !== resource.type
  // Same P2002 backstop as create: a concurrent rename into an occupied name
  // is caught by the unique (facilityId, name) constraint, not a 500.
  const updatedResource = await facilityResourceServices.update(resourceId, {
    name: data.name,
    type: data.type,
    isAvailable: data.isAvailable,
    availableValue: data.availableValue,
    maxValue: data.maxValue,
    ...(typeFlip
      ? data.type === 'QUANTITY'
        ? { isAvailable: null }
        : { availableValue: null, maxValue: null }
      : {})
  }).catch((err: { code?: string }) => {
    if (err?.code === "P2002") {
      throw new BadRequestMsgError('A resource with this name already exists in this facility.')
    }
    throw err
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
  const facilityId = parseUuidParam(req.params.facilityId, 'facilityId')
  const resourceId = parseUuidParam(req.params.resourceId, 'resourceId')

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
