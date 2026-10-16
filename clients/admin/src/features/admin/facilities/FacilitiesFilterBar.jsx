import Button from "../../../components/ui/Button";
import { FilterSearch, FilterSelect } from "../../../components/ui/FilterControls";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

/**
 * Facilities filter band — the recessed row of search, status filter and the
 * deleted/restored tab toggle. Controlled: the page owns the filter state.
 */
const FacilitiesFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showDeleted,
  onToggleDeleted,
}) => (
  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-clay bg-surface p-3 shadow-clay">
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
      className="w-27"
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
  </div>
);

export default FacilitiesFilterBar;
