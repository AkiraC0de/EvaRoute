/**
 * EvaRoute Public API Client
 *
 * The public evacuation app must work without an account, so this client
 * only targets the unauthenticated public routes. Authenticated staff/admin
 * endpoints live under /api/v1/facility and are intentionally NOT used here.
 *
 * Backend (server/src/routes/public.routes.ts, mounted in index.ts):
 *   GET /api/v1/public/facility?fromLong=<lng>&fromLat=<lat>[&distance=<km>]
 *     - no authentication middleware
 *     - filters to status AVAILABLE, radius filter (default 10km, max 200km),
 *       sorted ascending by haversine distance
 *     - each facility carries its `resources[]` (amenities) inline
 *
 * Response envelope (core/ApiResponse.ts -> SuccessResponse):
 *   { message: string, data: { facilities: PublicFacilityDTO[], count: number } }
 *
 * NOTE: the payload is nested under `data`, not spread at the top level.
 */

/// <reference types="vite/client" />

import type { Facility } from '../types/facility';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const PUBLIC_FACILITY_URI = `${BASE_URL}/api/v1/public/facility`;

/** Maximum radius the backend accepts (see PUBLIC_FACILITY.MAX_DISTANCE_KM). */
const MAX_DISTANCE_KM = 200;

export interface PublicFacilityQuery {
  longitude: number;
  latitude: number;
  /** Radius in km. Omitted server-side when not provided (defaults to 10km). */
  distanceKm?: number;
}

/**
 * Raw DTO exactly as the backend sends it.
 *
 * `latitude`/`longitude` are Prisma `Decimal` columns and arrive as strings
 * (or numbers, depending on driver/serialization), so they are typed as
 * string | number and coerced by the mapper below.
 */
export interface PublicFacilityDTO {
  id: string;
  name: string;
  address: string;
  note: string | null;
  maxCapacity: number;
  status: string;
  latitude: string | number;
  longitude: string | number;
  createdAt: string;
  distanceKm: number;
  resources: {
    id: string;
    name: string;
    type: string;
    isAvailable: boolean | null;
    availableValue: number | null;
    maxValue: number | null;
  }[];
}

export interface PublicFacilityResponse {
  message: string;
  data: {
    facilities: PublicFacilityDTO[];
    count: number;
  };
}

/**
 * Prisma Decimal fields may serialize as strings. Coerce to a finite number
 * and fall back to `fallback` when the value is unusable, so one bad row can
 * never break the whole discovery list.
 */
function toNumber(value: string | number | null | undefined, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Map the backend DTO onto the frontend `Facility` model.
 *
 * Field mapping:
 *   id, name, address, note, status, maxCapacity  -> same names
 *   latitude/longitude (Decimal string|number)    -> number, via toNumber()
 *   distanceKm                                    -> `distance` (the field the
 *                                                    existing UI already reads)
 *   resources[]                                   -> `resources` (amenities)
 *
 * `status` is passed through unchanged: the backend enum is a subset of the
 * frontend union, so no remapping is applied here.
 */
function toFacility(dto: PublicFacilityDTO): Facility {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    note: dto.note ?? undefined,
    maxCapacity: toNumber(dto.maxCapacity, 0),
    status: dto.status as Facility['status'],
    latitude: toNumber(dto.latitude, 0),
    longitude: toNumber(dto.longitude, 0),
    createdAt: dto.createdAt,
    distance: toNumber(dto.distanceKm, 0),
    resources: (dto.resources ?? []).map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      isAvailable: resource.isAvailable,
      availableValue: resource.availableValue,
      maxValue: resource.maxValue,
    })),
  };
}

/**
 * Fetch the public facility list, nearest first.
 *
 * `fromLong` / `fromLat` are REQUIRED by the backend schema, so callers must
 * pass a coordinate — callers that lack a GPS fix should pass their fallback
 * center rather than skip the request.
 */
export async function fetchPublicFacilities(query: PublicFacilityQuery): Promise<Facility[]> {
  const params = new URLSearchParams({
    fromLong: String(query.longitude),
    fromLat: String(query.latitude),
  });

  if (query.distanceKm != null) {
    params.set('distance', String(Math.min(query.distanceKm, MAX_DISTANCE_KM)));
  }

  const response = await fetch(`${PUBLIC_FACILITY_URI}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      errorBody.message || `Failed to fetch facilities: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const body = (await response.json()) as PublicFacilityResponse;
  const facilities = body?.data?.facilities;

  if (!Array.isArray(facilities)) {
    throw new ApiError('Unexpected response shape from the public facility endpoint.', response.status);
  }

  return facilities.map(toFacility);
}

// ──────────────────────────────────────────────
// Error types
// ──────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}