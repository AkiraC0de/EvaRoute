/**
 * Registry view modes — List / Map / Split, in the app's soft/neutral
 * segmented-toggle language (same as the history action groups). Split links
 * the table and the map side by side on desktop and stacks them on mobile.
 */
const MODES = [
  { value: "list", label: "List" },
  { value: "map", label: "Map" },
  { value: "split", label: "Split" },
];

const FacilitiesViewToggle = ({ view, onChange }) => (
  <div className="flex items-center gap-1" role="group" aria-label="Registry view">
    {MODES.map((mode) => (
      <button
        key={mode.value}
        type="button"
        aria-pressed={view === mode.value}
        onClick={() => onChange(mode.value)}
        className={`min-h-9 rounded-md border px-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
          view === mode.value
            ? "border-transparent bg-primary-soft text-primary-ink"
            : "border-line-strong bg-surface text-muted hover:text-ink-soft"
        }`}
      >
        {mode.label}
      </button>
    ))}
  </div>
);

export default FacilitiesViewToggle;
