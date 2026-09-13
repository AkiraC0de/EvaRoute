import { Request, Response } from "express"
import { validateData } from "../utils/validatorUtils"
import { registerFacilitySchema } from "../validations/facility.validations"

import facilityServices from "../services/facility.services"
import { SuccessResponse } from "../core/ApiResponse"

export const handleRegisterFacility = async (req: Request, res: Response) => {
  const facilityData = validateData<typeof registerFacilitySchema>(registerFacilitySchema, req.body)

  await facilityServices.create(facilityData)

  new SuccessResponse(`New facility named ${facilityData.name} has been registered.`, facilityData).send(res)
}