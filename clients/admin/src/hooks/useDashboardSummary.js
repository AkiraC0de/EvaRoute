import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Dashboard aggregate (GET /api/v1/dashboard/summary) — facility states,
 * live occupancy, staff states, rolling activity windows and per-facility
 * load in one request. TanStack Query adapter: the public shape is unchanged
 * (`summary`/`loading`/`error`/`reload`); `loading` is FIRST-load only so a
 * background revalidation never re-shows skeletons. Mutations invalidate via
 * the request() seam (cacheTags.js).
 */
export default function useDashboardSummary(facilityId) {
  const query = useQuery({
    queryKey: ["api", TAGS.dashboard, { facilityId: facilityId ?? null }],
    queryFn: () => getDashboardSummary({ facilityId }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return {
    summary: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
    reload: () => query.refetch(),
  };
}
