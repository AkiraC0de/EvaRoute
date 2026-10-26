import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../lib/api";
import { TAGS } from "../../lib/api/cacheTags.js";

/**
 * Facility selection for the Occupancy dashboard. ADMIN gets the picker
 * options (defaulting to the first, keeping the current pick); FACILITY_STAFF
 * resolve their assigned facility (the server returns `{ facility }` for
 * staff). FACILITY_STAFF operate on their assigned facility only
 * (assertFacilityAccess enforces it server-side too).
 *
 * TanStack Query adapter. The selection is DERIVED (no effect needed): staff
 * always sit on their single facility, admins keep their pick with the first
 * row as default. A failed listFacilities() is its own state
 * (`facilitiesError` + `retry`) — never rendered as the "no facility" empty
 * state, which would claim the account has no facility when the fetch is what
 * failed.
 */
export default function useOccupancyFacilities(isAdmin) {
  const [selectedId, setSelectedId] = useState(null);

  const facilities = useQuery({
    queryKey: ["api", TAGS.facilities, "picker"],
    queryFn: () => api.listFacilities(),
    staleTime: 30_000,
  });

  const rows = facilities.data ?? [];
  const facilityId = isAdmin
    ? (selectedId ?? rows[0]?.id ?? null)
    : rows[0]?.id ?? null;

  return {
    facilities: rows,
    facilitiesLoading: facilities.isPending,
    facilitiesError: facilities.error ?? null,
    retryFacilities: () => facilities.refetch(),
    facilityId,
    setFacilityId: setSelectedId,
  };
}
