import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
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
      <PageHeader
        title="Facilities"
        subtitle="Register, edit and restore evacuation centers"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or address…"
          className="h-9 w-full max-w-[240px] rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] shadow-[0_4px_12px_rgba(50,70,120,0.06)] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-9 rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] shadow-[0_4px_12px_rgba(50,70,120,0.06)] outline-none ring-[#5269ef] focus:ring-2"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <Button
          variant={showDeleted ? "primary" : "neutral"}
          onClick={() => setShowDeleted((current) => !current)}
          className="px-3 py-1.5 text-[9px]"
        >
          {showDeleted ? "Showing deleted" : "Deleted facilities"}
        </Button>
        <Button onClick={() => setCreating(true)} className="ml-auto px-4 py-1.5 text-[9px]">
          + Register facility
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
        <StatusPanel tone="empty" title={showDeleted ? "No deleted facilities" : "No facilities found"}>
          {showDeleted
            ? "Soft-deleted facilities will appear here so you can restore them."
            : "Register a new evacuation center to get started."}
        </StatusPanel>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#eef1f8]">
                {["Name", "Address", "Status", "Capacity", "Staff", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.7px] text-[#9aa8c5]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((facility) => (
                <tr key={facility.id} className="border-b border-[#f3f5fa] last:border-0">
                  <td className="px-4 py-2.5 text-[10px] font-semibold text-[#35405e]">
                    <Link to={`/facilities/${facility.id}`} className="text-[#5269ef] hover:text-[#4058df]">
                      {facility.name}
                    </Link>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-[9px] text-[#7180a0]">
                    {facility.address}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${
                        facility.status === "AVAILABLE"
                          ? "bg-[#e2f4e8] text-[#1f7a3d]"
                          : "bg-[#fff3d9] text-[#a96a00]"
                      }`}
                    >
                      {facility.status === "AVAILABLE" ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-[#7180a0]">{facility.maxCapacity}</td>
                  <td className="px-4 py-2.5 text-[9px] text-[#7180a0]">{facility.staffCount ?? 0}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/facilities/${facility.id}`}
                        className="text-[9px] font-semibold text-[#5269ef] hover:text-[#4058df]"
                      >
                        Manage
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setConfirmTarget(facility);
                        }}
                        className={`text-[9px] font-semibold ${
                          showDeleted ? "text-[#1f7a3d] hover:text-[#155c2c]" : "text-[#d8322d] hover:text-[#b3261f]"
                        }`}
                      >
                        {showDeleted ? "Restore" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
