import { useEffect, useState } from "react";
import * as api from "../../lib/api";

/**
 * Facility selection for the Occupancy dashboard. ADMIN gets the picker
 * options (defaulting to the first, keeping the current pick); FACILITY_STAFF
 * resolve their assigned facility (the server returns `{ facility }` for
 * staff). FACILITY_STAFF operate on their assigned facility only
 * (assertFacilityAccess enforces it server-side too).
 */
export default function useOccupancyFacilities(isAdmin) {
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilityId, setFacilityId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .listFacilities()
      .then((rows) => {
        if (cancelled) return;
        setFacilities(rows);
        if (!isAdmin && rows.length > 0) setFacilityId(rows[0].id);
        if (isAdmin && rows.length > 0) setFacilityId((current) => current ?? rows[0].id);
      })
      .catch(() => {
        // Handled by the stays error state in the page if the facility cannot load.
      })
      .finally(() => {
        if (!cancelled) setFacilitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return { facilities, facilitiesLoading, facilityId, setFacilityId };
}
