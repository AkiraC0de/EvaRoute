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
  "min-h-8 min-w-8 rounded-full bg-surface px-1.5 py-1 text-[11px] font-semibold text-accent shadow-clay-xs transition hover:bg-accent-soft hover:shadow-clay active:shadow-clay-inset focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50";

const QuantityStepper = ({ name, value, busy, onStep }) => (
  <div className="flex items-center gap-1 rounded-full bg-sunken p-1 shadow-clay-inset">
    {DECREASE.map((delta) => (
      <button
        key={delta}
        type="button"
        aria-label={`${delta} ${name}`}
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
