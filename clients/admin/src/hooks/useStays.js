import { useCallback, useEffect, useState } from "react";
import * as api from "../lib/api";

/**
 * Evacuee stays for one facility: active stays (with members), occupancy
 * summary, and the check-in / check-out mutations. Backed by the real stay
 * endpoints (see lib/api.js). Results are tagged with the facilityId they
 * were fetched for and derived at render time — no setState inside the
 * effect body (react-hooks/set-state-in-effect).
 */
export default function useStays(facilityId) {
  const [data, setData] = useState({ forId: null, stays: [], occupancy: null, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!facilityId) return undefined;

    let cancelled = false;

    Promise.all([
      api.listStays(facilityId, "ACTIVE"),
      api.getOccupancy(facilityId),
    ])
      .then(([stays, occupancy]) => {
        if (!cancelled) setData({ forId: facilityId, stays, occupancy, error: null });
      })
      .catch((err) => {
        if (!cancelled) setData({ forId: facilityId, stays: [], occupancy: null, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [facilityId, reloadToken]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const checkIn = useCallback(
    async (payload) => {
      const stay = await api.checkIn(facilityId, payload);
      refresh();
      // Return the created stay so callers can show the check-in ticket with
      // the server-assigned Check-In ID.
      return stay;
    },
    [facilityId, refresh],
  );

  const checkOut = useCallback(
    async (stayId) => {
      await api.checkOut(facilityId, stayId);
      refresh();
    },
    [facilityId, refresh],
  );

  const current = data.forId === facilityId ? data : { stays: [], occupancy: null, error: null };

  return {
    stays: current.stays,
    occupancy: current.occupancy,
    loading: Boolean(facilityId) && data.forId !== facilityId,
    error: current.error,
    retry: refresh,
    checkIn,
    checkOut,
  };
}
