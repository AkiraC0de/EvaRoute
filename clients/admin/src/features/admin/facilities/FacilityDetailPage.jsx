import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Banner from "../../../components/ui/Banner";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusPanel from "../../../components/ui/StatusPanel";
import useAsyncAction from "../../../hooks/useAsyncAction";
import useFacilityResources from "../../../hooks/useFacilityResources";
import useStays from "../../../hooks/useStays";
import * as api from "../../../lib/api";
import FacilityEditForm from "./FacilityEditForm";
import FacilityStaffSection from "./FacilityStaffSection";
import FacilityDetailHeader from "./FacilityDetailHeader";
import FacilityResourcesSection from "./FacilityResourcesSection";
import FacilityOccupancySection from "./FacilityOccupancySection";
import FacilityActivitySection from "./FacilityActivitySection";
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
      <FacilityDetailHeader
        facility={facility}
        deleted={deleted}
        onAction={() => {
          setActionError("");
          setConfirmDelete(true);
        }}
      />

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

          <FacilityResourcesSection
            resources={resources}
            createResource={createResource}
            saveResource={saveResource}
            removeResource={removeResource}
          />

          <FacilityOccupancySection
            occupancy={occupancy}
            stays={stays}
            busy={busy}
            onCheckIn={async (payload) => {
              await run(() => checkIn(payload));
            }}
            onCheckOut={(stay) => run(() => checkOut(stay.id))}
          />

          <FacilityActivitySection facilityId={facilityId} />
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
