import { useCallback, useState } from "react";
import { useToast } from "../components/ui/toastContext";

/**
 * Wraps an async action with the busy/error bookkeeping every mutation in this
 * app needs: disable controls while in flight, surface the API's own message on
 * failure, never leave `busy` stuck on.
 *
 *   const { busy, error, setError, run } = useAsyncAction();
 *   onClick={() => run(() => api.updateResource(...))}
 *
 * `run` resolves to true on success, false on failure — callers that reset
 * forms or close panels on success can branch on it. Success feedback is the
 * request layer's own server-message toast (ONE per mutation — never add a
 * second one here); failures ALWAYS toast (modals hide the page banners) and
 * still land in the local `error` state as before.
 */
export default function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const run = useCallback(
    async (action) => {
      setBusy(true);
      setError("");
      try {
        await action();
        return true;
      } catch (err) {
        const message = err.message || "The action could not be completed.";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  return { busy, error, setError, run };
}
