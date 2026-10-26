import { useQuery } from "@tanstack/react-query";
import * as api from "../../../lib/api";
import { TAGS } from "../../../lib/api/cacheTags.js";

/**
 * Staff list state (GET /staff) — filters map 1:1 to the server query
 * (`search`, `status`, `unassigned`). CONTROLLED: the page owns filter state
 * (URL-backed via useUrlFilters); this hook owns fetching, retry and the
 * visible rows. The mutation flows stay in the page.
 *
 * TanStack Query adapter — the query key carries filter VALUES (never the
 * caller's object identity), so an inline filters object cannot refetch
 * forever.
 */
export default function useStaffAccounts(filters) {
  const staff = useQuery({
    queryKey: [
      "api",
      TAGS.staff,
      {
        search: filters?.search || null,
        status: filters?.status || null,
        unassigned: filters?.unassigned || null,
      },
    ],
    queryFn: () =>
      api.listStaffAccounts({
        search: filters.search || undefined,
        status: filters.status || undefined,
        unassigned: filters.unassigned || undefined,
      }),
    staleTime: 120_000,
  });

  return {
    visible: staff.data?.staffs ?? [],
    loading: staff.isPending,
    error: staff.error ?? null,
    retry: () => staff.refetch(),
  };
}
