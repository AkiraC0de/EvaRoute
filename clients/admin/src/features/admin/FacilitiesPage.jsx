import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../components/ui/Banner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StatusPanel from "../../components/ui/StatusPanel";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";
import FacilityCreateModal from "./FacilityCreateModal";
import FacilitiesHeader from "./FacilitiesHeader";
import FacilitiesFilterBar from "./FacilitiesFilterBar";
import FacilitiesMapCard from "./FacilitiesMapCard";
import FacilitiesTable from "./FacilitiesTable";
import { FacilitiesLoading, FacilitiesEmpty } from "./FacilitiesStates";

/**
 * Facilities registry (ADMIN).
 *
 * List + create + delete/restore. GET /facility has no server-side search or
 * pagination, so search is client-side over the fetched rows (fine at current
 * scale — see the plan's gap list). The `deleted` tab drives the soft-delete
 * RESTORE flow: DELETE is a toggle server-side.
 *
 * This component owns data flow and composition only — the header, filter
 * band, map card, table and list states each live in their own module.
 */

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // facility pending delete/restore
  const navigate = useNavigate();
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  useEffect(() => {
    let cancelled = false;

    api
      .listFacilities({ status: statusFilter || undefined, deleted: showDeleted })
      .then((rows) => {
        if (!cancelled) setFacilities(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, showDeleted, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return facilities;
    return facilities.filter(
      (facility) =>
        facility.name.toLowerCase().includes(needle) ||
        facility.address.toLowerCase().includes(needle),
    );
  }, [facilities, search]);

  const confirmToggle = () =>
    run(async () => {
      await api.deleteFacility(confirmTarget.id);
      setConfirmTarget(null);
      retry();
    });

  return (
    <div>
      <FacilitiesHeader onRegister={() => setCreating(true)} />

      <FacilitiesFilterBar
        search={search}
        onSearchChange={(event) => setSearch(event.target.value)}
        statusFilter={statusFilter}
        onStatusChange={(event) => setStatusFilter(event.target.value)}
        showDeleted={showDeleted}
        onToggleDeleted={() => setShowDeleted((current) => !current)}
      />

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <FacilitiesMapCard
          facilities={visible}
          onView={(facilityId) => navigate(`/facilities/${facilityId}`)}
        />
      )}

      {loading && <FacilitiesLoading />}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load facilities" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && visible.length === 0 && (
        <FacilitiesEmpty showDeleted={showDeleted} />
      )}

      {!loading && !error && visible.length > 0 && (
        <FacilitiesTable
          facilities={visible}
          showDeleted={showDeleted}
          onToggle={(facility) => {
            setActionError("");
            setConfirmTarget(facility);
          }}
        />
      )}

      {creating && (
        <FacilityCreateModal
          onCreated={() => {
            setCreating(false);
            retry();
          }}
          onClose={() => setCreating(false)}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title={showDeleted ? "Restore facility" : "Delete facility"}
          message={
            showDeleted
              ? `Restore “${confirmTarget.name}”? It will become visible and available for operations again.`
              : `Delete “${confirmTarget.name}”? It will be hidden from operations. You can restore it later from the deleted list. Checked-in evacuees block deletion.`
          }
          confirmLabel={showDeleted ? "Restore" : "Delete"}
          tone={showDeleted ? "primary" : "danger"}
          busy={busy}
          onConfirm={confirmToggle}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
};

export default FacilitiesPage;
