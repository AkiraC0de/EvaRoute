import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Trash2, RotateCcw } from "lucide-react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusPanel from "../../../components/ui/StatusPanel";
import StatusPill from "../../../components/ui/StatusPill";
import useAsyncAction from "../../../hooks/useAsyncAction";
import useFacilityResources from "../../../hooks/useFacilityResources";
import useStays from "../../../hooks/useStays";
import * as api from "../../../lib/api";
import ResourceCard from "../../facility/ResourceCard";
import ResourceCreateForm from "../../facility/ResourceCreateForm";
import CheckInForm from "../../occupancy/CheckInForm";
import HouseholdList from "../../occupancy/HouseholdList";
import ActivityFeed from "../../activity/ActivityFeed";
import FacilityEditForm from "./FacilityEditForm";
import FacilityStaffSection from "./FacilityStaffSection";
import DetailSection from "./DetailSection";
import { FacilityDetailLoading } from "./FacilitiesStates";

/**
 * Facility detail (ADMIN): edit form (+ status), staff assignment, resources,
 * and the stays/check-in section. Sections are independent — a failure in one
 * must not blank the others, hence the per-section hooks.
 *
 * Presentation: one hero header (name, location + status pills, danger zone
 * action) over consistently-headed DetailSection blocks. The add-resource
 * trigger lives in the Resources section header and opens a dialog.
 */
const FacilityDetailPage = () => {
  const { facilityId } = useParams();

  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  const {
    resources,
    createResource,
    saveResource,
    removeResource,
  } = useFacilityResources(facilityId);

  const { stays, occupancy, checkIn, checkOut } = useStays(facilityId);

  useEffect(() => {
    let cancelled = false;

    // The list endpoint partitions active vs soft-deleted (deleted:true
    // returns ONLY deleted rows), so fetch both and look in the union — the
    // detail page must open a facility in either state.
    Promise.all([
      api.listFacilities(),
      api.listFacilities({ deleted: true }),
    ])
      .then(([active, deletedRows]) => {
        if (cancelled) return;
        const found = [...active, ...deletedRows].find((row) => row.id === facilityId) ?? null;
        setFacility(found);
        setLoading(false);
        if (!found) setError(new Error("Facility not found."));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [facilityId, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const toggleDelete = () =>
    run(async () => {
      await api.deleteFacility(facilityId);
      setConfirmDelete(false);
      retry();
    });

  const deleted = Boolean(facility?.deletedAt);

  return (
    <div>
      <Link
        to="/facilities"
        className="inline-flex items-center gap-1 text-[9px] font-semibold text-accent transition hover:text-accent-strong"
      >
        <ArrowLeft size={12} strokeWidth={2} /> Back to facilities
      </Link>

      <header className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold leading-tight text-ink">
            {facility?.name ?? "Facility"}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-1 text-[11px] text-muted">
              <MapPin size={11} strokeWidth={1.9} aria-hidden="true" />
              {facility ? facility.address : "Loading facility…"}
            </p>
            {facility && (
              <>
                <StatusPill tone={facility.status === "AVAILABLE" ? "success" : "warning"}>
                  {facility.status === "AVAILABLE" ? "Available" : "Unavailable"}
                </StatusPill>
                <StatusPill tone="neutral">Max capacity {facility.maxCapacity}</StatusPill>
              </>
            )}
          </div>
        </div>
        {facility && (
          <Button
            variant={deleted ? "primary" : "danger"}
            size="sm"
            onClick={() => {
              setActionError("");
              setConfirmDelete(true);
            }}
          >
            {deleted ? (
              <><RotateCcw size={12} strokeWidth={2} className="mr-1" /> Restore facility</>
            ) : (
              <><Trash2 size={12} strokeWidth={2} className="mr-1" /> Delete facility</>
            )}
          </Button>
        )}
      </header>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && <FacilityDetailLoading />}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load the facility" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && facility && (
        <div className="space-y-4">
          {deleted && (
            <Banner tone="warning">
              This facility is soft-deleted. Restore it to make it available for operations again.
            </Banner>
          )}

          <FacilityEditForm
            facility={facility}
            onSaved={(saved) => {
              setFacility((current) => ({ ...current, ...saved }));
            }}
          />

          <FacilityStaffSection facilityId={facilityId} />

          <DetailSection
            title="Resources"
            action={<ResourceCreateForm onCreate={createResource} />}
          >
            {resources.length === 0 ? (
              <StatusPanel tone="empty" title="No resources recorded">
                This facility has no resources yet. Add the first one from the button above.
              </StatusPanel>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onSave={(patch) => saveResource(resource.id, patch)}
                    onDelete={() => removeResource(resource.id)}
                  />
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Checked-in evacuees">
            {occupancy && (
              <p className="mb-3 text-[9px] text-muted">
                {occupancy.members} of {occupancy.maxCapacity} places occupied ·{" "}
                {occupancy.remaining} remaining
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)]">
              <CheckInForm
                remaining={occupancy?.remaining ?? 0}
                onCheckIn={async (payload) => {
                  await run(() => checkIn(payload));
                }}
              />
              <HouseholdList
                stays={stays}
                busy={busy}
                onCheckOut={(stay) => run(() => checkOut(stay.id))}
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Activity"
            action={
              <Link
                to="/history"
                className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-accent transition hover:text-accent-strong"
              >
                Open in history →
              </Link>
            }
          >
            <ActivityFeed query={{ facilityId }} limit={5} compact />
          </DetailSection>
        </div>
      )}

      {confirmDelete && facility && (
        <ConfirmDialog
          title={deleted ? "Restore facility" : "Delete facility"}
          message={
            deleted
              ? `Restore “${facility.name}”? It will become available for operations again.`
              : `Delete “${facility.name}”? It will be hidden from operations. Checked-in evacuees block deletion.`
          }
          confirmLabel={deleted ? "Restore" : "Delete"}
          tone={deleted ? "primary" : "danger"}
          busy={busy}
          onConfirm={toggleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};

export default FacilityDetailPage;
