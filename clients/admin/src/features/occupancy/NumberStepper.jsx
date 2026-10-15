/**
 * Labelled number stepper used by the check-in form.
 */
const NumberStepper = ({ label, value, onChange }) => (
  <div>
    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
      {label}
    </label>
    <div className="flex h-9 items-center justify-between rounded-full bg-[#f3f5fa] p-1 shadow-inner">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#5269ef] shadow-sm hover:bg-[#e8edff]"
      >
        -
      </button>
      <span className="min-w-6 text-center text-[10px] font-bold text-[#35405e]">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#5269ef] shadow-sm hover:bg-[#e8edff]"
      >
        +
      </button>
    </div>
  </div>
);

export default NumberStepper;
