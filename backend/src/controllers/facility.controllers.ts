import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { patchFacilitySchema, registerFacilitySchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { BadRequestError, BadRequestMsgError, NotFoundError } from "../core/ApiError"

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const facilityData = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  const facilityExistOnLocation = await facilityServices.findByLongLat([facilityData.longitude, facilityData.latitude])
  if(facilityExistOnLocation){
    throw new BadRequestMsgError("There is an existing facility on the location. Please select a new location point")
  }
  
  await facilityServices.create(facilityData)

  new SuccessResponse(`New facility named ${facilityData.name} has been registered.`, facilityData).send(res)
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

  new SuccessResponse(`${facility.name} has been patched.`, updatedFacility).send(res)
}