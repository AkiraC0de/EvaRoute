import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../../../lib/api";

/**
 * Facilities registry state (GET /facility). `statusFilter` and `showDeleted`
 * map to the server query; search is client-side over the fetched rows (the
 * endpoint has no server-side search). Owns filter state, fetching, retry
 * and the visible rows; the mutation flows stay in the page.
 */
export default function useFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .listFacilities({ status: statusFilter || undefined, deleted: showDeleted })
      .then((rows) => {
        if (!cancelled) setFacilities(rows);
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
  }, [statusFilter, showDeleted, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return facilities;
    return facilities.filter(
      (facility) =>
        facility.name.toLowerCase().includes(needle) ||
        facility.address.toLowerCase().includes(needle),
    );
  }, [facilities, search]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    showDeleted,
    setShowDeleted,
    visible,
    loading,
    error,
    retry,
  };
}
