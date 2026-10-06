/**
 * Mock facility data — TEMPORARY, visualization only.
 *
 * ⚠️ REMOVE WHEN BACKEND DATA IS READY.
 * Toggle `USE_MOCK_FACILITIES` in src/App.tsx to false, then delete this file.
 *
 * The real integration lives in src/lib/api.ts and targets:
 *   GET /api/v1/public/facility?fromLong=<lng>&fromLat=<lat>
 *   -> { message, data: { facilities, count } }
 *
 * This file exists so the populated discovery/detail UI can be inspected
 * while the backend database is still empty.
 *
 * Field mapping a real record must satisfy (see PublicFacilityDTO):
 *   id, name, address, note, maxCapacity, status,
 *   latitude, longitude, distanceKm, resources[]
 *
 * NOTE: mock records have no `distance` — mock mode computes it with a local
 * haversine. Real records receive `distance` from the backend's `distanceKm`.
 * NOTE: `resources[].name` below uses the exact 9 tokens that
 * FacilityIconGrid maps to icons. Free-text names like "Drinking Water" would
 * NOT match and would fall back to the generic icon.
 */

import type { Facility } from '../types/facility';

/** Build a resource entry using a canonical FacilityIconGrid token. */
const amenity = (id: string, name: string) => ({
  id,
  name,
  type: 'BOOLEAN',
  isAvailable: true,
});

export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Paco Park School',
    address: '1958 Pedro Gil St, Paco, Manila',
    note: 'Covered court with backup generator, potable water and hot meals three times a day. Wheelchair-accessible entrance on Pedro Gil St.',
    status: 'LIMITED',
    maxCapacity: 400,
    latitude: 14.5964,
    longitude: 120.9736,
    resources: [
      amenity('r-1-1', 'water'),
      amenity('r-1-2', 'medical'),
      amenity('r-1-3', 'food'),
      amenity('r-1-4', 'shelter'),
      amenity('r-1-5', 'electricity'),
      amenity('r-1-6', 'restrooms'),
      amenity('r-1-7', 'wheelchair'),
    ],
  },
  {
    id: '2',
    name: 'San Andres Sports Complex',
    address: '456 San Andres St, Manila',
    status: 'AVAILABLE',
    maxCapacity: 3000,
    latitude: 14.5890,
    longitude: 120.9650,
    resources: [
      amenity('r-2-1', 'shelter'),
      amenity('r-2-2', 'water'),
      amenity('r-2-3', 'restrooms'),
      amenity('r-2-4', 'parking'),
    ],
  },
  {
    id: '3',
    name: 'Tondo Elementary School',
    address: '789 G. Abella St, Manila',
    status: 'UNAVAILABLE',
    maxCapacity: 2000,
    latitude: 14.5750,
    longitude: 120.9580,
    resources: [amenity('r-3-1', 'shelter'), amenity('r-3-2', 'food')],
  },
  {
    id: '4',
    name: 'Intramuros Gym',
    address: '100 Muralla St, Manila',
    status: 'AVAILABLE',
    maxCapacity: 1500,
    latitude: 14.5920,
    longitude: 120.9720,
    resources: [
      amenity('r-4-1', 'shelter'),
      amenity('r-4-2', 'phones'),
      amenity('r-4-3', 'restrooms'),
      amenity('r-4-4', 'food'),
    ],
  },
  {
    id: '5',
    // Deliberately long name/address to check card truncation at 390px + 1280px.
    name: 'Philippine Red Cross Evacuation Command Center — Mandaluyong Chapter',
    address: '2333 EDSSA, Shaw Boulevard, Mandaluyong City, Metro Manila, Philippines',
    status: 'LIMITED',
    maxCapacity: 800,
    latitude: 14.5900,
    longitude: 120.9690,
    resources: [
      amenity('r-5-1', 'medical'),
      amenity('r-5-2', 'water'),
      amenity('r-5-3', 'food'),
      amenity('r-5-4', 'electricity'),
      amenity('r-5-5', 'shelter'),
      amenity('r-5-6', 'restrooms'),
      amenity('r-5-7', 'phones'),
      amenity('r-5-8', 'parking'),
      amenity('r-5-9', 'wheelchair'),
    ],
  },
];
