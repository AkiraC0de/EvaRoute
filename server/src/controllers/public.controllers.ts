import { Request, Response } from "express"
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse"
import { validateData } from "../utils/validatorUtils"
import { publicFacilityQuerySchema } from "../validations/public.validations"
import facilityServices from "../services/facility.services"
import { haversineKm } from "../utils/geoUtils"
import { PUBLIC_FACILITY } from "../configs/publicConfig"

export const handleGetPublicFacilities = async (req: Request, res: Response) => {
  const { fromLong, fromLat, distance } = validateData<typeof publicFacilityQuerySchema>(publicFacilityQuerySchema,req.query,"query")

  const maxKm = distance ?? PUBLIC_FACILITY.DEFAULT_DISTANCE_KM

  const facilities = await facilityServices.findManyAvailableWithResources()

  const facilitiesWithDistance = facilities
    .map((facility) => ({
      facility,
      distanceKm: haversineKm(fromLat, fromLong, Number(facility.latitude), Number(facility.longitude)),
    }))
    .filter(({ distanceKm }) => distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const formatedFacilities = facilitiesWithDistance.map(({ facility, distanceKm }) => ({
    id: facility.id,
    name: facility.name,
    address: facility.address,
    note: facility.note,
    maxCapacity: facility.maxCapacity,
    status: facility.status,
    latitude: facility.latitude,
    longitude: facility.longitude,
    createdAt: facility.createdAt,
    distanceKm: Number(distanceKm.toFixed(2)),
    resources: facility.resource.map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      isAvailable: resource.isAvailable,
      availableValue: resource.availableValue,
      maxValue: resource.maxValue,
    })),
  }))

  return new SuccessResponse(
    `Facilities within ${maxKm} km of your location.`,
    { facilities: formatedFacilities, count: formatedFacilities.length }
  ).send(res)
}

export const handleGetRouteToFacility = async (req: Request, res: Response) => {
  return new SuccessMsgResponse("Not implemented yet.").send(res)
}
