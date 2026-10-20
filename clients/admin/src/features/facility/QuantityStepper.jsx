/**
 * Counted-stock control for QUANTITY resources: fine (-1/+1) and coarse
 * (-10/+10) stepping around the persisted availableValue. Button order
 * matches the original card exactly (-1, -10, value, +10, +1). Every click
 * calls `onStep(delta)` — the parent performs the PATCH and feeds the saved
 * record back in, so the control never shows unsaved numbers.
 */
const DECREASE = [-1, -10];
const INCREASE = [10, 1];

const STEP_BUTTON =
  "min-h-11 min-w-11 rounded-full bg-surface px-1.5 py-1 text-[11px] font-semibold text-primary-ink transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:opacity-50 sm:min-h-8 sm:min-w-8";

const QuantityStepper = ({ name, value, busy, onStep }) => (
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
    <span className="min-w-8 text-center text-[12px] font-bold text-ink-soft">
      {busy ? "…" : value}
    </span>
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

export default QuantityStepper;
