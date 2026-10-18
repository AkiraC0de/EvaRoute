import { FilterSearch, FilterSelect } from "../../../components/ui/FilterControls";
import Checkbox from "../../../components/ui/Checkbox";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

/**
 * Filter band — search, status and the unassigned-only toggle. Change
 * handlers receive the raw DOM event, like the facilities filter bar.
 */
const StaffToolbar = ({ filters, onSearchChange, onStatusChange, onUnassignedChange }) => (
  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-clay bg-surface p-3 shadow-clay">
    <FilterSearch
      value={filters.search}
      onChange={onSearchChange}
      placeholder="Search email or name…"
      ariaLabel="Search staff accounts"
    />
    <FilterSelect
      value={filters.status}
      onChange={onStatusChange}
      ariaLabel="Filter by status"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </FilterSelect>
    <label className="flex items-center gap-1.5">
      <Checkbox
        checked={filters.unassigned}
        onChange={onUnassignedChange}
        ariaLabel="Unassigned only"
      />
      <span className="text-[11px] font-medium text-[#65718c]">Unassigned only</span>
    </label>
  </div>
);

export default StaffToolbar;
