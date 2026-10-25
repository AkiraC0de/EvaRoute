import { useEffect, useState } from "react";
import * as api from "../../lib/api";

/**
 * Facility selection for the Occupancy dashboard. ADMIN gets the picker
 * options (defaulting to the first, keeping the current pick); FACILITY_STAFF
 * resolve their assigned facility (the server returns `{ facility }` for
 * staff). FACILITY_STAFF operate on their assigned facility only
 * (assertFacilityAccess enforces it server-side too).
 *
 * A failed listFacilities() is its own state (`facilitiesError` + `retry`)
 * — never rendered as the "no facility" empty state, which would claim the
 * account has no facility when the fetch is what failed.
 */
export default function useOccupancyFacilities(isAdmin) {
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [facilityId, setFacilityId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

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
      .catch((err) => {
        if (!cancelled) setFacilitiesError(err);
      })
      .finally(() => {
        if (!cancelled) setFacilitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, reloadToken]);

  const retryFacilities = () => {
    setFacilitiesError(null);
    setFacilitiesLoading(true);
    setReloadToken((token) => token + 1);
  };

  return {
    facilities,
    facilitiesLoading,
    facilitiesError,
    retryFacilities,
    facilityId,
    setFacilityId,
  };
}
