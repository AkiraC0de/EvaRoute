import { useCallback, useEffect, useState } from "react";
import * as api from "../lib/api";

/**
 * Loads the facility assigned to the signed-in staff member
 * (GET /api/v1/facility — role-scoped server-side: an ADMIN gets every
 * facility, a FACILITY_STAFF gets only their own; `facility` is null when the
 * user is not assigned).
 *
 * Shared by the My Facility and Profile screens.
 */
export default function useAssignedFacility() {
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // State is only ever set after an await, never synchronously in the effect
  // body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false;

    api
      .getAssignedFacility()
      .then((next) => {
        if (!cancelled) setFacility(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { facility, loading, error, retry };
}
