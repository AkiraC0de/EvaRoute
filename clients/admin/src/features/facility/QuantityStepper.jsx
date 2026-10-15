/**
 * Counted-stock control for QUANTITY resources: fine (-1/+1) and coarse
 * (-10/+10) stepping around the persisted availableValue. Button order
 * matches the original card exactly (-1, -10, value, +10, +1). Every click
 * calls `onStep(delta)` — the parent performs the PATCH and feeds the saved
 * record back in, so the control never shows unsaved numbers.
 */
const DECREASE = [-1, -10];
const INCREASE = [10, 1];

const QuantityStepper = ({ name, value, busy, onStep }) => (
  <div className="flex items-center gap-1 rounded-full bg-[#f0f2f7] p-1">
    {DECREASE.map((delta) => (
      <button
        key={delta}
        type="button"
        aria-label={`${delta} ${name}`}
        disabled={busy}
        onClick={() => onStep(delta)}
        className="min-w-9 rounded-full bg-white px-2 py-1.5 text-[10px] font-semibold text-[#5269ef] transition hover:bg-[#e8edff] focus-visible:outline-2 focus-visible:outline-[#5269ef] disabled:opacity-50"
      >
        {delta}
      </button>
    ))}
    <span className="min-w-9 text-center text-[9px] font-bold text-[#35405e]">
      {busy ? "…" : value}
    </span>
    {INCREASE.map((delta) => (
      <button
        key={delta}
        type="button"
        aria-label={`+${delta} ${name}`}
        disabled={busy}
        onClick={() => onStep(delta)}
        className="min-w-9 rounded-full bg-white px-2 py-1.5 text-[10px] font-semibold text-[#5269ef] transition hover:bg-[#e8edff] focus-visible:outline-2 focus-visible:outline-[#5269ef] disabled:opacity-50"
      >
        +{delta}
      </button>
    ))}
  </div>
);

export default QuantityStepper;
