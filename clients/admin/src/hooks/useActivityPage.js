import { useEffect, useRef, useState } from "react";
import { listActivity } from "../lib/api";

/**
 * Numbered-pagination fetch for the History screen (server `page` mode).
 * Same tagging discipline as useActivity: a response only lands while its
 * query key + page are still current.
 *
 * @param {object} query     { facilityId?, action?, search?, from?, to? }
 * @param {number} pageSize  rows per page (default 15)
 */
export default function useActivityPage(query = {}, pageSize = 15) {
  const [page, setPage] = useState(1);
  const [reloadTick, setReloadTick] = useState(0);
  const key = JSON.stringify(query ?? {}) + "::" + page + "::" + reloadTick;

  const [state, setState] = useState({
    forKey: null,
    items: [],
    total: 0,
    totalPages: 1,
    error: null,
  });

  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    listActivity({ ...query, limit: pageSize, page })
      .then((result) => {
        if (keyRef.current !== key) return;
        setState({
          forKey: key,
          items: result.activities,
          total: result.total ?? result.activities.length,
          totalPages: result.totalPages ?? 1,
          error: null,
        });
      })
      .catch((error) => {
        if (keyRef.current !== key) return;
        setState({ forKey: key, items: [], total: 0, totalPages: 1, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key derives from query/page
  }, [key, pageSize]);

  return {
    activities: state.forKey === key ? state.items : [],
    total: state.forKey === key ? state.total : 0,
    totalPages: state.forKey === key ? state.totalPages : 1,
    page,
    loading: state.forKey !== key,
    error: state.error,
    setPage,
    reload: () => setReloadTick((tick) => tick + 1),
  };
}
