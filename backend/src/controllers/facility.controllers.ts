import { Request, Response } from "express"
import { z } from "zod"
import { FacilityStatus } from "../../generated/prisma"
import { validateData } from "../utils/validatorUtils"
import { createResourceSchema, facilityIdSchema, registerFacilitySchema, resourceIdSchema, updateFacilitySchema, updateResourceSchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import personnelServices from "../services/personnel.services"
import { createPersonnelSchema } from "../validations/personnel.validations"
import { NotFoundError } from "../core/ApiError"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"

const toFacilityResponse = (facility: Awaited<ReturnType<typeof facilityServices.create>>) => ({
  id: facility.id,
  name: facility.name,
  address: facility.address,
  note: facility.note,
  status: facility.status,
  latitude: Number(facility.latitude),
  longitude: Number(facility.longitude),
  createdAt: facility.createdAt,
  resources: facility.resource,
})

const getFacilityId = (req: Request) => validateData(facilityIdSchema, req.params, "params").facilityId
const getResourceIds = (req: Request) => validateData(resourceIdSchema, req.params, "params")

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const facilityData = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  const facility = await facilityServices.create({
    ...facilityData,
    status: facilityData.status as FacilityStatus | undefined,
  })

  return new SuccessResponse(`New facility named ${facility.name} has been registered.`, toFacilityResponse(facility)).send(res)
}

export const handleListFacilities = async (_req: Request, res: Response) => {
  const facilities = await facilityServices.findAll()
  return new SuccessResponse("Facilities fetched.", facilities.map(toFacilityResponse)).send(res)
}

export const handleGetFacility = async (req: Request, res: Response) => {
  const facility = await facilityServices.findById(getFacilityId(req))
  if (!facility) throw new NotFoundError("Facility not found.")
  return new SuccessResponse("Facility fetched.", toFacilityResponse(facility)).send(res)
}

export const handleUpdateFacility = async (req: Request, res: Response) => {
  const facilityId = getFacilityId(req)
  const data = validateData<typeof updateFacilitySchema>(updateFacilitySchema, req.body)
  const existing = await facilityServices.findById(facilityId)
  if (!existing) throw new NotFoundError("Facility not found.")

  const facility = await facilityServices.update(facilityId, {
    ...data,
    status: data.status as FacilityStatus | undefined,
  })
  return new SuccessResponse("Facility updated.", toFacilityResponse(facility)).send(res)
}

export const handleDeleteFacility = async (req: Request, res: Response) => {
  const facilityId = getFacilityId(req)
  const existing = await facilityServices.findById(facilityId)
  if (!existing) throw new NotFoundError("Facility not found.")
  await facilityServices.deleteById(facilityId)
  return new SuccessMsgResponse("Facility deleted.").send(res)
}

export const handleListResources = async (req: Request, res: Response) => {
  const facilityId = getFacilityId(req)
  const facility = await facilityServices.findById(facilityId)
  if (!facility) throw new NotFoundError("Facility not found.")
  return new SuccessResponse("Resources fetched.", await facilityServices.findResources(facilityId)).send(res)
}

export const handleCreateResource = async (req: Request, res: Response) => {
  const facilityId = getFacilityId(req)
  const data = validateData<typeof createResourceSchema>(createResourceSchema, req.body)
  const facility = await facilityServices.findById(facilityId)
  if (!facility) throw new NotFoundError("Facility not found.")
  const resource = await facilityServices.createResource(facilityId, data)
  return new SuccessResponse("Resource created.", resource).send(res)
}

export const handleUpdateResource = async (req: Request, res: Response) => {
  const { facilityId, resourceId } = getResourceIds(req)
  const data = validateData<typeof updateResourceSchema>(updateResourceSchema, req.body)
  const existing = await facilityServices.findResource(facilityId, resourceId)
  if (!existing) throw new NotFoundError("Resource not found.")
  await facilityServices.updateResource(facilityId, resourceId, data)
  const resource = await facilityServices.findResource(facilityId, resourceId)
  return new SuccessResponse("Resource updated.", resource).send(res)
}

export const handleDeleteResource = async (req: Request, res: Response) => {
  const { facilityId, resourceId } = getResourceIds(req)
  const result = await facilityServices.deleteResource(facilityId, resourceId)
  if (!result.count) throw new NotFoundError("Resource not found.")
  return new SuccessMsgResponse("Resource deleted.").send(res)
}

export const handleCreatePersonnel = async (req: Request, res: Response) => {
  const facilityId = getFacilityId(req)
  const data = validateData<typeof createPersonnelSchema>(createPersonnelSchema, req.body)
  const facility = await facilityServices.findById(facilityId)
  if (!facility) throw new NotFoundError("Facility not found.")

  const personnel = await personnelServices.create(facilityId, data.email, data.firstName, data.lastName)
  return new SuccessResponse("Facility personnel account created and invitation sent.", personnel).send(res)
}

export const handleGetMyFacility = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  return new SuccessResponse("Facility fetched.", toFacilityResponse(facility)).send(res)
}

export const handleUpdateMyFacility = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  const data = validateData<typeof updateFacilitySchema>(updateFacilitySchema, req.body)
  const updated = await facilityServices.update(facility.id, {
    ...data,
    status: data.status as FacilityStatus | undefined,
  })
  return new SuccessResponse("Facility updated.", toFacilityResponse(updated)).send(res)
}

export const handleListMyResources = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  return new SuccessResponse("Resources fetched.", await facilityServices.findResources(facility.id)).send(res)
}

export const handleCreateMyResource = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  const data = validateData<typeof createResourceSchema>(createResourceSchema, req.body)
  const resource = await facilityServices.createResource(facility.id, data)
  return new SuccessResponse("Resource created.", resource).send(res)
}

export const handleUpdateMyResource = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  const resourceId = validateData(z.object({ resourceId: z.uuid() }), req.params, "params").resourceId
  const data = validateData<typeof updateResourceSchema>(updateResourceSchema, req.body)
  const existing = await facilityServices.findResource(facility.id, resourceId)
  if (!existing) throw new NotFoundError("Resource not found.")
  await facilityServices.updateResource(facility.id, resourceId, data)
  return new SuccessResponse("Resource updated.", await facilityServices.findResource(facility.id, resourceId)).send(res)
}

export const handleDeleteMyResource = async (req: Request, res: Response) => {
  if (!req.auth) throw new NotFoundError("Facility assignment not found.")
  const facility = await facilityServices.findByStaffId(req.auth.userId)
  if (!facility) throw new NotFoundError("Facility assignment not found.")
  const resourceId = validateData(z.object({ resourceId: z.uuid() }), req.params, "params").resourceId
  const result = await facilityServices.deleteResource(facility.id, resourceId)
  if (!result.count) throw new NotFoundError("Resource not found.")
  return new SuccessMsgResponse("Resource deleted.").send(res)
}