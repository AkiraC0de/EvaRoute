export type FacilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'LIMITED';

export const FACILITY_STATUS_META: Record<FacilityStatus, {
  label: string;
  fullLabel: string;
  color: string;
  background: string;
}> = {
  AVAILABLE: {
    label: 'Open',
    fullLabel: 'Open',
    color: 'var(--color-success)',
    background: 'var(--color-success-soft)',
  },
  LIMITED: {
    label: 'Limited',
    fullLabel: 'Limited availability',
    color: 'var(--color-warning)',
    background: 'var(--color-warning-soft)',
  },
  UNAVAILABLE: {
    label: 'Full',
    fullLabel: 'Full',
    color: 'var(--color-full)',
    background: 'var(--color-full-soft)',
  },
};

export interface Facility {
  id: string;
  name: string;
  address: string;
  note?: string;
  maxCapacity: number;
  status: FacilityStatus;
  latitude: number;
  longitude: number;
  createdAt?: string;
  distance?: number; // km — derived client-side from user location
}

/**
 * Response shape from GET /api/v1/facility
 * Backend returns: { message: string; facilities: Facility[]; count: number }
 * or: { message: string; facility: Facility } (single facility, staff endpoint)
 */
export interface FacilityListResponse {
  message: string;
  facilities: Facility[];
  count: number;
}

export interface FacilityResponse {
  message: string;
  facility: Facility;
}

/**
 * PROVISIONAL: Distance is derived client-side from user location
 * and facility coordinates. Not yet implemented.
 */
export interface FacilityWithDistance extends Facility {
  distance?: number; // kilometers
}

/**
 * PROVISIONAL: Current occupancy is NOT available from the backend.
 * The backend's Facility DTO only exposes maxCapacity.
 * This field is reserved for future backend integration.
 */
// export interface FacilityWithOccupancy extends Facility {
//   currentOccupancy?: number; // NOT YET AVAILABLE
// }
