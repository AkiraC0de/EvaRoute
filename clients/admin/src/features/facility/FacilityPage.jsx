import { useEffect, useMemo, useState } from "react";
import StatusPanel from "../../components/ui/StatusPanel";
import useActivityStats from "../../hooks/useActivityStats";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import useFacilityResources from "../../hooks/useFacilityResources";
import * as api from "../../lib/api";
import FacilityHero from "./FacilityHero";
import FacilityReadinessRail from "./FacilityReadinessRail";
import { FacilityLoading } from "./FacilityStates";
import FacilityLocationCard from "./FacilityLocationCard";
import FacilityResourcesSection from "./FacilityResourcesSection";
import FacilityRecentActivityCard from "./FacilityRecentActivityCard";
import FacilityAssignedStaffCard from "./FacilityAssignedStaffCard";
import { ESSENTIAL_RESOURCES } from "./essentialResources";

/**
 * "My Facility" — the staff member's own facility, rebuilt as an operations
 * deck rather than a stack of section bands:
 *
 *   Command hero    — identity + inline status console (status, capacity,
 *                     essentials readiness, deep link to live occupancy)
 *   Readiness rail  — one divided instrument panel: resources, staff,
 *                     today's check-ins/outs, rolling 7-day events
 *   Resources       — search + segment filters + full CRUD workspace
 *   Activity/place  — recent movements beside the map + assigned roster
 *
 * Real endpoints only (see useAssignedFacility / useFacilityResources):
 *   GET    /api/v1/facility                      -> assigned facility
 *   GET    /api/v1/facility/:facilityId/resource -> resource list
 *   POST   /api/v1/facility/:facilityId/resource -> create
 *   PATCH  /api/v1/facility/:facilityId/resource/:id      -> update
 *   DELETE /api/v1/facility/:facilityId/resource/:id      -> delete
 *   GET    /api/v1/facility/:facilityId/staff    -> assigned staff roster
 *
 * The facility's live occupancy is NOT computed here — the Occupancy screen
 * owns the stay data and is linked from the hero.
 */
const FacilityPage = () => {
  const {
    facility,
    loading: facilityLoading,
    error: facilityError,
    retry: retryFacility,
  } = useAssignedFacility();

  const facilityId = facility?.id ?? null;
  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    retry: retryResources,
    createResource,
    saveResource,
    removeResource,
  } = useFacilityResources(facilityId);

  // Shift-relevant activity metrics, scoped server-side to this facility.
  // Two windows: today (check-ins/out counts) and the rolling 7-day total.
  // Counts only exist once measured — the rail renders "—" while a window is
  // loading or failed, so a 0 on screen is always a measured zero.
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);
  const todayStats = useActivityStats({ from: startOfToday });
  const weekStats = useActivityStats();
  const statsStateOf = (stats) =>
    stats.loading ? "pending" : stats.error ? "failed" : "ready";
  const todayState = statsStateOf(todayStats);
  const weekState = statsStateOf(weekStats);
  const todayIn =
    todayState === "ready" ? (todayStats.byAction?.STAY_CHECKED_IN ?? 0) : null;
  const todayOut =
    todayState === "ready" ? (todayStats.byAction?.STAY_CHECKED_OUT ?? 0) : null;

  // Assigned staff roster (FETCH_STAFF) — who works this facility. Tagged like
  // useActivityStats: responses only land while their facility is current, and
  // the card's three states derive from that — pending shows skeleton chips,
  // a failed fetch surfaces a banner instead of masquerading as "no staff".
  const [roster, setRoster] = useState({ forKey: null, rows: [], error: null });
  useEffect(() => {
    if (!facilityId) return undefined;
    let cancelled = false;
    api
      .listFacilityStaff(facilityId)
      .then((rows) => {
        if (!cancelled) setRoster({ forKey: facilityId, rows, error: null });
      })
      .catch((error) => {
        // Supporting information — non-fatal, but the failure must be visible.
        if (!cancelled) setRoster({ forKey: facilityId, rows: [], error });
      });
    return () => {
      cancelled = true;
    };
  }, [facilityId]);
  const rosterCurrent = roster.forKey === facilityId;
  const staffRows = rosterCurrent ? roster.rows : [];
  const staffsStatus = !rosterCurrent
    ? "pending"
    : roster.error
      ? "failed"
      : "ready";

  // Live occupancy summary (GET /facility/:id/stay/occupancy) — the hero
  // console's quantified condition. Supporting information: a failure stays
  // non-fatal and the console falls back to the capacity fact.
  const [occupancy, setOccupancy] = useState(null);
  useEffect(() => {
    if (!facilityId) return undefined;
    let cancelled = false;
    api
      .getOccupancy(facilityId)
      .then((summary) => {
        if (!cancelled) setOccupancy(summary);
      })
      .catch(() => {
        // Non-fatal — the hero meter simply waits.
      });
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  const loading = facilityLoading || (Boolean(facilityId) && resourcesLoading);
  const error = facilityError ?? resourcesError;
  const retry = () => {
    retryFacility();
    retryResources();
  };

  // Per-essential readiness (client mirror of the three mandatory rows the
  // server creates per facility) — drives the hero's labelled segments.
  const essentials = useMemo(
    () =>
      ESSENTIAL_RESOURCES.map((entry) => ({
        ...entry,
        ready: resources.some((r) => r.essentialType === entry.key && r.isAvailable),
      })),
    [resources],
  );

  return (
    <div>
      {loading && <FacilityLoading />}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load your facility" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && !facility && (
        <StatusPanel tone="empty" title="No facility assigned">
          Your account is not assigned to a facility yet. Ask an administrator to
          assign you before managing resources.
        </StatusPanel>
      )}

      {!loading && !error && facility && (
        <div>
          {/* Command hero — identity + status console (the hero derives its
              own status pill from facility.status) */}
          <FacilityHero
            facility={facility}
            essentials={essentials}
            occupancy={occupancy}
          />

          {/* Readiness rail — the operational facts as one instrument strip.
              Cell states thread through so unmeasured counts read "—". */}
          <div className="mt-3">
            <FacilityReadinessRail
              resourceCount={resources.length}
              staffCount={staffRows.length}
              todayIn={todayIn}
              todayOut={todayOut}
              weekTotal={weekState === "ready" ? weekStats.total : null}
              states={{
                staff: staffsStatus,
                checkIns: todayState,
                checkOuts: todayState,
                events: weekState,
              }}
            />
          </div>

          {/* Resources workspace */}
          <div className="mt-6">
            <FacilityResourcesSection
              resources={resources}
              createResource={createResource}
              saveResource={saveResource}
              removeResource={removeResource}
            />
          </div>

          {/* Activity & place — movements beside the map + roster */}
          <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
            <FacilityRecentActivityCard facilityId={facilityId} />
            <div className="space-y-4">
              <FacilityLocationCard facility={facility} />
              <FacilityAssignedStaffCard staffs={staffRows} status={staffsStatus} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityPage;
