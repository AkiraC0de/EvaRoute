import { useEffect, useState } from "react";
import ResourceCard from "./ResourceCard";
import ResourceCreateForm from "./ResourceCreateForm";
import StatusPanel from "./StatusPanel";
import * as api from "../lib/api";

/**
 * "My Facility" — the staff member's own facility and its resources.
 *
 * Real endpoints only:
 *   GET    /api/v1/facility                                -> the facility this
 *          staff member is assigned to (role-scoped by the controller)
 *   GET    /api/v1/facility/:facilityId/resource           -> resource list
 *   POST   /api/v1/facility/:facilityId/resource           -> create
 *   PATCH  /api/v1/facility/:facilityId/resource/:id       -> update
 *   DELETE /api/v1/facility/:facilityId/resource/:id       -> delete
 *
 * The previous version rendered six hardcoded cards ("Paco Park School",
 * Beds 88, Food 180, …) with local-only counters. Those are gone: every number
 * on this screen now comes from the API, and a failed request shows the API's
 * own error instead of falling back to demo data.
 *
 * The facility's occupancy (312/400 in the old mock) is NOT shown, because the
 * API exposes no occupancy endpoint — see the Occupancy screen and the report.
 */
const StaffDashboard = () => {
  const [facility, setFacility] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // State is only ever set after an await, never synchronously in the effect
  // body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const nextFacility = await api.getAssignedFacility();
        if (cancelled) return;
        setFacility(nextFacility);

        if (nextFacility) {
          const nextResources = await api.listResources(nextFacility.id);
          if (cancelled) return;
          setResources(nextResources);
        } else {
          setResources([]);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  };

  const saveResource = async (resourceId, patch) => {
    const updated = await api.updateResource(facility.id, resourceId, patch);
    setResources((current) =>
      current.map((resource) => (resource.id === updated.id ? updated : resource)),
    );
  };

  const removeResource = async (resourceId) => {
    await api.deleteResource(facility.id, resourceId);
    setResources((current) => current.filter((resource) => resource.id !== resourceId));
  };

  const createResource = async (body) => {
    const created = await api.createResource(facility.id, body);
    setResources((current) =>
      [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
  };

  const available = facility?.status === "AVAILABLE";

  return (
    <main className="ml-49.5 min-h-screen bg-[#e9edf7] p-6 max-sm:ml-0 max-sm:p-4">
      <div className="min-h-[calc(100vh-48px)]">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-[#273556]">My Facility</h1>
          <p className="mt-1 text-[11px] text-[#8290aa]">
            {facility ? facility.address : "Loading your assignment…"}
          </p>
        </div>

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
            <div className="mb-5 flex min-h-20.5 flex-wrap items-center justify-between gap-3 rounded-[20px] bg-white px-5 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf1ff]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-[#4e6af3]"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V7l7-4 7 4v14" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-[13px] font-bold text-[#34405f]">{facility.name}</h2>
                  <p className="text-[9px] text-[#8995ad]">
                    Capacity {facility.maxCapacity}
                  </p>
                </div>

                <div className="ml-3 flex items-center gap-2 rounded-full bg-[#f7f8fc] px-4 py-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      available ? "bg-[#42c98b]" : "bg-[#e5a83c]"
                    }`}
                  />
                  <span className="text-[9px] font-medium text-[#65718c]">
                    {available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Filter controls inherited from the original design. They have no
                  onClick handler in the imported source and no matching API
                  parameter, so they remain decorative (see the report). */}
              <div className="flex items-center gap-2">
                <button className="rounded-xl bg-[#5269ef] px-7 py-2.5 text-[9px] font-semibold text-white shadow-sm transition hover:bg-[#4058df]">
                  All
                </button>
                <button className="rounded-xl bg-[#f7f8fc] px-5 py-2.5 text-[9px] font-semibold text-[#8290aa] transition hover:bg-white hover:text-[#5269ef]">
                  Limited
                </button>
                <button className="rounded-xl bg-[#f7f8fc] px-5 py-2.5 text-[9px] font-semibold text-[#8290aa] transition hover:bg-white hover:text-[#5269ef]">
                  Availability
                </button>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]">
                Resources
              </h2>
              <span className="text-[9px] text-[#8995ad]">
                {resources.length} recorded
              </span>
            </div>

            <ResourceCreateForm onCreate={createResource} />

            <div className="mt-4">
              {resources.length === 0 ? (
                <StatusPanel tone="empty" title="No resources recorded">
                  This facility has no resources yet. Add the first one above.
                </StatusPanel>
              ) : (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {resources.map((resource) => (
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
    </main>
  );
};

export default StaffDashboard;
