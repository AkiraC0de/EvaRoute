import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Banner from "../../../components/ui/Banner";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusPanel from "../../../components/ui/StatusPanel";
import useAsyncAction from "../../../hooks/useAsyncAction";
import useFacilityResources from "../../../hooks/useFacilityResources";
import useStays from "../../../hooks/useStays";
import { useToast } from "../../../components/ui/toastContext";
import * as api from "../../../lib/api";
import FacilityEditForm from "./FacilityEditForm";
import FacilityStaffSection from "./FacilityStaffSection";
import FacilityDetailHeader from "./FacilityDetailHeader";
import FacilityResourcesSection from "./FacilityResourcesSection";
import FacilityActivitySection from "./FacilityActivitySection";
import { FacilityDetailLoading } from "./FacilitiesStates";
import CheckInsList from "../../occupancy/CheckInsList";

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
  // Keyed remount for the activity trail: a bulk check-out must refresh it
  // (the feed only refetches when its query key changes).
  const [activityKey, setActivityKey] = useState(0);
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();
  const toast = useToast();

  const {
    resources,
    createResource,
    saveResource,
    removeResource,
  } = useFacilityResources(facilityId);

  const { stays, checkIn, checkOutMany } = useStays(facilityId);

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

          <div className="flex gap-4">
            <CheckInsList
              stays={stays}
              busy={busy}
              onCheckOut={async (payload) => {
                await run(() => checkIn(payload));
              }}
              // Bulk check-out seam (same shape as the Occupancy page):
              // checkOutMany loops the per-stay checkout POST silent and
              // refreshes once at the end, and `run` carries the busy/error
              // discipline while the handler still resolves with the RESULT
              // SET ({ checkedOut, failed }) for the list's partial-failure
              // handling. The bulk POSTs are silent, so ONE calm summary
              // toast replaces the per-request server messages.
              onCheckOutMany={async (selected) => {
                let result = { checkedOut: [], failed: [] };
                try {
                  await run(async () => {
                    result = await checkOutMany(selected.map((stay) => stay.id));
                  });
                } finally {
                  // Same discipline as the Occupancy page: the activity trail
                  // refreshes after every check-out attempt (success or not).
                  setActivityKey((key) => key + 1);
                }
                const { checkedOut, failed } = result;
                const total = checkedOut.length + failed.length;
                if (checkedOut.length > 0) {
                  toast.success(
                    failed.length === 0
                      ? `Checked out ${checkedOut.length} household${checkedOut.length === 1 ? "" : "s"}.`
                      : `Checked out ${checkedOut.length} of ${total} households.`,
                  );
                }
                return result;
              }}
            />
            <FacilityActivitySection key={activityKey} facilityId={facilityId} />
          </div>
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
