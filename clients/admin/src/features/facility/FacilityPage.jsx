import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatTile from "../../components/ui/StatTile";
import StatusPanel from "../../components/ui/StatusPanel";
import useActivityStats from "../../hooks/useActivityStats";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import useFacilityResources from "../../hooks/useFacilityResources";
import FacilitySummaryBar from "./FacilitySummaryBar";
import FacilityOverviewMap from "../map/FacilityOverviewMap";
import ResourceCard from "./ResourceCard";
import ResourceCreateForm from "./ResourceCreateForm";
import ActivityFeed from "../activity/ActivityFeed";

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
    <div className="min-h-[calc(100vh-48px)] flex">
      <PageHeader
        title="My Facility"
        subtitle={facility ? facility.address : "Loading your assignment…"}
        className="mb-5"
      />

      {loading && (
        <StatusPanel title="Loading your facility…">
          Fetching your assignment and its resources from the EvaRoute API.
        </StatusPanel>
      )}

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
          <div className="mb-3 rounded-clay bg-surface p-4 shadow-clay">
            <h2 className="text-[11px] font-bold text-ink-soft">Facility location</h2>
            <p className="mt-1 text-[9px] text-muted">{facility.address}</p>
            <div className="mt-3">
              <FacilityOverviewMap facilities={[facility]} showLegend={false} height={220} />
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]">
              Resources
            </h2>
            <span className="text-[9px] text-muted">
              {sortedResources.length} recorded
            </span>
          </div>

          <ResourceCreateForm onCreate={createResource} />

          <div className="mt-4">
            {sortedResources.length === 0 ? (
              <StatusPanel tone="empty" title="No resources recorded">
                This facility has no resources yet. Add the first one above.
              </StatusPanel>
            ) : (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sortedResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onSave={(patch) => saveResource(resource.id, patch)}
                    onDelete={() => removeResource(resource.id)}
                  />
                ))}
              </section>
            )}
          </div>

          <div className="mt-4 rounded-clay bg-surface p-4 shadow-clay">
            <h2 className="mb-3 text-[11px] font-bold text-ink-soft">Activity</h2>
            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Check-ins today" value={todayStats.byAction.STAY_CHECKED_IN ?? 0} />
              <StatTile label="Check-outs today" value={todayStats.byAction.STAY_CHECKED_OUT ?? 0} />
              <StatTile label="Events (7 days)" value={weekStats.total} />
            </div>
          </div>

          <div className="mt-4 rounded-clay bg-surface p-4 shadow-clay">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-ink-soft">Recent activity</h2>
              <Link
                to="/history"
                className="text-[9px] font-semibold text-accent transition hover:text-accent-strong"
              >
                View full history →
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-line">
              <ActivityFeed query={{ facilityId }} limit={5} compact />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FacilityPage;
