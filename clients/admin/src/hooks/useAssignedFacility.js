import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Loads the facility assigned to the signed-in staff member
 * (GET /api/v1/facility — role-scoped server-side: an ADMIN gets every
 * facility, a FACILITY_STAFF gets only their own; `facility` is null when the
 * user is not assigned). TanStack Query adapter — long staleTime (this
 * changes rarely and assign/dismiss invalidate it via the request() seam).
 * Shared by the My Facility and Profile screens.
 */
export default function useAssignedFacility() {
  const query = useQuery({
    queryKey: ["api", TAGS.facilities, "assigned"],
    queryFn: () => api.getAssignedFacility(),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    facility: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
    retry: () => query.refetch(),
  };
}
