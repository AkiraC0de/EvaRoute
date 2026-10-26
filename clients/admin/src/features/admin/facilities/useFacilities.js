import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as api from "../../../lib/api";
import { TAGS } from "../../../lib/api/cacheTags.js";

/**
 * Facilities registry state (GET /facility registry mode) — server-side
 * search, sort and pagination via listFacilitiesPage, with the search input
 * debounced 300ms so typing never storms the API. CONTROLLED: the page owns
 * filter/sort/page state (URL-backed); this hook owns fetching, retry and the
 * visible rows. The mutation flows stay in the page.
 *
 * TanStack Query adapter with `keepPreviousData`, so paging and filter
 * changes swap rows in place instead of blinking the grid to a skeleton.
 */
export default function useFacilities({
  search,
  statusFilter,
  showDeleted,
  sort = "created",
  order = "asc",
  page = 1,
  pageSize = 10,
}) {
  // Debounce the search term before it reaches the request.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search ?? ""), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const registry = useQuery({
    queryKey: [
      "api",
      TAGS.facilities,
      {
        list: {
          search: debouncedSearch || null,
          status: statusFilter || null,
          showDeleted: Boolean(showDeleted),
          sort,
          order,
          page,
          pageSize,
        },
      },
    ],
    queryFn: () =>
      api.listFacilitiesPage({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        deleted: showDeleted,
        sort,
        order,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const data = registry.data ?? { facilities: [], total: 0 };

  return {
    visible: data.facilities ?? [],
    total: data.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data.total ?? 0) / pageSize)),
    loading: registry.isPending,
    error: registry.error ?? null,
    retry: () => registry.refetch(),
  };
}
