import { motion, useReducedMotion } from "motion/react";
import Button from "./Button";

/**
 * Shared loading / empty / error block.
 *
 * Used so that a failed request can never be mistaken for an empty result: the
 * error tone always renders the API's own message and a retry control.
 */
const TONES = {
  info: {
    wrap: "border border-line bg-surface-2 text-muted",
    title: "text-ink-soft",
  },
  empty: {
    wrap: "border border-line bg-surface-2 text-muted",
    title: "text-ink-soft",
  },
  error: {
    wrap: "border border-danger/15 bg-danger-soft text-danger",
    title: "text-danger-strong",
  },
};

const StatusPanel = ({ tone = "info", title, children, onRetry, retryLabel = "Try again" }) => {
  const palette = TONES[tone] ?? TONES.info;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role={tone === "error" ? "alert" : "status"}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-lg px-4 py-6 text-center text-[13px] ${palette.wrap}`}
    >
      {title && (
        <p className={`text-[14px] font-bold ${palette.title}`}>{title}</p>
      )}
      {children && <p className="mt-1 leading-relaxed">{children}</p>}
      {onRetry && (
        <Button variant="neutral" size="sm" onClick={onRetry} className="mt-3">
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default StatusPanel;
