import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../../../lib/api";

/**
 * Staff list state (GET /staff) — filters map 1:1 to the server query
 * (`search`, `status`, `unassigned`). CONTROLLED: the page owns filter state
 * (URL-backed via useUrlFilters); this hook owns fetching, retry and the
 * visible rows. The mutation flows stay in the page.
 *
 * Results are tagged with the query they were fetched for (the same
 * stale-response tagging as useStays/useDashboardSummary): `loading` and
 * `error` follow the query key, so a filter change re-arms the loading state
 * and a fetch failure never sticks to a later, successful refetch.
 */
export default function useStaffAccounts(filters) {
  const [result, setResult] = useState({ forQuery: null, staffs: [], error: null });
  const [reloadToken, setReloadToken] = useState(0);

  // Query identity (filters + retry counter) — one string per fetch.
  const queryKey = JSON.stringify([filters, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    api
      .listStaffAccounts({
        search: filters.search || undefined,
        status: filters.status || undefined,
        unassigned: filters.unassigned || undefined,
      })
      .then(({ staffs: rows }) => {
        if (!cancelled) setResult({ forQuery: queryKey, staffs: rows, error: null });
      })
      .catch((error) => {
        if (!cancelled) setResult({ forQuery: queryKey, staffs: [], error });
      });

    return () => {
      cancelled = true;
    };
  }, [filters, reloadToken, queryKey]);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const visible = useMemo(
    () => (result.forQuery === queryKey ? result.staffs : []),
    [result, queryKey],
  );

  return {
    visible,
    loading: result.forQuery !== queryKey,
    error: result.forQuery === queryKey ? result.error : null,
    retry,
  };
}
