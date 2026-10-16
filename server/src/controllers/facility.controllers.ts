import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils.js"
import { getFacilityQuerySchema, patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations.js"

import facilityServices from "../services/facility.services.js"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js"
import { BadRequestMsgError, ForbiddenError, NotFoundError } from "../core/ApiError.js"
import { UserRole, ActivityAction, Prisma } from "../../generated/prisma/index.js"
import facilityStaffServices from "../services/facilityStaff.services.js"
import { requireAuth } from "../utils/authUtils.js"
import { assertFacilityAccess, toFacilityDTO } from "../utils/facilityUtils.js"
import { logActivity } from "../utils/activityUtils.js"

export const handleGetFacility = async (req: Request, res: Response) => {
  const { role } = requireAuth(req)
  const { status, deleted } = validateData<typeof getFacilityQuerySchema>(getFacilityQuerySchema, req.query, "query")

  // Soft-deleted listing is an ADMIN concern (it feeds the restore flow).
  if (deleted && role !== UserRole.ADMIN) {
    throw new ForbiddenError()
  }

  switch (role){
    case UserRole.ADMIN:
      return handleAdminGetFacility(res, status, deleted)

    case UserRole.FACILITY_STAFF:
      return handleStaffGetFacility(req, res, status)

    default:
      throw new ForbiddenError()
  }
}

// Staff: ONLY the facility assigned to them (a staff can be assigned to ONE facility)
const handleStaffGetFacility = async (req: Request, res: Response, status?: "AVAILABLE" | "UNAVAILABLE") => {
  const { userId } = requireAuth(req)
  const membership = await facilityStaffServices.findMembershipByUserId(userId)

  if (!membership || membership.facility.deletedAt !== null) {
    return new SuccessResponse("You are not assigned to any facility.", { facility: null }).send(res)
  }

  const facility = toFacilityDTO(membership.facility)
  if (status && facility.status !== status) {
    return new SuccessResponse("You are not assigned to any facility.", { facility: null }).send(res)
  }

  return new SuccessResponse("Your assigned facility.", { facility }).send(res)
}

// Admin: ALL facilities (soft-deleted included only on request)
const handleAdminGetFacility = async (res: Response, status?: "AVAILABLE" | "UNAVAILABLE", deleted?: boolean) => {
  const facilities = await facilityServices.findMany(status, deleted)
  const formatedFacilities = facilities.map(f => ({
    ...toFacilityDTO(f),
    staffCount: f._count.staff
  }))

  return new SuccessResponse("All facilities fetched.",{ facilities: formatedFacilities, count: formatedFacilities.length }).send(res)
}

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const facilityData = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  const facilityExistOnLocation = await facilityServices.findByLongLat([facilityData.longitude, facilityData.latitude])
  if(facilityExistOnLocation){
    throw new BadRequestMsgError("There is an existing facility on the location. Please select a new location point")
  }
  
  const createdFacility = await facilityServices.create(facilityData)

  await logActivity(req, ActivityAction.FACILITY_CREATED, {
    facility: { id: createdFacility.id, name: createdFacility.name },
    target: { id: createdFacility.id, label: createdFacility.name },
    metadata: { maxCapacity: createdFacility.maxCapacity }
  })

  return new SuccessResponse(`New facility named ${facilityData.name} has been registered.`, facilityData).send(res)
}

export const handleDeleteFacility = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  // Toggle: if the facility is soft-deleted, DELETE restores it.
  const deletedFacility = await facilityServices.findDeletedById(facilityId)
  if(deletedFacility){
    // A soft-deleted facility's coordinates may have been taken by a new facility meanwhile.
    const conflicting = await facilityServices.findByLongLat([
      Number(deletedFacility.longitude),
      Number(deletedFacility.latitude)
    ])
    if (conflicting) {
      throw new BadRequestMsgError(`Cannot restore facility ${deletedFacility.name}: its location is now occupied by facility ${conflicting.name}. Update its coordinates first.`)
    }

    await facilityServices.restoreById(facilityId)
    await logActivity(req, ActivityAction.FACILITY_RESTORED, {
      facility: { id: deletedFacility.id, name: deletedFacility.name },
      target: { id: deletedFacility.id, label: deletedFacility.name }
    })
    return new SuccessMsgResponse(`Facility ${deletedFacility.name} has been restored.`).send(res)
  }

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  // Occupancy guard: cannot delete while evacuees are checked in.
  const checkedInCount = await facilityServices.countCheckedInStays(facilityId)
  if(checkedInCount > 0){
    throw new BadRequestMsgError("Cannot delete a facility with checked-in evacuees. Please check them out first.")
  }

  await facilityServices.softDeleteById(facilityId)

  await logActivity(req, ActivityAction.FACILITY_DELETED, {
    facility: { id: facility.id, name: facility.name },
    target: { id: facility.id, label: facility.name }
  })

  return new SuccessMsgResponse(`Facility ${facility.name} has been deleted.`).send(res)
}

export const handlePatchFacility = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  const facility = await assertFacilityAccess(req, facilityId)

  const data = validateData<typeof patchFacilitySchema>(patchFacilitySchema, req.body)

  // Coordinate-conflict guard: reject early instead of letting Prisma's P2002 become a 500.
  const effectiveLongitude = data.longitude ?? Number(facility.longitude)
  const effectiveLatitude = data.latitude ?? Number(facility.latitude)
  if (
    data.longitude !== undefined ||
    data.latitude !== undefined
  ) {
    const conflicting = await facilityServices.findByLongLat([effectiveLongitude, effectiveLatitude])
    if (conflicting && conflicting.id !== facilityId) {
      throw new BadRequestMsgError("There is an existing facility on this location. Please select a new location point.")
    }
  }

  const updatedFacility = await facilityServices.update(facilityId, data)

    // Log only the fields that actually changed (small diffs keep the log lean).
    const before: Prisma.InputJsonValue = {}
    const after: Prisma.InputJsonValue = {}
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      ;(before as Record<string, unknown>)[key] = (facility as Record<string, unknown>)[key]
      ;(after as Record<string, unknown>)[key] = data[key]
    }

    await logActivity(req, ActivityAction.FACILITY_UPDATED, {
      facility: { id: facility.id, name: facility.name },
      target: { id: facility.id, label: facility.name },
      metadata: { before, after }
    })

    return new SuccessResponse(`${facility.name} has been patched.`, updatedFacility).send(res)
}
