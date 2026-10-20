import { motion, useReducedMotion } from "motion/react";

/**
 * Counted-stock control for QUANTITY resources: fine (-1/+1) and coarse
 * (-10/+10) stepping around the persisted availableValue. Button order
 * matches the original card exactly (-1, -10, value, +10, -1 → -1, -10,
 * value, +10, +1). Every click calls `onStep(delta)` — the parent performs
 * the PATCH and feeds the saved record back in, so the control never shows
 * unsaved numbers. The value gets a tiny settle animation on each change.
 */
const DECREASE = [-1, -10];
const INCREASE = [10, 1];

const STEP_BUTTON =
  "min-h-11 min-w-11 rounded-full bg-surface px-1.5 py-1 text-[11px] font-semibold text-primary-ink transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-50 sm:min-h-8 sm:min-w-8";

const QuantityStepper = ({ name, value, busy, onStep }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
      {DECREASE.map((delta) => (
        <button
          key={delta}
          type="button"
          aria-label={`${delta} ${name}`}
          title={`${delta} ${name}`}
          disabled={busy}
          onClick={() => onStep(delta)}
          className={STEP_BUTTON}
        >
          {delta}
        </button>
      ))}
      <motion.span
        key={busy ? "busy" : String(value)}
        initial={reduceMotion ? false : { opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.15 }}
        className="min-w-8 text-center text-[12px] font-bold text-ink-soft"
      >
        {busy ? "…" : value}
      </motion.span>
      {INCREASE.map((delta) => (
        <button
          key={delta}
          type="button"
          aria-label={`+${delta} ${name}`}
          title={`+${delta} ${name}`}
          disabled={busy}
          onClick={() => onStep(delta)}
          className={STEP_BUTTON}
        >
          +{delta}
        </button>
      ))}
    </div>
  );
};

export default QuantityStepper;
