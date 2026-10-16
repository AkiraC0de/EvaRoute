import { X } from "lucide-react";
import { FilterSearch } from "../../components/ui/FilterControls";

/**
 * Household lookup for the Occupancy dashboard: matches a household/family
 * name (case-insensitive, partial) or a Check-In ID (case-insensitive
 * substring, so the short 8-character prefix staff see in the list works
 * too). Controlled — the list owns the filtering.
 */
const HouseholdSearch = ({ value, onChange, resultCount }) => (
  <div className="flex flex-wrap items-center gap-2">
    <FilterSearch
      value={value}
      onChange={onChange}
      placeholder="Search family name or check-in ID…"
      ariaLabel="Search households by family name or check-in ID"
    />
    {value && (
      <>
        <span className="text-[11px] text-muted">
          {resultCount} match{resultCount === 1 ? "" : "es"}
        </span>
        <button
          type="button"
          aria-label="Clear household search"
          onClick={() => onChange({ target: { value: "" } })}
          className="inline-flex h-9 items-center gap-1 rounded-clay-sm bg-sunken px-2.5 text-[11px] font-semibold text-muted shadow-clay-inset transition hover:text-ink-soft"
        >
          <X size={11} strokeWidth={2} /> Clear
        </button>
      </>
    )}
  </div>
);

export default HouseholdSearch;
