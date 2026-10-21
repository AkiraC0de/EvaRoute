import Button from "../../components/ui/Button";
import { FilterBand, FilterRow, FilterClear, FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
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
  onClear,
}) => {
  const dirty = Boolean(searchInput || action || facilityId || from || to);
  return (
  <FilterBand stacked>
    <FilterRow>
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
      {dirty && onClear && <FilterClear onClick={onClear} />}
    </FilterRow>
    <FilterRow>
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
    </FilterRow>
  </FilterBand>
  );
};

export default HistoryFilterBar;
