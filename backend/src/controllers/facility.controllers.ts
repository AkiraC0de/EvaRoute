import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { registerFacilitySchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import { SuccessResponse } from "../core/ApiResponse"
import { BadRequestMsgError } from "../core/ApiError"

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const facilityData = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  const facilityExistOnLocation = await facilityServices.findByLongLat([facilityData.longitude, facilityData.latitude])
  if(facilityExistOnLocation){
    throw new BadRequestMsgError("There is an existing facility on the location. Please select a new location point")
  }
  
  await facilityServices.create(facilityData)

  new SuccessResponse(`New facility named ${facilityData.name} has been registered.`, facilityData).send(res)
}