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
  const [data, setData] = useState({ facilities: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Debounce the search term before it reaches the request.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search ?? ""), 300);
    return () => clearTimeout(timer);
  }, [search]);

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
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, showDeleted, sort, order, page, pageSize, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return {
    visible: data.facilities,
    total: data.total,
    totalPages: Math.max(1, Math.ceil(data.total / pageSize)),
    loading,
    error,
    retry,
  };
}
