import { useCallback, useEffect, useState } from "react";
import * as api from "../../../lib/api";

/**
 * Facilities registry state (GET /facility registry mode) — server-side
 * search, sort and pagination via listFacilitiesPage, with the search input
 * debounced 300ms so typing never storms the API. CONTROLLED: the page owns
 * filter/sort/page state (URL-backed); this hook owns fetching, retry and the
 * visible rows. The mutation flows stay in the page.
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
  const [result, setResult] = useState({
    forQuery: null,
    data: { facilities: [], total: 0 },
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  // Debounce the search term before it reaches the request.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search ?? ""), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query identity (filters + retry counter) — one string per fetch.
  const queryKey = JSON.stringify([
    debouncedSearch,
    statusFilter,
    showDeleted,
    sort,
    order,
    page,
    pageSize,
    reloadToken,
  ]);

  useEffect(() => {
    let cancelled = false;

    api
      .listFacilitiesPage({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        deleted: showDeleted,
        sort,
        order,
        page,
        pageSize,
      })
      .then((data) => {
        if (!cancelled) setResult({ forQuery: queryKey, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) {
          setResult({ forQuery: queryKey, data: { facilities: [], total: 0 }, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, showDeleted, sort, order, page, pageSize, reloadToken, queryKey]);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const current = result.forQuery === queryKey ? result.data : { facilities: [], total: 0 };

  return {
    visible: current.facilities,
    total: current.total,
    totalPages: Math.max(1, Math.ceil(current.total / pageSize)),
    loading: result.forQuery !== queryKey,
    error: result.forQuery === queryKey ? result.error : null,
    retry,
  };
}
