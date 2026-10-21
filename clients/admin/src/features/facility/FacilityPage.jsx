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
 *   Readiness rail  — one divided instrument panel: essentials, resources,
 *                     staff, today's check-ins/outs, rolling 7-day events
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
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);
  const todayStats = useActivityStats({ from: startOfToday });
  const weekStats = useActivityStats();
  const todayIn = todayStats.byAction.STAY_CHECKED_IN ?? 0;
  const todayOut = todayStats.byAction.STAY_CHECKED_OUT ?? 0;

  // Assigned staff roster (FETCH_STAFF) — who works this facility.
  const [staffs, setStaffs] = useState([]);
  const [staffsLoading, setStaffsLoading] = useState(Boolean(facilityId));
  useEffect(() => {
    if (!facilityId) return undefined;
    let cancelled = false;
    api
      .listFacilityStaff(facilityId)
      .then((rows) => {
        if (!cancelled) setStaffs(rows);
      })
      .catch(() => {
        // The roster is supporting information — a failure stays non-fatal.
      })
      .finally(() => {
        if (!cancelled) setStaffsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

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

  const available = facility?.status === "AVAILABLE";
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
          {/* Command hero — identity + status console */}
          <FacilityHero
            facility={facility}
            available={available}
            essentials={essentials}
            occupancy={occupancy}
          />

          {/* Readiness rail — the operational facts as one instrument strip */}
          <div className="mt-3">
            <FacilityReadinessRail
              resourceCount={resources.length}
              staffCount={staffs.length}
              todayIn={todayIn}
              todayOut={todayOut}
              weekTotal={weekStats.total}
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
              <FacilityAssignedStaffCard staffs={staffs} loading={staffsLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityPage;
