import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../../../lib/api";

/**
 * Staff list state (GET /staff) — filters map 1:1 to the server query
 * (`search`, `status`, `unassigned`). Owns filter state, fetching, retry
 * and the visible rows; the mutation flows stay in the page.
 */
export default function useStaffAccounts() {
  const [filters, setFilters] = useState({ search: "", status: "", unassigned: false });
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    api
      .listStaffAccounts({
        search: filters.search || undefined,
        status: filters.status || undefined,
        unassigned: filters.unassigned || undefined,
      })
      .then(({ staffs: rows }) => {
        if (!cancelled) setStaffs(rows);
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
  }, [filters, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const visible = useMemo(() => staffs, [staffs]);

  return { filters, setFilters, visible, loading, error, retry };
}
