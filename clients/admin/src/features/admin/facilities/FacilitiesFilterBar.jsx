import Button from "../../../components/ui/Button";
import { FilterBand, FilterClear, FilterSearch, FilterSelect } from "../../../components/ui/FilterControls";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

/**
 * Facilities filter band — the flat surface-2 band of search, status filter
 * and the deleted/restored tab toggle. Controlled: the page owns the filter
 * state.
 */
const FacilitiesFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showDeleted,
  onToggleDeleted,
  onClear,
}) => {
  const dirty = Boolean(search || statusFilter || showDeleted);
  return (
  <FilterBand>
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
        <option  key={option.value} value={option.value}>{option.label}</option>
      ))}
    </FilterSelect>
    <Button
      variant={showDeleted ? "soft" : "neutral"}
      size="sm"
      onClick={onToggleDeleted}
    >
      {showDeleted ? "Showing deleted" : "Deleted facilities"}
    </Button>
    {dirty && onClear && <FilterClear onClick={onClear} />}
  </FilterBand>
  );
};

export default FacilitiesFilterBar;
