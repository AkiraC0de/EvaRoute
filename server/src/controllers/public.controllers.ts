import { Request, Response } from "express"
import { SuccessMsgResponse } from "../core/ApiResponse"

export const handleGetPublicFacilities = async (req: Request, res: Response) => {
  return new SuccessMsgResponse("Not implemented yet.").send(res)
}

export const handleGetRouteToFacility = async (req: Request, res: Response) => {
  return new SuccessMsgResponse("Not implemented yet.").send(res)
}
