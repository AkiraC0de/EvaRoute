/**
 * Availability control for BOOLEAN resources. `value` is the persisted
 * isAvailable (true / false / null = unset); toggling calls `onToggle(next)`.
 */
const AvailabilityToggle = ({ value, busy, onToggle }) => (
  <div className="flex w-full items-center rounded-full bg-[#f0f2f7] p-1">
    {[
      { label: "Available", next: true, active: value === true },
      { label: "Unavailable", next: false, active: value === false },
    ].map((option) => (
      <button
        key={option.label}
        type="button"
        aria-pressed={option.active}
        disabled={busy}
        onClick={() => onToggle(option.next)}
        className={`flex-1 rounded-full px-3 py-1.5 text-[9px] font-semibold transition disabled:opacity-60 ${
          option.active
            ? option.next
              ? "bg-[#188f61] text-white"
              : "bg-[#dbe1ed] text-[#35405e]"
            : "text-[#8995ad] hover:text-[#35405e]"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default AvailabilityToggle;
