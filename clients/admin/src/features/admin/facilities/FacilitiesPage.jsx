import { useMemo, useState } from "react";
import useUrlFilters from "../../../hooks/useUrlFilters";

// URL-backed filter defaults (keys appear as query params when active).
const FAC_FILTER_DEFAULTS = { search: "", status: "", deleted: "" };
import { useNavigate } from "react-router-dom";
import Banner from "../../../components/ui/Banner";
import StatusPanel from "../../../components/ui/StatusPanel";
import useAsyncAction from "../../../hooks/useAsyncAction";
import * as api from "../../../lib/api";
import FacilityCreateModal from "./FacilityCreateModal";
import useFacilities from "./useFacilities";
import FacilitiesHeader from "./FacilitiesHeader";
import FacilitiesFilterBar from "./FacilitiesFilterBar";
import FacilitiesMapCard from "./FacilitiesMapCard";
import FacilitiesTable from "./FacilitiesTable";
import FacilitiesConfirmDialog from "./FacilitiesConfirmDialog";
import { FacilitiesLoading, FacilitiesEmpty } from "./FacilitiesStates";

/**
 * Facilities registry (ADMIN).
 *
 * List + create + delete/restore. GET /facility has no server-side search or
 * pagination, so search is client-side over the fetched rows (fine at current
 * scale — see the plan's gap list). The `deleted` tab drives the soft-delete
 * RESTORE flow: DELETE is a toggle server-side.
 *
 * This component owns data flow and composition only — the list state hook,
 * header, filter band, map card, table, list states and confirm dialog each
 * live in their own module.
 */

const FacilitiesPage = () => {
  const { values, set, clear } = useUrlFilters(FAC_FILTER_DEFAULTS);
  const filters = useMemo(
    () => ({
      search: values.search,
      statusFilter: values.status,
      showDeleted: values.deleted === "1",
    }),
    [values]
  );
  const { visible, loading, error, retry } = useFacilities(filters);
  const [creating, setCreating] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // facility pending delete/restore
  const navigate = useNavigate();
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  // DELETE /facility/:id is a TOGGLE server-side: soft-deletes, or restores
  // an already-deleted facility — the toast copy follows the actual effect.
  const confirmToggle = () =>
    run(
      async () => {
        await api.deleteFacility(confirmTarget.id);
        setConfirmTarget(null);
        retry();
      },
      {
        success: filters.showDeleted
          ? "Facility restored."
          : "Facility deleted — restore it anytime from the deleted list.",
      }
    );

  return (
    <div>
      <FacilitiesHeader onRegister={() => setCreating(true)} />

      <FacilitiesFilterBar
        search={filters.search}
        onSearchChange={(event) => set("search", event.target.value, { replace: true })}
        statusFilter={filters.statusFilter}
        onStatusChange={(event) => set("status", event.target.value)}
        showDeleted={filters.showDeleted}
        onToggleDeleted={() => set("deleted", filters.showDeleted ? "" : "1")}
        onClear={clear}
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
        <FacilitiesEmpty showDeleted={filters.showDeleted} />
      )}

      {!loading && !error && visible.length > 0 && (
        <FacilitiesTable
          facilities={visible}
          showDeleted={filters.showDeleted}
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
        <FacilitiesConfirmDialog
          showDeleted={filters.showDeleted}
          target={confirmTarget}
          busy={busy}
          onConfirm={confirmToggle}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
};

export default FacilitiesPage;
