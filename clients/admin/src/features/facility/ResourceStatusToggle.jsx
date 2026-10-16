/**
 * Compact two-option segmented control for essential resource availability.
 * Text + tone communicate the state (never color alone): Available is a soft
 * success chip, Unavailable a neutral chip. Keyboard: both options are real
 * buttons in tab order.
 */
const ResourceStatusToggle = ({ name, value, onChange, disabled = false }) => (
  <div
    role="group"
    aria-label={`${name} availability`}
    className="inline-flex items-center gap-1 rounded-clay-sm bg-sunken p-1 shadow-clay-inset"
  >
    <button
      type="button"
      aria-pressed={value === true}
      disabled={disabled}
      onClick={() => onChange(true)}
      className={`rounded-clay-sm px-2.5 py-1 text-[9px] font-semibold transition ${
        value === true
          ? "bg-success-soft text-success shadow-clay-xs"
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
      className={`rounded-clay-sm px-2.5 py-1 text-[9px] font-semibold transition ${
        value === false
          ? "bg-surface text-ink-soft shadow-clay-xs"
          : "text-muted hover:text-ink-soft"
      } disabled:opacity-50`}
    >
      Unavailable
    </button>
  </div>
);

export default ResourceStatusToggle;
