import { useCallback, useState } from "react";

/**
 * Wraps an async action with the busy/error bookkeeping every mutation in this
 * app needs: disable controls while in flight, surface the API's own message on
 * failure, never leave `busy` stuck on.
 *
 *   const { busy, error, setError, run } = useAsyncAction();
 *   onClick={() => run(() => api.updateResource(...))}
 *
 * `run` resolves to true on success, false on failure — callers that reset
 * forms or close panels on success can branch on it.
 */
export default function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (err) {
      setError(err.message || "The action could not be completed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, setError, run };
}
