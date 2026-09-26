/**
 * Mock facility data — provisional, to be replaced with real API data.
 *
 * The backend's GET /api/v1/facility requires JWT authentication,
 * which blocks the public evacuation flow. This mock data is a
 * temporary stand-in until the backend is updated to serve facilities
 * without authentication for the public evacuation use case.
 *
 * BACKEND GAP: GET /api/v1/facility requires authentication.
 * The public evacuation experience should not require login.
 * See docs/frontend/implementation-decisions.md for details.
 */

import type { Facility } from '../types/facility';

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
  },
  {
    id: '2',
    name: 'San Andres Sports Complex',
    address: '456 San Andres St, Manila',
    status: 'AVAILABLE',
    maxCapacity: 3000,
    latitude: 14.5890,
    longitude: 120.9650,
  },
  {
    id: '3',
    name: 'Tondo Elementary School',
    address: '789 G. Abella St, Manila',
    status: 'UNAVAILABLE',
    maxCapacity: 2000,
    latitude: 14.5750,
    longitude: 120.9580,
  },
  {
    id: '4',
    name: 'Intramuros Gym',
    address: '100 Muralla St, Manila',
    status: 'AVAILABLE',
    maxCapacity: 1500,
    latitude: 14.5920,
    longitude: 120.9720,
  },
  {
    id: '5',
    name: 'Quezon Bridge Shelter',
    address: 'Quezon Bridge, Manila',
    status: 'AVAILABLE',
    maxCapacity: 800,
    latitude: 14.5900,
    longitude: 120.9690,
  },
];
