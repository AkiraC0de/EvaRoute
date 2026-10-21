import { FilterBand, FilterClear, FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
import DateRangePicker from "../../components/ui/DateRangePicker";

/**
 * Action-group options. `value` is the comma-separated `action` query param
 * the server accepts — rendered as ONE select so the band stays a calm
 * control row instead of a wall of toggle buttons.
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
 * History filter band — the shared single-row band shell (same geometry as
 * Staff/Facilities): search + activity select + facility select + one date
 * control whose popover carries the quick presets. Controlled: the page
 * owns the filter state and the debounced search.
 */
const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/** Preset ranges (local days) offered inside the date popover; "All dates" clears. */
const PRESETS = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "All dates", days: 0 },
];

const presetRange = (days) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: dateKey(from), to: dateKey(to) };
};

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
  const datePresets = PRESETS.map((preset) => ({
    label: preset.label,
    ...(preset.days > 0 ? presetRange(preset.days) : { from: "", to: "" }),
  }));
  return (
    <FilterBand>
      <FilterSearch
        value={searchInput}
        onChange={onSearchChange}
        placeholder="Search family, staff or facility…"
        ariaLabel="Search activity"
      />
      <FilterSelect
        value={action}
        onChange={(event) => onActionChange(event.target.value)}
        ariaLabel="Filter by activity type"
      >
        {GROUP_OPTIONS.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>
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
        presets={datePresets}
      />
      {dirty && onClear && <FilterClear onClick={onClear} />}
    </FilterBand>
  );
};

export default HistoryFilterBar;
