import { Search, X } from "lucide-react";
import SelectInput from "./Select";

/**
 * Compact filter-band controls — the bordered inputs used by the list-page
 * filter bands (Facilities, Staff accounts, History). One copy of the
 * styling so every band looks and behaves the same.
 */

const CONTROL_CLASS =
  "h-11 sm:h-10 rounded-md border border-line-strong bg-surface px-3 text-[12px] font-medium text-ink-soft outline-none transition focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink";

/**
 * The ONE filter-band shell — chrome + responsive row layout shared by every
 * list page's filter area (Staff, Facilities, History). One copy of the
 * band styling so the three pages cannot drift apart again. `stacked` wraps
 * children in full-width rows (History: controls row + its action toggles).
 */
const FilterBand = ({ stacked = false, onClear, hasActive = false, children }) => (
  <div className="mb-4 rounded-lg border border-line-strong bg-surface-2 p-3">
    {stacked ? (
      <div className="flex flex-col gap-2.5">{children}</div>
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {/* Filtering stays reversible: one shared way out of any filter set. */}
        {hasActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-muted transition hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    )}
  </div>
);

/**
 * Trailing "Clear filters" action — rendered by each band only while its
 * filters are active, so filtering stays reversible and the active set is
 * visible as one resettable unit (shared styling: all three pages alike).
 */
const FilterClear = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="ml-auto inline-flex h-11 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold text-muted transition hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink sm:h-10"
  >
    <X size={12} strokeWidth={2.2} aria-hidden="true" />
    Clear filters
  </button>
);

/** One wrapping row inside a stacked FilterBand. */
const FilterRow = ({ children }) => (
  <div className="flex flex-wrap items-center gap-2">{children}</div>
);

const FilterSearch = ({ value, onChange, placeholder, ariaLabel, className = "" }) => (
  <div className={`relative w-full max-w-[240px] ${className}`}>
    <Search
      size={13}
      strokeWidth={2}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-dim"
    />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={`${CONTROL_CLASS} w-full pl-8 pr-3 placeholder:text-muted-dim ${className}`}
    />
  </div>
);

/** Standard filter-select sizing — one width language for every band. */
const SELECT_CLASS = "min-w-[148px] max-w-[240px]";

const FilterSelect = ({ value, onChange, ariaLabel, children, className = "" }) => (
  /* Radix Select behind the native <select> contract — see Select.jsx. */
  <SelectInput
    value={value}
    onChange={onChange}
    ariaLabel={ariaLabel}
    className={`${CONTROL_CLASS} appearance-none pr-7 ${SELECT_CLASS} ${className}`}
  >
    {children}
  </SelectInput>
);

const FilterDate = ({ value, onChange, ariaLabel, label }) => (
  <label className="flex items-center gap-1.5">
    <span className="text-[11px] font-medium text-muted">{label}</span>
    <input
      type="date"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className={CONTROL_CLASS}
    />
  </label>
);

export { FilterBand, FilterRow, FilterClear, FilterSearch, FilterSelect, FilterDate, CONTROL_CLASS };
