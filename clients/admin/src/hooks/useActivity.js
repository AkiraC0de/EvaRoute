import { useEffect, useRef, useState } from "react";
import { listActivity } from "../lib/api";

/**
 * Fetches a page of activity for the given query and supports cursor
 * "load more". Results are tagged with their query key (via a ref checked at
 * response time), so a stale response can never overwrite a newer query's
 * feed — and no state is set synchronously inside the effect.
 *
 * @param {object} query  { facilityId?, action?, actorId?, from?, to? }
 * @param {number} limit  page size (default 6 — compact strips use 5)
 */
export default function useActivity(query = {}, limit = 6) {
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(query ?? {}) + "::" + tick;
  const [state, setState] = useState({
    forKey: null,
    items: [],
    nextCursor: null,
    error: null,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Latest key for staleness checks in async callbacks (no render triggered).
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    listActivity({ ...query, limit })
      .then((result) => {
        if (keyRef.current !== key) return;
        setState({
          forKey: key,
          items: result.activities,
          nextCursor: result.nextCursor,
          error: null,
        });
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, items: [], nextCursor: null, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key derives from query
  }, [key, limit]);

  const loadMore = () => {
    const cursor = state.nextCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    listActivity({ ...query, limit, cursor })
      .then((result) => {
        if (keyRef.current !== key) return;
        setState((current) =>
          current.forKey === key && current.nextCursor === cursor
            ? {
                ...current,
                items: [...current.items, ...result.activities],
                nextCursor: result.nextCursor,
              }
            : current,
        );
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        setState((current) => ({ ...current, error }));
      })
      .finally(() => setLoadingMore(false));
  };

  // Re-fetches the first page (drops loaded pages — expected for a refresh).
  const reload = () => setTick((current) => current + 1);

  return {
    activities: state.forKey === key ? state.items : [],
    nextCursor: state.forKey === key ? state.nextCursor : null,
    loading: state.forKey !== key,
    error: state.error,
    loadMore,
    loadingMore,
    reload,
  };
}
