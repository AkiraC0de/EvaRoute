import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Live occupancy summary for one facility (GET /facility/:id/stay/occupancy)
 * — the hero console's quantified condition. Cached query adapter under the
 * `stays` tag (check-in/out move it via the request() seam). Supporting
 * information: a failure stays non-fatal but is surfaced with a retry.
 */
export default function useFacilityOccupancy(facilityId) {
  const query = useQuery({
    queryKey: ["api", TAGS.stays, { facilityId: facilityId ?? null, occupancyOnly: true }],
    queryFn: () => api.getOccupancy(facilityId),
    enabled: Boolean(facilityId),
    staleTime: 15_000,
  });

  return {
    summary: query.data ?? null,
    error: query.error ?? null,
    retry: () => query.refetch(),
  };
}
