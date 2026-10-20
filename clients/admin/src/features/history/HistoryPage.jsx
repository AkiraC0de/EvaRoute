import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { hasRole, ROLES } from "../../app/roles";
import { listFacilities } from "../../lib/api";
import PagedActivityFeed from "../activity/PagedActivityFeed";
import HistoryFilterBar from "./HistoryFilterBar";
import useDebouncedSearch from "./useDebouncedSearch";

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const { user } = useAuth();
  const admin = hasRole(user, [ROLES.ADMIN]);

  const [action, setAction] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // Debounced: the API is queried with `search` once typing settles.
  const { value: searchInput, debounced: search, setValue: setSearchInput } = useDebouncedSearch();

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

      <HistoryFilterBar
        searchInput={searchInput}
        onSearchChange={(event) => setSearchInput(event.target.value)}
        admin={admin}
        facilityId={facilityId}
        onFacilityChange={(event) => setFacilityId(event.target.value)}
        facilityOptions={facilityOptions}
        from={from}
        to={to}
        onDateRangeChange={(next) => {
          setFrom(next.from);
          setTo(next.to);
        }}
        action={action}
        onActionChange={setAction}
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
