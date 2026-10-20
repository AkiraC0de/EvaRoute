/**
 * Compact two-option segmented control for essential resource availability.
 * Text + tone communicate the state (never color alone): the tones come from
 * the one status taxonomy (AVAILABLE = success, UNAVAILABLE = danger, same
 * as StatusPill/statusColors). Keyboard: both options are real buttons in
 * tab order.
 */
const ResourceStatusToggle = ({ name, value, onChange, disabled = false }) => (
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
      className={`min-h-11 rounded-md px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink sm:min-h-8 ${
        value === true
          ? "bg-success-soft text-success"
          : "text-muted hover:text-ink-soft"
      } disabled:opacity-50`}
    >
      Available
    </button>
    <button
      type="button"
      aria-pressed={value === false}
      disabled={disabled}
      onClick={() => onChange(false)}
      className={`min-h-11 rounded-md px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink sm:min-h-8 ${
        value === false
          ? "bg-danger-soft text-danger-strong"
          : "text-muted hover:text-ink-soft"
      } disabled:opacity-50`}
    >
      Unavailable
    </button>
  </div>
);

export default ResourceStatusToggle;
