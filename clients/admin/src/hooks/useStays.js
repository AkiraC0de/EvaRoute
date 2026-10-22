import { useCallback, useEffect, useState } from "react";
import * as api from "../lib/api";
// `request` is the sibling modules' own entry into the request core (it is
// not part of the public `lib/api` barrel). The bulk check-out loop needs it
// to pass `silent` per POST — see checkOutMany below.
import { request } from "../lib/api/client.js";

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

  /**
   * Bulk check-out — the server has no bulk route, so this loops the per-stay
   * checkout POST with allSettled semantics: a stay that fails lands in
   * `failed` with the server's own message and never aborts the loop, and the
   * call NEVER throws — the result set is the only failure channel.
   * `refresh()` runs exactly once at the end (even on partial failure) so the
   * list, the occupancy numbers and the movement trail settle together.
   *
   * Each POST goes through `request()` with `silent` — same endpoint and
   * behavior as `api.checkOut`, minus the automatic server toast — so N
   * households do not stack N toasts; the caller owns ONE calm summary.
   * Single check-outs elsewhere keep their toasts unchanged.
   */
  const checkOutMany = useCallback(
    async (stayIds) => {
      const ids = (Array.isArray(stayIds) ? stayIds : []).filter(Boolean);
      const checkedOut = [];
      const failed = [];
      for (const stayId of ids) {
        try {
          await request(`/facility/${facilityId}/stay/${stayId}/checkout`, {
            method: "POST",
            silent: true,
          });
          checkedOut.push(stayId);
        } catch (err) {
          failed.push({
            id: stayId,
            message: err?.message || "This household could not be checked out.",
          });
        }
      }
      refresh();
      return { checkedOut, failed };
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
    checkOutMany,
  };
}
