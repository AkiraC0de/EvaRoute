import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * URL-backed filter state — filters live in the query string, so filtered
 * lists are shareable, survive refresh, and work with the back button.
 *
 * Write policy: text inputs write with `replace` (no history spam while
 * typing); discrete changes (selects, toggles, presets) write with `push`
 * so Back steps through them. Clearing is a push. Values equal to their
 * default are removed from the URL entirely — clean, short links.
 */
export default function useUrlFilters(defaults) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out = {};
    for (const key of Object.keys(defaults)) {
      out[key] = params.get(key) ?? defaults[key];
    }
    return out;
    // defaults is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const apply = useCallback(
    (entries, { replace = false } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(entries)) {
            if (value === defaults[key] || value === "" || value == null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams]
  );

  const set = useCallback(
    (key, value, options) => apply({ [key]: value }, options),
    [apply]
  );

  const clear = useCallback(() => setParams(new URLSearchParams(), {}), [setParams]);

  return { values, set, apply, clear };
}
