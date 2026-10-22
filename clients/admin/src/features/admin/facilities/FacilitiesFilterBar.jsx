import { FilterBand, FilterSearch, FilterSelect } from "../../../components/ui/FilterControls";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

/**
 * Facilities filter band — shared shell, with the deleted toggle promoted to
 * explicit Active/Deleted tabs carrying counts (restore-flow visibility).
 * Controlled: the page owns the filter state and the counts.
 */
const FacilitiesFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showDeleted,
  onTabChange,
  activeCount,
  deletedCount,
  onClear,
}) => {
  const hasActive = Boolean(search || statusFilter || showDeleted);

  return (
    <FilterBand onClear={onClear} hasActive={hasActive}>
      <FilterSearch
        value={search}
        onChange={onSearchChange}
        placeholder="Search name or address…"
        ariaLabel="Search facilities"
      />
      <FilterSelect
        value={statusFilter}
        onChange={onStatusChange}
        ariaLabel="Filter by status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </FilterSelect>
      <div className="flex items-center gap-1" role="group" aria-label="Facility registry tabs">
        {[
          { value: false, label: "Active", count: activeCount },
          { value: true, label: "Deleted", count: deletedCount },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={showDeleted === tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`min-h-9 rounded-md border px-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${
              showDeleted === tab.value
                ? "border-transparent bg-primary-soft text-primary-ink"
                : "border-line-strong bg-surface text-muted hover:text-ink-soft"
            }`}
          >
            {tab.label}
            {Number.isFinite(tab.count) && (
              <span className="ml-1.5 font-normal opacity-80">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </FilterBand>
  );
};

export default FacilitiesFilterBar;
