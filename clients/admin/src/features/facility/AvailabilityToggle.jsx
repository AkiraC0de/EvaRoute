/**
 * Availability control for BOOLEAN resources. `value` is the persisted
 * isAvailable (true / false / null = unset); toggling calls `onToggle(next)`.
 * Active tones follow the one status taxonomy (AVAILABLE = success,
 * UNAVAILABLE = danger) with the state spelled out in text as well.
 */
const AvailabilityToggle = ({ value, busy, onToggle }) => (
  <div className="flex w-full items-center rounded-full bg-surface-2 p-1">
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
        className={`min-h-11 flex-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 sm:min-h-8 ${
          option.active
            ? option.next
              ? "bg-success text-white"
              : "bg-danger text-white"
            : "text-muted hover:text-ink-soft"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default AvailabilityToggle;
