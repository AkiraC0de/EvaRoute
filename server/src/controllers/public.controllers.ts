import { Facility } from './../../generated/prisma/index.js';
import { Request, Response } from "express";
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js";
import { validateData } from "../utils/validatorUtils.js";
import { publicFacilityParamsSchema, publicFacilityQuerySchema, publicRouteQuerySchema } from "../validations/public.validations.js";
import facilityServices from "../services/facility.services.js";
import { haversineKm } from "../utils/geoUtils.js";
import { PUBLIC_FACILITY } from "../configs/publicConfig.js";
import { BadRequestMsgError, BadGatewayError, NotFoundError } from '../core/ApiError.js';

export const handleGetPublicFacilities = async (
  req: Request,
  res: Response,
) => {
  const { fromLong, fromLat, distance } = validateData<
    typeof publicFacilityQuerySchema
  >(publicFacilityQuerySchema, req.query, "query");

  const maxKm = distance ?? PUBLIC_FACILITY.DEFAULT_DISTANCE_KM;

  const facilities = await facilityServices.findManyPublicWithResources();

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
        essentialType: resource.essentialType,
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
  // UUID params are validated like every other input (API-05/SL-14): a
  // malformed id must be a 400, never a Prisma 500 on an unauthenticated route.
  const { facilityId } = validateData<typeof publicFacilityParamsSchema>(
    publicFacilityParamsSchema,
    req.params
  )

  const facility = await facilityServices.findById(facilityId)

  if(!facility){
    // THROW — `return new NotFoundError(...)` never sent a response and the
    // request hung forever (the public app spun on "Calculating the best
    // route..." with no timeout).
    throw new NotFoundError("Facility not found.")
  }

  // Same reachability cap as the facility list: this unauthenticated proxy
  // must not plan arbitrary continent-scale routes on the paid upstream.
  const distanceKm = haversineKm(fromLat, fromLong, Number(facility.latitude), Number(facility.longitude))
  if (distanceKm > PUBLIC_FACILITY.MAX_DISTANCE_KM) {
    throw new BadRequestMsgError(`Routing is limited to ${PUBLIC_FACILITY.MAX_DISTANCE_KM} km from your location.`)
  }

  const routeData = await fetchRouteFromFacility(fromLong, fromLat, facility)
  
  return new SuccessResponse("Routing success.", routeData).send(res);
}

const GRAPH_HOPPER_API_KEY = process.env.GRAPHOPPER_API_KEY

const fetchRouteFromFacility = async (fromLong: Number, fromLat: Number, facility: Facility) => {
  let response: Awaited<ReturnType<typeof fetch>>
  try {
    response = await fetch(
      `https://graphhopper.com/api/1/route?key=${GRAPH_HOPPER_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Bounded upstream call: without a timeout a hung GraphHopper request
        // pinned the connection forever (and the unauthenticated caller could
        // pin unlimited ones).
        signal: AbortSignal.timeout(15_000),
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

  } catch (error: any) {
    console.error("GraphHopper API error:", error?.message ?? error)
    throw new BadGatewayError("Routing service is temporarily unavailable. Please try again later.")
  }

  if (!response.ok) {
    // Upstream failure is a 502, never a 200 with undefined data (the old
    // shape answered "Routing success." and hid provider outages entirely).
    console.error(`GraphHopper API responded ${response.status}`)
    throw new BadGatewayError("Routing service is temporarily unavailable. Please try again later.")
  }

  try {
    return await response.json();
  } catch (error: any) {
    console.error("GraphHopper response parse error:", error?.message ?? error)
    throw new BadGatewayError("Routing service is temporarily unavailable. Please try again later.")
  }
}