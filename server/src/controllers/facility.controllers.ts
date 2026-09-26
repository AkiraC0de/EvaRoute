import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { getFacilityQuerySchema, patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { BadRequestMsgError, ForbiddenError, NotFoundError } from "../core/ApiError"
import { UserRole } from "../../generated/prisma"
import facilityStaffServices from "../services/facilityStaff.services"
import { requireAuth } from "../utils/authUtils"
import { toFacilityDTO } from "../utils/facilityUtils"

export const handleGetFacility = async (req: Request, res: Response) => {
  const { role } = requireAuth(req)
  const { status } = validateData<typeof getFacilityQuerySchema>(getFacilityQuerySchema, req.query, "query")

  switch (role){
    case UserRole.ADMIN:
      return handleAdminGetFacility(res, status)

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

// Admin: ALL facilities
const handleAdminGetFacility = async (res: Response, status?: "AVAILABLE" | "UNAVAILABLE") => {
  const facilities = await facilityServices.findMany(status)
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
  
  await facilityServices.create(facilityData)

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
    await facilityServices.restoreById(facilityId)
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

  return new SuccessMsgResponse(`Facility ${facility.name} has been deleted.`).send(res)
}

export const handlePatchFacility = async (req: Request, res: Response) => {
  const { userId, role } = requireAuth(req)
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  if(role !== UserRole.ADMIN){
    const isMember = await facilityStaffServices.findStaff(facilityId, userId)
    if(!isMember){
      throw new BadRequestMsgError("You are not part of this facility.")
    }
  }

  const data = validateData<typeof patchFacilitySchema>(patchFacilitySchema, req.body)

  const updatedFacility = await facilityServices.update(facilityId, data)

  return new SuccessResponse(`${facility.name} has been patched.`, updatedFacility).send(res)
}
