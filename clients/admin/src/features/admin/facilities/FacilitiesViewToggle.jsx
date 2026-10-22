import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Registry view modes — List / Map / Split, in the check-in list's mode-toggle
 * design language: an inset surface-2 track with a sliding primary pill
 * (motion `layoutId`, per-instance id so sibling toggles never collide) and
 * white labels on the active segment. Split links the table and the map side
 * by side on desktop and stacks them on mobile.
 */
const MODES = [
  { value: "list", label: "List" },
  { value: "map", label: "Map" },
  { value: "split", label: "Split" },
];

const FacilitiesViewToggle = ({ view, onChange }) => {
  const reduceMotion = useReducedMotion();
  const pillId = `facilities-view-pill-${useId()}`;
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 40, mass: 0.85 };

  return (
    <div
      role="group"
      aria-label="Registry view"
      className="flex h-11 items-center gap-1 rounded-md bg-white p-1 sm:h-10"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          aria-pressed={view === mode.value}
          onClick={() => onChange(mode.value)}
          className={`relative flex h-full items-center  rounded-xs px-4 text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
            view === mode.value ? "text-white font-bold" : "text-muted hover:text-ink-soft"
          }`}
        >
          {view === mode.value && (
            <motion.span
              layoutId={pillId}
              aria-hidden="true"
              transition={pillTransition}
              className="absolute inset-0 rounded-sm bg-primary"
            />
          )}
          <span className="relative z-10">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FacilitiesViewToggle;
