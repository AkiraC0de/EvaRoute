import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import TextField, { SelectField } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { hasRole, ROLES } from "../../app/roles";
import { listFacilities } from "../../lib/api";
import useAsyncAction from "../../hooks/useAsyncAction";
import PagedActivityFeed from "../activity/PagedActivityFeed";

/**
 * Segmented action-group filters. `value` is the comma-separated `action`
 * query param the server accepts.
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

const chipClass = (active) =>
  [
    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
    active
      ? "bg-accent text-white shadow-clay-accent"
      : "border border-border/60 bg-canvas text-ink-muted shadow-clay hover:text-accent active:shadow-clay-inset",
  ].join(" ");

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
    if (from) q.from = from;
    if (to) q.to = new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
    return q;
  }, [action, facilityId, search, from, to, admin]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Activity history"
        detail={
          admin
            ? "Every meaningful change across the network — check-ins, resource edits, staff actions and sign-ins."
            : "Everything that has happened at your facility — check-ins, resource edits and staff actions."
        }
      />

      <div className="overflow-hidden rounded-clay bg-surface shadow-clay">
        {/* Toolbar: search + scope + date range */}
        <div className="flex flex-col gap-3 border-b border-border/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <TextField
              label="Search"
              id="activity-search"
              type="text"
              className="lg:col-span-2"
              leadingIcon={Search}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Family, staff or facility name"
            />

            {admin && (
              <SelectField
                label="Facility"
                id="activity-facility"
                value={facilityId}
                onChange={(event) => setFacilityId(event.target.value)}
              >
                <option value="">All facilities</option>
                {facilityOptions.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </SelectField>
            )}

            <TextField
              label="From"
              id="activity-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />

            <TextField
              label="To"
              id="activity-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          {/* Segmented action-group filters */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by activity type">
            {GROUP_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={action === option.value}
                onClick={() => setAction(option.value)}
                className={chipClass(action === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date-grouped timeline with numbered pagination. The key remounts
            the feed on filter changes so pagination restarts at page 1. */}
        <PagedActivityFeed
          key={JSON.stringify(query)}
          query={query}
          pageSize={PAGE_SIZE}
          showFacility={admin}
        />
      </div>

      <p className="flex items-center gap-1.5 px-1 text-xs text-ink-muted">
        <CalendarDays size={13} />
        Newest first. {admin ? "" : "Limited to your facility."} Times shown in your local timezone.
      </p>
    </div>
  );
}
