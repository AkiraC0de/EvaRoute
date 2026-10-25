import { useEffect, useMemo, useState } from "react";
import useUrlFilters from "../../hooks/useUrlFilters";

// URL-backed filter defaults (keys appear as query params when active).
const HISTORY_FILTER_DEFAULTS = { search: "", action: "", facility: "", from: "", to: "" };
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { hasRole, ROLES } from "../../app/roles";
import { listFacilities } from "../../lib/api";
import PagedActivityFeed from "../activity/PagedActivityFeed";
import HistoryFilterBar from "./HistoryFilterBar";
import useDebouncedSearch from "./useDebouncedSearch";

const PAGE_SIZE = 15;

// URL date params are user-editable (?from=x): only a real "YYYY-MM-DD" day
// is a valid bound. Anything else falls back to "unset" — an Invalid Date
// would throw a RangeError from toISOString() during render and white-screen
// the app (there is no error boundary).
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const parseDay = (value) => {
  if (!DAY_KEY.test(value ?? "")) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : null;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const admin = hasRole(user, [ROLES.ADMIN]);

  const { values, set, apply, clear } = useUrlFilters(HISTORY_FILTER_DEFAULTS);
  // Debounced: the API is queried with `search` once typing settles.
  const { value: searchInput, debounced: search, setValue: setSearchInput } = useDebouncedSearch(350, values.search);

  // Keep the URL in sync with the debounced search (replace — typing is not
  // history), and follow external URL changes (back/forward buttons).
  useEffect(() => {
    if (search !== values.search) set("search", search, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  useEffect(() => {
    if (values.search !== search && values.search !== searchInput) {
      setSearchInput(values.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.search]);

  // Facility options only matter for admins (staff scope is server-enforced).
  // Fetched like the other feature hooks — useAsyncAction is a MUTATION
  // wrapper and never loads anything (it left this dropdown permanently
  // empty). State is set in the promise callbacks, not the effect body.
  const [facilities, setFacilities] = useState([]);
  useEffect(() => {
    if (!admin) return undefined;
    let cancelled = false;
    listFacilities()
      .then((rows) => {
        if (!cancelled) setFacilities(rows);
      })
      .catch(() => {
        if (!cancelled) setFacilities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [admin]);
  const facilityOptions = admin ? facilities : [];

  const query = useMemo(() => {
    const q = {};
    if (values.action) q.action = values.action;
    if (admin && values.facility) q.facilityId = values.facility;
    // The API caps `search` at 60 chars (activity.validations.ts max(60)) —
    // clamp before fetch so a longer term degrades to a prefix search instead
    // of a 400 the feed would surface as "Could not load activity".
    if (search) q.search = search.slice(0, 60);
    // Day bounds are computed in LOCAL time so the filtered rows match the
    // local day-group labels the user sees (bare "YYYY-MM-DD" parses as UTC).
    // Malformed ?from=/ ?to= values are ignored entirely (see parseDay).
    const fromDay = parseDay(values.from);
    if (fromDay) {
      q.from = new Date(
        fromDay.getFullYear(),
        fromDay.getMonth(),
        fromDay.getDate(),
        0,
        0,
        0,
        0,
      ).toISOString();
    }
    const toDay = parseDay(values.to);
    if (toDay) {
      q.to = new Date(
        toDay.getFullYear(),
        toDay.getMonth(),
        toDay.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString();
    }
    return q;
  }, [values, search, admin]);

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

      <HistoryFilterBar
        searchInput={searchInput}
        onSearchChange={(event) => setSearchInput(event.target.value)}
        admin={admin}
        facilityId={values.facility}
        onFacilityChange={(event) => set("facility", event.target.value)}
        facilityOptions={facilityOptions}
        from={parseDay(values.from) ? values.from : ""}
        to={parseDay(values.to) ? values.to : ""}
        onDateRangeChange={(next) => {
          apply({ from: next.from, to: next.to });
        }}
        action={values.action}
        onActionChange={(value) => set("action", value)}
        onClear={() => {
          setSearchInput("");
          clear();
        }}
      />

      {/* Activity feed — flat bordered surface. The key remounts the feed on
          filter changes so pagination restarts at page 1. */}
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
