import { useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import useActivityStats from "../../hooks/useActivityStats";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import useFacilityResources from "../../hooks/useFacilityResources";
import FacilitySummaryBar from "./FacilitySummaryBar";
import { FacilityLoading } from "./FacilityStates";
import FacilityLocationCard from "./FacilityLocationCard";
import FacilityResourcesSection from "./FacilityResourcesSection";
import FacilityActivityStatsCard from "./FacilityActivityStatsCard";
import FacilityRecentActivityCard from "./FacilityRecentActivityCard";

/**
 * "My Facility" — the staff member's own facility and its resources.
 *
 * Real endpoints only (see useAssignedFacility / useFacilityResources):
 *   GET    /api/v1/facility                      -> assigned facility
 *   GET    /api/v1/facility/:facilityId/resource -> resource list
 *   POST   /api/v1/facility/:facilityId/resource -> create
 *   PATCH  /api/v1/facility/:facilityId/resource/:id      -> update
 *   DELETE /api/v1/facility/:facilityId/resource/:id      -> delete
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

  return (
    <div className="min-h-[calc(100vh-48px)]">
      <PageHeader
        title="My Facility"
        subtitle={facility ? facility.address : "Loading your assignment…"}
        className="mb-5"
      />

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
        <>
          <FacilitySummaryBar facility={facility} available={available} />

          {/* Read-only location map (staff cannot edit coordinates here). */}
          <FacilityLocationCard facility={facility} />

          <FacilityResourcesSection
            resources={sortedResources}
            createResource={createResource}
            saveResource={saveResource}
            removeResource={removeResource}
          />

          <FacilityActivityStatsCard todayStats={todayStats} weekStats={weekStats} />

          <FacilityRecentActivityCard facilityId={facilityId} />
        </>
      )}
    </div>
  );
};

export default FacilityPage;
