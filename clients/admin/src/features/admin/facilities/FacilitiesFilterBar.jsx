import { FilterBand, FilterSearch, FilterSelect } from "../../../components/ui/FilterControls";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

/**
 * Facilities filter band — shared shell: search, status filter and a registry
 * scope dropdown (Active / Deleted, counts in the option labels) that drives
 * the soft-delete restore flow. Controlled: the page owns the filter state
 * and the counts.
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
      <FilterSelect
        value={showDeleted ? "deleted" : "active"}
        onChange={(event) => onTabChange(event.target.value === "deleted")}
        ariaLabel="Registry scope"
      >
        <option value="active">
          Active {Number.isFinite(activeCount) ? ` · ${activeCount}` : ""}
        </option>
        <option value="deleted">
          Deleted {Number.isFinite(deletedCount) ? ` - ${deletedCount}` : ""}
        </option>
      </FilterSelect>
    </FilterBand>
  );
};

export default FacilitiesFilterBar;
