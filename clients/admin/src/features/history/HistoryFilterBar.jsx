import Button from "../../components/ui/Button";
import { FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
import DateRangePicker from "../../components/ui/DateRangePicker";

/**
 * Segmented action-group filters. `value` is the comma-separated `action`
 * query param the server accepts. Rendered as the app's standard soft/neutral
 * toggle buttons (same language as the Facilities "deleted" toggle).
 */
const GROUP_OPTIONS = [
  { value: "", label: "All activity" },
  { value: "STAY_CHECKED_IN,STAY_CHECKED_OUT", label: "Stays" },
  { value: "RESOURCE_CREATED,RESOURCE_UPDATED,RESOURCE_DELETED", label: "Resources" },
  {
    value: "STAFF_ACCOUNT_CREATED,STAFF_ACCOUNT_UPDATED,STAFF_ACTIVATED,STAFF_DEACTIVATED,STAFF_PASSWORD_RESET,STAFF_DELETED,STAFF_ASSIGNED,STAFF_DISMISSED",
    label: "Staff",
  },
  {
    value: "FACILITY_CREATED,FACILITY_UPDATED,FACILITY_DELETED,FACILITY_RESTORED",
    label: "Facilities",
  },
  {
    value: "AUTH_LOGIN,AUTH_SIGN_OUT,AUTH_SIGN_OUT_ALL,AUTH_PASSWORD_RESET_REQUESTED,AUTH_PASSWORD_RESET",
    label: "Sign-ins",
  },
];

/**
 * History filter band — a flat bordered band (hairline + surface, no
 * elevation): controls row + action-group toggles row. Controlled: the page
 * owns the filter state and the debounced search.
 */
const HistoryFilterBar = ({
  searchInput,
  onSearchChange,
  admin,
  facilityId,
  onFacilityChange,
  facilityOptions,
  from,
  to,
  onDateRangeChange,
  action,
  onActionChange,
}) => (
  <div className="mb-4 flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3">
    <div className="flex flex-wrap items-center gap-2">
      <FilterSearch
        value={searchInput}
        onChange={onSearchChange}
        placeholder="Search family, staff or facility…"
        ariaLabel="Search activity"
      />
      {admin && (
        <FilterSelect
          value={facilityId}
          onChange={onFacilityChange}
          ariaLabel="Filter by facility"
          className="max-w-[220px]"
        >
          <option value="">All facilities</option>
          {facilityOptions.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </FilterSelect>
      )}
      <DateRangePicker
        from={from}
        to={to}
        onChange={onDateRangeChange}
      />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {GROUP_OPTIONS.map((option) => (
        <Button
          key={option.label}
          size="sm"
          variant={action === option.value ? "soft" : "neutral"}
          aria-pressed={action === option.value}
          onClick={() => onActionChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

export default HistoryFilterBar;
