import type { Facility, FacilityListResponse, FacilityResponse } from '../types/facility';

/// <reference types="vite/client" />

/**
 * EvaRoute API Client
 *
 * Connects to the existing backend at the URL configured via
 * VITE_API_BASE_URL environment variable.
 *
 * The backend runs on Express + TypeScript + Prisma + PostgreSQL.
 * All API calls are stateless HTTP requests.
 *
 * Authentication (JWT cookies) is handled by the backend.
 * The frontend does NOT manage tokens directly — it relies on
 * the backend's cookie-based session. Auth UI is deferred.
 *
 * Current backend endpoints (from backend/src/configs/mainConfig.ts):
 *   GET    /api/v1/facility              — list facilities
 *   POST   /api/v1/facility              — register facility (auth required)
 *   PATCH  /api/v1/facility/:id           — update facility (auth required)
 *   DELETE /api/v1/facility/:id           — soft-delete facility (auth required)
 *   GET    /api/v1/facility/:id/staff     — list staff (auth required)
 *   GET    /api/v1/facility/:id/resource  — list resources (auth required)
 *
 * Endpoints NOT yet available:
 *   - Current occupancy count
 *   - Proximity-based facility filtering
 *   - Route calculation
 *   - User geolocation
 */

/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Full backend URI for the facility endpoint
const FACILITY_URI = `${BASE_URL}/api/v1/facility`;

/**
 * Fetch facilities from the backend.
 *
 * The backend GET /api/v1/facility returns:
 *   { message: string; facilities: Facility[]; count: number }
 *
 * Optional status filter: ?status=AVAILABLE or ?status=UNAVAILABLE
 *
 * NOTE: This endpoint requires authentication (JWT cookie).
 * Without auth, the backend will return an error.
 * Auth UI is deferred to a later phase.
 */
export async function fetchFacilities(status?: 'AVAILABLE' | 'UNAVAILABLE'): Promise<Facility[]> {
  const params = status ? `?status=${status}` : '';
  const url = `${FACILITY_URI}${params}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include', // Include cookies for JWT session
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      errorBody.message || `Failed to fetch facilities: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const data = await response.json();
  return data.facilities ?? [];
}

/**
 * Fetch a single facility by ID.
 *
 * NOTE: The backend's facility detail endpoint is not a separate route.
 * The frontend would need to call GET /api/v1/facility/:id/staff or
 * GET /api/v1/facility/:id/resource to get facility-specific data.
 * A dedicated facility detail endpoint is recommended (see docs).
 *
 * This is a placeholder — the actual endpoint may differ.
 */
export async function fetchFacilityById(id: string): Promise<Facility> {
  // The backend does not have a direct GET /api/v1/facility/:id endpoint.
  // This calls the staff endpoint as a placeholder — it returns facility data
  // only if the authenticated user is a staff member of that facility.
  const url = `${FACILITY_URI}/${id}/staff`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      errorBody.message || `Failed to fetch facility ${id}: ${response.status}`,
      response.status,
    );
  }

  const data = await response.json();
  // The staff endpoint returns { message, facility } on success
  return data.facility;
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

export class ApiNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

// ──────────────────────────────────────────────
// Types for API responses (shared with types/facility.ts)
// ──────────────────────────────────────────────

export interface ApiResponse<T> {
  message: string;
  data?: T;
}
