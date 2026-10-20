import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Availability control for BOOLEAN resources. `value` is the persisted
 * isAvailable (true / false / null = unset); toggling calls `onToggle(next)`.
 * Active tones follow the one status taxonomy (AVAILABLE = success,
 * UNAVAILABLE = danger) with the state spelled out in text as well.
 *
 * The active side is a sliding pill (per-instance layoutId, colored by the
 * status it represents); labels switch color instantly via CSS.
 */
const AvailabilityToggle = ({ value, busy, onToggle }) => {
  const pillId = `availability-pill-${useId()}`;
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };
  const options = [
    { label: "Available", next: true, active: value === true },
    { label: "Unavailable", next: false, active: value === false },
  ];

  return (
    <div className="flex w-full items-center rounded-full bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={option.active}
          disabled={busy}
          onClick={() => onToggle(option.next)}
          className={`relative min-h-11 flex-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-60 sm:min-h-8 ${
            option.active ? "text-white" : "text-muted hover:text-ink-soft"
          }`}
        >
          {option.active && (
            <motion.span
              layoutId={pillId}
              aria-hidden="true"
              transition={pillTransition}
              className={`absolute inset-0 rounded-full ${option.next ? "bg-success" : "bg-danger"}`}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default AvailabilityToggle;
