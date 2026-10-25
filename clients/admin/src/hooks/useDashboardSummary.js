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

  const reload = () => {
    // Clear the error so `loading` re-arms for the retry below.
    setState((prev) => ({ ...prev, error: null }));
    setTick((t) => t + 1);
  };

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
    // Loading resolves on error too: a failed fetch must not spin skeletons
    // forever (data stays null on failure — the error state is what renders).
    loading: state.forKey !== key || (state.data === null && state.error === null),
    // Stale errors are gated by key, like the activity hooks do.
    error: state.forKey === key ? state.error : null,
    reload,
  };
}
