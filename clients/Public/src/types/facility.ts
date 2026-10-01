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

/**
 * Amenity / supply entry attached to a facility.
 *
 * Sourced from `FacilityResource` via the public facility endpoint's
 * `resources[]` array. `type` is the backend enum (QUANTITY | BOOLEAN), so
 * icon matching in FacilityIconGrid keys off `name`, not `type`.
 */
export interface FacilityResource {
  id: string;
  name: string;
  type: string;
  isAvailable?: boolean | null;
  availableValue?: number | null;
  maxValue?: number | null;
}

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
  /** km — computed server-side and returned as `distanceKm` by
   *  GET /api/v1/public/facility; mapped in lib/api.ts. */
  distance?: number;
  /** Amenities from the backend's `resources[]`. */
  resources?: FacilityResource[];
}

/**
 * Facility with an explicitly-read backend distance. `distance` is part of the
 * base Facility model now that the public endpoint supplies it, so this alias
 * exists only for call sites that name it directly.
 */
export interface FacilityWithDistance extends Facility {
  distance?: number; // kilometers
}

/**
 * PROVISIONAL: Current occupancy is NOT available from the backend.
 * The public facility DTO exposes maxCapacity but no occupancy count.
 * This field is reserved for future backend integration.
 */
// export interface FacilityWithOccupancy extends Facility {
//   currentOccupancy?: number; // NOT YET AVAILABLE
// }
