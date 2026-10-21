import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { ToastContext } from "./toastContext";

/**
 * Toast feedback for mutations — the app's action-confirmation layer.
 * Flat bordered chips in a bottom-right stack (clear of the mobile nav),
 * auto-dismissing after 4s, dismissable by hand, announced via aria-live.
 * Success is a quiet confirmation; error toasts make failures inside MODALS
 * visible (the page banners sit behind overlays). Same tone language as the
 * rest of the app: success/error status colors, text carries the meaning.
 */

let nextId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone) => {
      const id = (nextId += 1);
      setToasts((current) => [...current, { id, message, tone }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 sm:bottom-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.15 } }
              }
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-sm ${
                toast.tone === "error"
                  ? "border-danger/20 bg-danger-soft"
                  : "border-line bg-surface"
              }`}
            >
              {toast.tone === "error" ? (
                <XCircle size={15} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-danger" />
              ) : (
                <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-success" />
              )}
              <p
                className={`min-w-0 flex-1 text-[12px] font-medium text-pretty ${
                  toast.tone === "error" ? "text-danger" : "text-ink-soft"
                }`}
              >
                {toast.message}
              </p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className={`shrink-0 rounded-md p-0.5 transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
                  toast.tone === "error" ? "text-danger" : "text-muted"
                }`}
              >
                <X size={13} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
