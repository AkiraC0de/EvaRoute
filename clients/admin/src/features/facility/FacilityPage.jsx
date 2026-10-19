import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import useActivityStats from "../../hooks/useActivityStats";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import useFacilityResources from "../../hooks/useFacilityResources";
import * as api from "../../lib/api";
import SectionHeader from "../occupancy/SectionHeader";
import FacilityHero from "./FacilityHero";
import FacilityTiles from "./FacilityTiles";
import { FacilityLoading } from "./FacilityStates";
import FacilityLocationCard from "./FacilityLocationCard";
import FacilityResourcesSection from "./FacilityResourcesSection";
import FacilityActivityStatsCard from "./FacilityActivityStatsCard";
import FacilityRecentActivityCard from "./FacilityRecentActivityCard";
import FacilityAssignedStaffCard from "./FacilityAssignedStaffCard";
import { ESSENTIAL_RESOURCES } from "./essentialResources";

/**
 * "My Facility" — the staff member's own facility, rebuilt as a band-based
 * home:
 *
 *   Facility overview  — hero identity card + 2×2 fact wall
 *   Resources          — essentials + custom resources (full CRUD)
 *   Location & activity — read-only map beside activity stats + roster,
 *                        recent movement below
 *
 * Real endpoints only (see useAssignedFacility / useFacilityResources):
 *   GET    /api/v1/facility                      -> assigned facility
 *   GET    /api/v1/facility/:facilityId/resource -> resource list
 *   POST   /api/v1/facility/:facilityId/resource -> create
 *   PATCH  /api/v1/facility/:facilityId/resource/:id      -> update
 *   DELETE /api/v1/facility/:facilityId/resource/:id      -> delete
 *   GET    /api/v1/facility/:facilityId/staff    -> assigned staff roster
 *
 * The facility's occupancy is NOT shown here — the Occupancy screen owns the
 * stay/check-in data.
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

  const loading = facilityLoading || (Boolean(facilityId) && resourcesLoading);
  const error = facilityError ?? resourcesError;
  const retry = () => {
    retryFacility();
    retryResources();
  };

  const available = facility?.status === "AVAILABLE";
  const sortedResources = useMemo(
    () => resources, // API already returns them name-ordered
    [resources],
  );
  const essentialsReady = useMemo(
    () => sortedResources.filter((r) => r.essentialType && r.isAvailable).length,
    [sortedResources],
  );

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="My Facility"
          subtitle={facility ? facility.address : "Loading your assignment…"}
        />
      </header>

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
          {/* Overview band: hero identity beside the fact wall */}
          <SectionHeader
            title="Facility overview"
            caption="Your assignment at a glance"
          />
          <div className="mt-3 grid items-stretch gap-4 lg:grid-cols-[1.45fr_1fr]">
            <FacilityHero
              facility={facility}
              available={available}
            />
            <FacilityTiles
              maxCapacity={facility.maxCapacity}
              essentialsReady={essentialsReady}
              essentialsTotal={ESSENTIAL_RESOURCES.length}
              resourceCount={sortedResources.length}
              staffCount={staffs.length}
            />
          </div>

          {/* Resources band */}
          <SectionHeader
            top
            title="Resources & essentials"
            caption="Track and manage what the facility has"
          />
          <div className="mt-3">
            <FacilityResourcesSection
              resources={sortedResources}
              createResource={createResource}
              saveResource={saveResource}
              removeResource={removeResource}
            />
          </div>

          {/* Location & activity band */}
          <SectionHeader
            top
            title="Location & activity"
            caption="Where the facility is and what happened here"
          />
          <div className="mt-3 grid items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
            <FacilityLocationCard facility={facility} />
            <div className="space-y-4">
              <FacilityActivityStatsCard todayStats={todayStats} weekStats={weekStats} />
              <FacilityAssignedStaffCard staffs={staffs} loading={staffsLoading} />
            </div>
          </div>

          <div className="mt-4">
            <FacilityRecentActivityCard facilityId={facilityId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityPage;
