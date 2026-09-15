import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { BadRequestError, BadRequestMsgError, NotFoundError } from "../core/ApiError"
import userServices from "../services/user.services"
import { UserRole } from "../../generated/prisma"
import facilityStaffServices from "../services/facilityStaff.services"

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

}



export const handlePatchFacility = async (req: Request, res: Response) => {
  const data = validateData<typeof patchFacilitySchema>(patchFacilitySchema, req.body)

  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("facilityId is required as parameter.")
  }

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  const updatedFacility = await facilityServices.update(facilityId, data)

  return new SuccessResponse(`${facility.name} has been patched.`, updatedFacility).send(res)
}


// STAFFS

export const handleGetFacilityStaffs = async (req: Request, res: Response) => {
  const facilityId = req.params.facilityId as string
  if(!facilityId){
    throw new BadRequestMsgError("'facilityId' is required as a parameter.")
  }

  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  const staffs = await facilityStaffServices.findByFacilityId(facilityId)
  const formatedStaffs = staffs.map(staff => ({
    id: staff.id,
    userId: staff.userId,
    email: staff.user.email,
    firstName: staff.user.firstName,
    lastName: staff.user.lastName,
    joinedAt: staff.joinedAt
  }))

  return new SuccessResponse(
    `Staffs of facility ${facility.name}.`,
    {
      staffs: formatedStaffs,
      count: formatedStaffs.length
    }
  ).send(res)
}

export const handleAssignStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if(!userId){
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if(!user){
    throw new NotFoundError("User not found.")
  }

  if (user.role !== UserRole.FACILITY_STAFF) {
    throw new BadRequestMsgError("Only facility staff users can be assigned to a facility.")
  }

  const facilityId = req.params.facilityId as string
  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  const isAlreadyMember = await facilityStaffServices.findStaff(facilityId, userId)
  if(isAlreadyMember){
    throw new BadRequestMsgError("This staff is already part of this facility.")
  }

  await facilityStaffServices.create(facilityId, userId)

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} is now a staff of facility ${facility.name}.`).send(res)
} 


export const handleDismissStaff = async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  if(!userId){
    throw new BadRequestMsgError("'userId' is required as a parameter.")
  }

  const user = await userServices.findById(userId)
  if(!user){
    throw new NotFoundError("User not found.")
  }

  const facilityId = req.params.facilityId as string
  const facility = await facilityServices.findById(facilityId)
  if(!facility){
    throw new NotFoundError("Facility not found.")
  }

  const isMember = await facilityStaffServices.findStaff(facilityId, userId)
  if(!isMember){
    throw new BadRequestMsgError("This staff is not part of this facility.")
  }

  await facilityStaffServices.deleteStaff(facilityId, userId)

  return new SuccessMsgResponse(`${user.firstName} ${user.lastName} has been removed as a staff of facility ${facility.name}.`).send(res)
} 