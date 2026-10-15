import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import { FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
import StatusPill from "../../components/ui/StatusPill";
import { TableShell, Th, Td, Tr } from "../../components/ui/Table";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";
import FacilityCreateModal from "./FacilityCreateModal";

/**
 * Facilities registry (ADMIN).
 *
 * List + create + delete/restore. GET /facility has no server-side search or
 * pagination, so search is client-side over the fetched rows (fine at current
 * scale — see the plan's gap list). The `deleted` tab drives the soft-delete
 * RESTORE flow: DELETE is a toggle server-side.
 */

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

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
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold leading-tight text-ink">Facilities</h1>
          <p className="mt-1 text-[11px] text-muted">
            Register, edit and restore evacuation centers
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="md">
          <Plus size={13} strokeWidth={2.2} className="mr-1" /> Register facility
        </Button>
      </header>

      {/* Filter bar — recessed band */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-clay bg-surface p-3 shadow-clay">
        <FilterSearch
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or address…"
          ariaLabel="Search facilities"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          ariaLabel="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </FilterSelect>
        <Button
          variant={showDeleted ? "soft" : "neutral"}
          size="sm"
          onClick={() => setShowDeleted((current) => !current)}
        >
          {showDeleted ? "Showing deleted" : "Deleted facilities"}
        </Button>
      </div>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && (
        <StatusPanel title="Loading facilities…">
          Fetching the facility registry from the EvaRoute API.
        </StatusPanel>
      )}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load facilities" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-clay bg-surface p-8 text-center shadow-clay">
          <EmptyArt variant={showDeleted ? "boxes" : "map"} className="mx-auto h-18 w-32" />
          <p className="mt-3 text-[13px] font-bold text-ink-soft">
            {showDeleted ? "No deleted facilities" : "No facilities found"}
          </p>
          <p className="mt-1 text-[10px] text-muted">
            {showDeleted
              ? "Soft-deleted facilities will appear here so you can restore them."
              : "Register a new evacuation center to get started."}
          </p>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <TableShell>
          <thead>
            <tr className="bg-sunken">
              {["Name", "Address", "Status", "Capacity", "Staff", "Actions"].map((label) => (
                <Th key={label}>{label}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((facility) => (
              <Tr key={facility.id}>
                <Td>
                  <Link
                    to={`/facilities/${facility.id}`}
                    className="text-[10px] font-semibold text-accent transition hover:text-accent-strong"
                  >
                    {facility.name}
                  </Link>
                </Td>
                <Td>
                  <span className="block max-w-[220px] truncate text-[9px] text-muted">
                    {facility.address}
                  </span>
                </Td>
                <Td>
                  <StatusPill tone={facility.status === "AVAILABLE" ? "success" : "warning"}>
                    {facility.status === "AVAILABLE" ? "Available" : "Unavailable"}
                  </StatusPill>
                </Td>
                <Td>
                  <span className="text-[9px] text-muted">{facility.maxCapacity}</span>
                </Td>
                <Td>
                  <span className="text-[9px] text-muted">{facility.staffCount ?? 0}</span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/facilities/${facility.id}`}
                      className="text-[9px] font-semibold text-accent transition hover:text-accent-strong"
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError("");
                        setConfirmTarget(facility);
                      }}
                      className={`inline-flex items-center gap-1 text-[9px] font-semibold transition ${
                        showDeleted
                          ? "text-success hover:text-[#155c2c]"
                          : "text-danger hover:text-danger-strong"
                      }`}
                    >
                      {showDeleted ? (
                        <><RotateCcw size={11} strokeWidth={2} /> Restore</>
                      ) : (
                        <><Trash2 size={11} strokeWidth={2} /> Delete</>
                      )}
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
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
