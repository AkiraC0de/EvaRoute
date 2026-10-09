import { Facility } from './../../generated/prisma/index.d';
import { Request, Response } from "express";
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse";
import { validateData } from "../utils/validatorUtils";
import { publicFacilityQuerySchema, publicRouteQuerySchema } from "../validations/public.validations";
import facilityServices from "../services/facility.services";
import { haversineKm } from "../utils/geoUtils";
import { PUBLIC_FACILITY } from "../configs/publicConfig";
import { InternalError, NotFoundError } from '../core/ApiError';

export const handleGetPublicFacilities = async (
  req: Request,
  res: Response,
) => {
  const { fromLong, fromLat, distance } = validateData<
    typeof publicFacilityQuerySchema
  >(publicFacilityQuerySchema, req.query, "query");

  const maxKm = distance ?? PUBLIC_FACILITY.DEFAULT_DISTANCE_KM;

  const facilities = await facilityServices.findManyAvailableWithResources();

  const facilitiesWithDistance = facilities
    .map((facility) => ({
      facility,
      distanceKm: haversineKm(
        fromLat,
        fromLong,
        Number(facility.latitude),
        Number(facility.longitude),
      ),
    }))
    .filter(({ distanceKm }) => distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const formatedFacilities = facilitiesWithDistance.map(
    ({ facility, distanceKm }) => ({
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
    }),
  );

  return new SuccessResponse(
    `Facilities within ${maxKm} km of your location.`,
    { facilities: formatedFacilities, count: formatedFacilities.length },
  ).send(res);
};

export const handleGetRouteToFacility = async (req: Request, res: Response) => {
  const { fromLong, fromLat } = validateData<typeof publicRouteQuerySchema>(publicRouteQuerySchema, req.query, "query")
  const facilityId = req.params.facilityId as string

  const facility = await facilityServices.findById(facilityId)

  if(!facility){
    return new NotFoundError("Facility not found.")
  }

  const routeData = await fetchRouteFromFacility(fromLong, fromLat, facility)
  
  return new SuccessResponse("Routing success.", routeData.data).send(res);
}

const GRAPH_HOPPER_API_KEY = process.env.GRAPHOPPER_API_KEY

const fetchRouteFromFacility = async (fromLong: Number, fromLat: Number, facility: Facility) => {
  try {
    const response = await fetch(
      `https://graphhopper.com/api/1/route?key=${GRAPH_HOPPER_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: [
            [fromLong, fromLat],
            [facility.longitude, facility.latitude],
          ],
          snap_preventions: ["ferry", "tunnel"],
          details: ["road_class", "surface"],
          profile: "bike",
          locale: "en",
          instructions: true,
          calc_points: true,
          points_encoded: false,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        isSuccess: false
      }
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error("GraphHopper API error:", error.message)
    return {
      success: false
    }
  }
}