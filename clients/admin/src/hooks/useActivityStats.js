import { useEffect, useRef, useState } from "react";
import { listActivityStats } from "../lib/api";

/**
 * Accurate activity counts for a period (default: server's 7-day window).
 * Same tagging discipline as useActivity: responses only land while their
 * query key is still current.
 *
 * @param {object} window  { from?, to? } ISO strings
 */
export default function useActivityStats(window = {}) {
  const key = JSON.stringify(window ?? {});
  const [state, setState] = useState({
    forKey: null,
    total: 0,
    byAction: {},
    error: null,
  });

  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    listActivityStats(window)
      .then((result) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, total: result.total, byAction: result.byAction, error: null });
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, total: 0, byAction: {}, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key derives from window
  }, [key]);

  return {
    total: state.forKey === key ? state.total : 0,
    byAction: state.forKey === key ? state.byAction : {},
    loading: state.forKey !== key,
    error: state.error,
  };
}
