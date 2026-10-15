import { useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import useFacilityResources from "../../hooks/useFacilityResources";
import FacilitySummaryBar from "./FacilitySummaryBar";
import ResourceCard from "./ResourceCard";
import ResourceCreateForm from "./ResourceCreateForm";

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

          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]">
              Resources
            </h2>
            <span className="text-[9px] text-[#8995ad]">
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
        </>
      )}
    </div>
  );
};

export default FacilityPage;
