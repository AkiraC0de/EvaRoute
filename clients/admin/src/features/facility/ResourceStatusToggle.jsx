import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Compact two-option segmented control for essential resource availability.
 * Text + tone communicate the state (never color alone): the tones come from
 * the one status taxonomy (AVAILABLE = success, UNAVAILABLE = danger, same
 * as StatusPill/statusColors). Keyboard: both options are real buttons in
 * tab order. The active side is a sliding pill (per-instance layoutId).
 */
const ResourceStatusToggle = ({ name, value, onChange, disabled = false }) => {
  const pillId = `resource-status-pill-${useId()}`;
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };

  return (
    <div
      role="group"
      aria-label={`${name} availability`}
      className="inline-flex items-center gap-1 rounded-md bg-surface-2 p-1"
    >
      <button
        type="button"
        aria-pressed={value === true}
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`relative min-h-11 rounded-md px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink sm:min-h-8 ${
          value === true ? "text-success" : "text-muted hover:text-ink-soft"
        } disabled:opacity-50`}
      >
        {value === true && (
          <motion.span
            layoutId={pillId}
            aria-hidden="true"
            transition={pillTransition}
            className="absolute inset-0 rounded-md bg-success-soft"
          />
        )}
        <span className="relative z-10">Available</span>
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`relative min-h-11 rounded-md px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink sm:min-h-8 ${
          value === false ? "text-danger-strong" : "text-muted hover:text-ink-soft"
        } disabled:opacity-50`}
      >
        {value === false && (
          <motion.span
            layoutId={pillId}
            aria-hidden="true"
            transition={pillTransition}
            className="absolute inset-0 rounded-md bg-danger-soft"
          />
        )}
        <span className="relative z-10">Unavailable</span>
      </button>
    </div>
  );
};

export default ResourceStatusToggle;
