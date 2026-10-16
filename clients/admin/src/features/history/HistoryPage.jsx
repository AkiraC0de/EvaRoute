import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
import DateRangePicker from "../../components/ui/DateRangePicker";
import { useAuth } from "../../context/AuthContext";
import { hasRole, ROLES } from "../../app/roles";
import { listFacilities } from "../../lib/api";
import useAsyncAction from "../../hooks/useAsyncAction";
import PagedActivityFeed from "../activity/PagedActivityFeed";

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

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const { user } = useAuth();
  const admin = hasRole(user, [ROLES.ADMIN]);

  const [action, setAction] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // Debounced: the API is queried with `search` once typing settles.
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Facility options only matter for admins (staff scope is server-enforced).
  const facilitiesState = useAsyncAction(async () => {
    if (!admin) return [];
    return listFacilities();
  }, [admin]);
  const facilityOptions = facilitiesState.data ?? [];

  const query = useMemo(() => {
    const q = {};
    if (action) q.action = action;
    if (admin && facilityId) q.facilityId = facilityId;
    if (search) q.search = search;
    // Day bounds are computed in LOCAL time so the filtered rows match the
    // local day-group labels the user sees (bare "YYYY-MM-DD" parses as UTC).
    if (from) {
      const [fy, fm, fd] = from.split("-").map(Number);
      q.from = new Date(fy, fm - 1, fd, 0, 0, 0, 0).toISOString();
    }
    if (to) {
      const [ty, tm, td] = to.split("-").map(Number);
      q.to = new Date(ty, tm - 1, td, 23, 59, 59, 999).toISOString();
    }
    return q;
  }, [action, facilityId, search, from, to, admin]);

  return (
    <div>
      <PageHeader
        title="Activity history"
        subtitle={
          admin
            ? "Every meaningful change across the network — check-ins, resource edits, staff actions and sign-ins."
            : "Everything that has happened at your facility — check-ins, resource edits and staff actions."
        }
      />

      {/* Filter bar — recessed band: controls row + action-group toggles row */}
      <div className="mb-4 flex flex-col gap-2.5 rounded-clay bg-surface p-3 shadow-clay">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSearch
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search family, staff or facility…"
            ariaLabel="Search activity"
          />
          {admin && (
            <FilterSelect
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
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
            onChange={(next) => {
              setFrom(next.from);
              setTo(next.to);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {GROUP_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={action === option.value ? "soft" : "neutral"}
              aria-pressed={action === option.value}
              onClick={() => setAction(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Activity feed — raised surface. The key remounts the feed on filter
          changes so pagination restarts at page 1. */}
      <Card pad="">
        <PagedActivityFeed
          key={JSON.stringify(query)}
          query={query}
          pageSize={PAGE_SIZE}
          showFacility={admin}
        />
      </Card>

      <p className="mt-3 text-[11px] text-muted">
        Newest first. {admin ? "" : "Limited to your facility."} Times shown in your local timezone.
      </p>
    </div>
  );
}
