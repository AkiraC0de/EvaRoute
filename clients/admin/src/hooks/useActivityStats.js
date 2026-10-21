import { useEffect, useRef, useState } from "react";
import { listActivityStats } from "../lib/api";

/**
 * Accurate activity counts for a period (default: server's 7-day window).
 * Same tagging discipline as useActivity: responses only land while their
 * query key is still current. Counts are `null` until measured — a 0 must
 * be a measured zero, so callers render `—` (not a fake 0) while loading
 * or after a failure.
 *
 * @param {object} window  { from?, to? } ISO strings
 */
export default function useActivityStats(window = {}) {
  const key = JSON.stringify(window ?? {});
  const [state, setState] = useState({
    forKey: null,
    total: null,
    byAction: null,
    timeline: null,
    error: null,
  });

  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    listActivityStats(window)
      .then((result) => {
        if (keyRef.current !== key) return;
        setState({
          forKey: key,
          total: result.total,
          byAction: result.byAction,
          timeline: result.timeline,
          error: null,
        });
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        // Nulls, not zeros — a failure must never read as "0 events".
        setState({ forKey: key, total: null, byAction: null, timeline: null, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key derives from window
  }, [key]);

  return {
    total: state.forKey === key ? state.total : null,
    byAction: state.forKey === key ? state.byAction : null,
    timeline: state.forKey === key ? state.timeline : null,
    loading: state.forKey !== key,
    // An error only belongs to the window that produced it; a fresh window
    // starts clean instead of showing the stale failure.
    error: state.forKey === key ? state.error : null,
  };
}
