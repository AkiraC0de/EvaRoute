import { useEffect, useMemo, useState } from "react";
import useUrlFilters from "../../../hooks/useUrlFilters";

// URL-backed filter defaults (keys appear as query params when active).
const FAC_FILTER_DEFAULTS = { search: "", status: "", deleted: "", view: "", sort: "", order: "", page: "" };
const VIEWS = ["list", "map", "split"];
import { useNavigate } from "react-router-dom";
import Banner from "../../../components/ui/Banner";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusPanel from "../../../components/ui/StatusPanel";
import useAsyncAction from "../../../hooks/useAsyncAction";
import * as api from "../../../lib/api";
import FacilityCreateModal from "./FacilityCreateModal";
import useFacilities from "./useFacilities";
import FacilitiesHeader from "./FacilitiesHeader";
import FacilitiesFilterBar from "./FacilitiesFilterBar";
import FacilitiesMapCard from "./FacilitiesMapCard";
import FacilitiesTable from "./FacilitiesTable";
import FacilitiesViewToggle from "./FacilitiesViewToggle";
import FacilitiesConfirmDialog from "./FacilitiesConfirmDialog";
import { FacilitiesLoading, FacilitiesEmpty } from "./FacilitiesStates";

/**
 * Facilities registry (ADMIN) — the list⇄map operations workspace.
 *
 * View modes (URL-backed): LIST (table), MAP (geographic surface), SPLIT
 * (linked side-by-side on desktop, stacked on mobile). Rows and markers are
 * linked: hovering a row rings its marker, clicking a row selects it (the
 * camera flies in and the marker popup opens), clicking a marker selects the
 * row. Active/Deleted tabs carry counts and drive the soft-delete RESTORE
 * flow (DELETE is a toggle server-side).
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
  const view = VIEWS.includes(values.view) ? values.view : "split";
  const sort = ["name", "capacity", "staff", "created"].includes(values.sort)
    ? values.sort
    : "created";
  const order = values.order === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(values.page) || 1);
  const { visible, total, totalPages, loading, error, retry } = useFacilities({
    ...filters,
    sort,
    order,
    page,
    pageSize: 10,
  });
  const [creating, setCreating] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // facility pending delete/restore
  const navigate = useNavigate();
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  // ── List⇄map linkage ──────────────────────────────────────────────
  const [hoverId, setHoverId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // ── Bulk selection (per page; cleared on any data change) ─────────
  const [selected, setSelected] = useState(() => new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null); // "delete" | "restore"
  const toggleSelect = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((current) =>
      current.size === visible.length
        ? new Set()
        : new Set(visible.map((facility) => facility.id))
    );
  const clearSelection = () => setSelected(new Set());

  const onSort = (field) => {
    const nextOrder = sort === field && order === "asc" ? "desc" : "asc";
    set("sort", field);
    set("order", nextOrder);
    set("page", "");
  };

  // Tab counts (both slices) — refreshed alongside every mutation.
  const [counts, setCounts] = useState({ active: null, deleted: null });
  const [countsToken, setCountsToken] = useState(0);
  useEffect(() => {
    let alive = true;
    Promise.all([
      api.listFacilities({ deleted: false }),
      api.listFacilities({ deleted: true }),
    ])
      .then(([activeRows, deletedRows]) => {
        if (alive) setCounts({ active: activeRows.length, deleted: deletedRows.length });
      })
      .catch(() => {
        /* counts are supplementary — the tabs render without them */
      });
    return () => {
      alive = false;
    };
  }, [countsToken]);

  const reload = () => {
    retry();
    setCountsToken((token) => token + 1);
    setSelectedId(null);
    clearSelection();
  };

  // DELETE /facility/:id is a TOGGLE server-side: soft-deletes, or restores
  // an already-deleted facility — the toast copy follows the actual effect.
  const confirmToggle = () =>
    run(
      async () => {
        await api.deleteFacility(confirmTarget.id);
        setConfirmTarget(null);
        reload();
      },
      {
        success: filters.showDeleted
          ? "Facility restored."
          : "Facility deleted — restore it anytime from the deleted list.",
      }
    );

  const confirmBulk = () =>
    run(
      async () => {
        await api.bulkToggleFacilities([...selected], bulkConfirm === "delete");
        setBulkConfirm(null);
        reload();
      },
      {
        success:
          bulkConfirm === "restore"
            ? "Facilities restored."
            : "Facilities deleted — restore them anytime from the deleted list.",
      }
    );

  return (
    <div>
      <FacilitiesHeader onRegister={() => setCreating(true)}>
        <FacilitiesViewToggle
          view={view}
          onChange={(next) => set("view", next === "split" ? "" : next, { replace: true })}
        />
      </FacilitiesHeader>

      <FacilitiesFilterBar
        search={filters.search}
        onSearchChange={(event) => set("search", event.target.value, { replace: true })}
        statusFilter={filters.statusFilter}
        onStatusChange={(event) => set("status", event.target.value)}
        showDeleted={filters.showDeleted}
        onTabChange={(showDeleted) => set("deleted", showDeleted ? "1" : "")}
        activeCount={counts.active}
        deletedCount={counts.deleted}
        onClear={clear}
      />

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-line-strong bg-surface-2 px-3 py-2">
          <p className="text-[11px] font-semibold text-ink-soft">
            {selected.size} selected
          </p>
          <button
            type="button"
            onClick={() => setBulkConfirm(filters.showDeleted ? "restore" : "delete")}
            className={`inline-flex min-h-9 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-[11px] font-semibold transition ${
              filters.showDeleted
                ? "text-success hover:bg-success-soft"
                : "text-danger hover:bg-danger-soft"
            }`}
          >
            {filters.showDeleted ? "Restore selected" : "Delete selected"}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto inline-flex min-h-9 items-center rounded-md px-2 text-[11px] font-semibold text-muted transition hover:text-ink-soft"
          >
            Clear selection
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
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
        <div
          className={
            view === "split"
              ? "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              : ""
          }
        >
          {view !== "list" && (
            <div className={view === "split" ? "min-w-0 lg:sticky lg:top-4 lg:self-start" : ""}>
              <FacilitiesMapCard
                facilities={visible}
                onView={(facilityId) => navigate(`/facilities/${facilityId}`)}
                onSelect={(facility) => setSelectedId(facility.id)}
                hoverId={hoverId}
                selectedId={selectedId}
                height={view === "map" ? 560 : 420}
              />
            </div>
          )}

          {view !== "map" && (
            <div className="min-w-0">
              <FacilitiesTable
                facilities={visible}
                showDeleted={filters.showDeleted}
                onToggle={(facility) => {
                  setActionError("");
                  setConfirmTarget(facility);
                }}
                hoverId={hoverId}
                selectedId={selectedId}
                onHover={setHoverId}
                onSelect={setSelectedId}
                sort={sort}
                order={order}
                onSort={onSort}
                selectedIds={selected}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={10}
                onPage={(next) => set("page", String(next))}
              />
            </div>
          )}
        </div>
      )}

      {creating && (
        <FacilityCreateModal
          onCreated={() => {
            setCreating(false);
            reload();
          }}
          onClose={() => setCreating(false)}
        />
      )}

      {bulkConfirm && (
        <ConfirmDialog
          open
          tone={bulkConfirm === "delete" ? "danger" : "primary"}
          title={
            bulkConfirm === "delete"
              ? `Delete ${selected.size} facilities?`
              : `Restore ${selected.size} facilities?`
          }
          busy={busy}
          onConfirm={confirmBulk}
          onCancel={() => setBulkConfirm(null)}
        >
          {bulkConfirm === "delete"
            ? "They move to the deleted list and can be restored anytime."
            : "They return to the active registry immediately."}
        </ConfirmDialog>
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
