import { Search } from "lucide-react";
import SelectInput from "./Select";

/**
 * Compact filter-band controls — the bordered inputs used by the list-page
 * filter bands (Facilities, Staff accounts, History). One copy of the
 * styling so every band looks and behaves the same.
 */

const CONTROL_CLASS =
  "h-11 sm:h-10 rounded-md border border-line-strong bg-surface px-3 text-[12px] font-medium text-ink-soft outline-none transition focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

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

const FilterSelect = ({ value, onChange, ariaLabel, children, className = "" }) => (
  /* Radix Select behind the native <select> contract — see Select.jsx. */
  <SelectInput
    value={value}
    onChange={onChange}
    ariaLabel={ariaLabel}
    className={`${CONTROL_CLASS} appearance-none pr-7 ${className}`}
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

export { FilterSearch, FilterSelect, FilterDate };
