import { useEffect, useRef, useState } from "react";
import { getDashboardSummary } from "../lib/api";

/**
 * Dashboard aggregate (GET /api/v1/dashboard/summary) — facility states,
 * live occupancy, staff states, rolling activity windows and per-facility
 * load in one request. Query-key tagging like the activity hooks so a stale
 * response never overwrites a newer one.
 */
export default function useDashboardSummary(facilityId) {
  const key = facilityId ?? "network";
  const [state, setState] = useState({ forKey: null, data: null, error: null });
  const [tick, setTick] = useState(0);
  const keyRef = useRef(key);

  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    keyRef.current = key;
    getDashboardSummary({ facilityId })
      .then((data) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, data, error: null });
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, data: null, error });
      });
  }, [key, facilityId, tick]);

  return {
    summary: state.forKey === key ? state.data : null,
    loading: state.forKey !== key || state.data === null,
    error: state.error,
    reload,
  };
}
