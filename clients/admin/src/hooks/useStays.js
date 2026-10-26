import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
// `request` is the sibling modules' own entry into the request core (it is
// not part of the public `lib/api` barrel). The bulk check-out loop needs it
// to pass `silent` per POST — see checkOutMany below.
import { request } from "../lib/api/client.js";
import { BULK_CHECKOUT_TAGS, TAGS } from "../lib/api/cacheTags.js";
import { invalidateTags } from "../lib/api/cacheInvalidator.js";

/**
 * Evacuee stays for one facility: active stays (with members), occupancy
 * summary, and the check-in / check-out mutations. TanStack Query adapter —
 * one query carries both payloads (they load together and refresh together).
 * Public shape unchanged.
 */
export default function useStays(facilityId) {
  const query = useQuery({
    queryKey: ["api", TAGS.stays, { facilityId: facilityId ?? null }],
    queryFn: async () => {
      const [stays, occupancy] = await Promise.all([
        api.listStays(facilityId, "ACTIVE"),
        api.getOccupancy(facilityId),
      ]);
      return { stays, occupancy };
    },
    enabled: Boolean(facilityId),
    staleTime: 15_000,
  });

  // Non-silent mutations refresh through the request() seam automatically.
  const checkIn = useCallback(
    // Return the created stay so callers can show the check-in ticket with
    // the server-assigned Check-In ID.
    (payload) => api.checkIn(facilityId, payload),
    [facilityId],
  );

  const checkOut = useCallback(
    (stayId) => api.checkOut(facilityId, stayId),
    [facilityId],
  );

  /**
   * Bulk check-out — the server has no bulk route, so this loops the per-stay
   * checkout POST with allSettled semantics: a stay that fails lands in
   * `failed` with the server's own message and never aborts the loop, and the
   * call NEVER throws — the result set is the only failure channel.
   *
   * Each POST goes through `request()` with `silent` (batch mode: no per-POST
   * toast, no per-POST invalidation) so N households do not stack N toasts or
   * N refetch storms; ONE refresh at the end (even on partial failure) settles
   * the list, the occupancy numbers and the movement trail together.
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
      invalidateTags(BULK_CHECKOUT_TAGS);
      return { checkedOut, failed };
    },
    [facilityId],
  );

  return {
    stays: query.data?.stays ?? [],
    occupancy: query.data?.occupancy ?? null,
    loading: Boolean(facilityId) && query.isPending,
    error: query.error ?? null,
    retry: () => query.refetch(),
    checkIn,
    checkOut,
    checkOutMany,
  };
}
