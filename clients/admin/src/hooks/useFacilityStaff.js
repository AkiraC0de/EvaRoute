import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Assigned staff roster for one facility (GET /facility/:id/staff) — cached
 * query adapter. `status` mirrors the card's three states ('pending' |
 * 'failed' | 'ready') so supporting information degrades visibly instead of
 * masquerading as "no staff". Assign/dismiss refresh it via the request()
 * seam (tag `staff`).
 */
export default function useFacilityStaff(facilityId) {
  const query = useQuery({
    queryKey: ["api", TAGS.staff, { facility: facilityId ?? null }],
    queryFn: () => api.listFacilityStaff(facilityId),
    enabled: Boolean(facilityId),
    staleTime: 60_000,
  });

  return {
    rows: query.data ?? [],
    status: query.isPending ? "pending" : query.error ? "failed" : "ready",
    error: query.error ?? null,
    retry: () => query.refetch(),
  };
}
