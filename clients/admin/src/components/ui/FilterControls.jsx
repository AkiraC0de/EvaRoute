import { Search } from "lucide-react";

/**
 * Compact filter-band controls — the recessed inputs used by the list-page
 * filter bands (Facilities, Staff accounts, History). One copy of the
 * styling so every band looks and behaves the same.
 */

const CONTROL_CLASS =
  "h-9 rounded-clay-sm bg-sunken px-3 text-[10px] font-medium text-ink-soft shadow-clay-inset outline-none transition hover:bg-[#f2f5fb] ring-accent focus:ring-2";

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
      className={`h-9 w-full rounded-clay-sm bg-sunken pl-8 pr-3 text-[10px] font-medium text-ink-soft shadow-clay-inset outline-none transition placeholder:text-muted-dim hover:bg-[#f2f5fb] ring-accent focus:ring-2 ${className}`}
    />
  </div>
);

const FilterSelect = ({ value, onChange, ariaLabel, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    className={`${CONTROL_CLASS} ${className}`}
  >
    {children}
  </select>
);

const FilterDate = ({ value, onChange, ariaLabel, label }) => (
  <label className="flex items-center gap-1.5">
    <span className="text-[9px] font-medium text-[#65718c]">{label}</span>
    <input
      type="date"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className={CONTROL_CLASS}
    />
  </label>
);

export { FilterSearch, FilterSelect, FilterDate };
