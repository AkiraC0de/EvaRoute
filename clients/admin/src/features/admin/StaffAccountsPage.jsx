import { useCallback, useEffect, useMemo, useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import GeneratedPasswordModal from "./GeneratedPasswordModal";

/**
 * Staff account management (ADMIN only — FETCH_ALL_STAFF & friends).
 *
 * Filters map 1:1 to the server query (`search`, `status`, `unassigned`).
 * Lifecycle: create (email only; server generates + emails the password),
 * edit names, activate/deactivate, reset password, delete — all confirmed
 * where destructive. The server refuses to deactivate/delete YOUR OWN
 * account; the UI hides those actions for your own row.
 */

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const StaffAccountsPage = () => {
  const { user: me } = useAuth();

  const [filters, setFilters] = useState({ search: "", status: "", unassigned: false });
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [creating, setCreating] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [editing, setEditing] = useState(null); // staff being name-edited
  const [editDraft, setEditDraft] = useState({ firstName: "", lastName: "" });
  const [confirmAction, setConfirmAction] = useState(null); // { type, staff }
  const [generated, setGenerated] = useState(null); // { title, email, password }

  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  useEffect(() => {
    let cancelled = false;

    api
      .listStaffAccounts({
        search: filters.search || undefined,
        status: filters.status || undefined,
        unassigned: filters.unassigned || undefined,
      })
      .then(({ staffs: rows }) => {
        if (!cancelled) setStaffs(rows);
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
  }, [filters, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const create = () =>
    run(async () => {
      const data = await api.createStaffAccount(createEmail.trim());
      setCreating(false);
      setCreateEmail("");
      setGenerated({
        title: "Staff account created",
        email: data.email,
        password: data.defaultPassword,
      });
      retry();
    });

  const saveEdit = () =>
    run(async () => {
      await api.patchStaffAccount(editing.id, {
        firstName: editDraft.firstName.trim(),
        lastName: editDraft.lastName.trim(),
      });
      setEditing(null);
      retry();
    });

  const runAction = (type, staff) =>
    run(async () => {
      if (type === "activate") await api.activateStaffAccount(staff.id);
      if (type === "deactivate") await api.deactivateStaffAccount(staff.id);
      if (type === "delete") await api.deleteStaffAccount(staff.id);
      if (type === "reset") {
        const data = await api.resetStaffPassword(staff.id);
        setGenerated({
          title: "Password reset",
          email: staff.email,
          password: data.defaultPassword,
        });
      }
      setConfirmAction(null);
      retry();
    });

  const visible = useMemo(() => staffs, [staffs]);

  return (
    <div>
      <PageHeader
        title="Staff accounts"
        subtitle="Create and manage the accounts that run your facilities"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Search email or name…"
          className="h-9 w-full max-w-[240px] rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] shadow-[0_4px_12px_rgba(50,70,120,0.06)] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="h-9 rounded-xl bg-white px-3 text-[10px] font-medium text-[#35405e] shadow-[0_4px_12px_rgba(50,70,120,0.06)] outline-none ring-[#5269ef] focus:ring-2"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={filters.unassigned}
            onChange={(event) =>
              setFilters((current) => ({ ...current, unassigned: event.target.checked }))
            }
            className="h-3.5 w-3.5 rounded accent-[#5269ef]"
          />
          <span className="text-[9px] font-medium text-[#65718c]">Unassigned only</span>
        </label>
        <Button onClick={() => setCreating(true)} className="ml-auto px-4 py-1.5 text-[9px]">
          + Create staff account
        </Button>
      </div>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && (
        <StatusPanel title="Loading staff accounts…">
          Fetching accounts from the EvaRoute API.
        </StatusPanel>
      )}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load staff accounts" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && visible.length === 0 && (
        <StatusPanel tone="empty" title="No staff accounts found">
          Create an account so staff can sign in and run a facility.
        </StatusPanel>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#eef1f8]">
                {["Name", "Email", "Facility", "Status", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.7px] text-[#9aa8c5]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((staff) => {
                const isSelf = staff.email === me?.email;
                return (
                  <tr key={staff.id} className="border-b border-[#f3f5fa] last:border-0">
                    <td className="px-4 py-2.5 text-[10px] font-semibold text-[#35405e]">
                      {staff.firstName || staff.lastName
                        ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
                        : "—"}
                      {isSelf && <span className="ml-2 text-[8px] text-[#9aa4b8]">(you)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[9px] text-[#7180a0]">{staff.email}</td>
                    <td className="px-4 py-2.5 text-[9px] text-[#7180a0]">
                      {staff.facility ? staff.facility.name : "Unassigned"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${
                          staff.isActive
                            ? "bg-[#e2f4e8] text-[#1f7a3d]"
                            : "bg-[#fbe4e3] text-[#d8322d]"
                        }`}
                      >
                        {staff.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(staff);
                            setEditDraft({
                              firstName: staff.firstName ?? "",
                              lastName: staff.lastName ?? "",
                            });
                          }}
                          className="text-[9px] font-semibold text-[#5269ef] hover:text-[#4058df]"
                        >
                          Edit
                        </button>
                        {staff.isActive ? (
                          !isSelf && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setConfirmAction({ type: "deactivate", staff });
                              }}
                              className="text-[9px] font-semibold text-[#a96a00] hover:text-[#8a5400]"
                            >
                              Deactivate
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActionError("");
                              setConfirmAction({ type: "activate", staff });
                            }}
                            className="text-[9px] font-semibold text-[#1f7a3d] hover:text-[#155c2c]"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setActionError("");
                            setConfirmAction({ type: "reset", staff });
                          }}
                          className="text-[9px] font-semibold text-[#5269ef] hover:text-[#4058df]"
                        >
                          Reset password
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => {
                              setActionError("");
                              setConfirmAction({ type: "delete", staff });
                            }}
                            className="text-[9px] font-semibold text-[#d8322d] hover:text-[#b3261f]"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title="Create staff account" onClose={() => setCreating(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
            className="space-y-3"
          >
            <label className="block">
              <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                Work email
              </span>
              <input
                type="email"
                required
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
              />
            </label>
            <p className="text-[9px] leading-relaxed text-[#9aa4b8]">
              The server generates a default password and emails it to the staff member. You
              will also see it once so you can share it securely.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="neutral" onClick={() => setCreating(false)} className="px-3 py-1.5 text-[9px]">
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="px-3 py-1.5 text-[9px]">
                {busy ? "Creating…" : "Create account"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Edit staff name" onClose={() => setEditing(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
            className="space-y-3"
          >
            <label className="block">
              <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                First name
              </span>
              <input
                value={editDraft.firstName}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, firstName: event.target.value }))
                }
                className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                Last name
              </span>
              <input
                value={editDraft.lastName}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, lastName: event.target.value }))
                }
                className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="neutral" onClick={() => setEditing(null)} className="px-3 py-1.5 text-[9px]">
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="px-3 py-1.5 text-[9px]">
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={
            confirmAction.type === "delete"
              ? "Delete staff account"
              : confirmAction.type === "deactivate"
                ? "Deactivate staff account"
                : confirmAction.type === "activate"
                  ? "Activate staff account"
                  : "Reset password"
          }
          message={
            confirmAction.type === "delete"
              ? `Permanently delete ${confirmAction.staff.email}? This cannot be undone.`
              : confirmAction.type === "deactivate"
                ? `Deactivate ${confirmAction.staff.email}? They will be signed out from all devices and cannot log in until reactivated.`
                : confirmAction.type === "activate"
                  ? `Reactivate ${confirmAction.staff.email}?`
                  : `Reset the password for ${confirmAction.staff.email}? A new default password will be generated and emailed to them; they will be signed out from all devices.`
          }
          confirmLabel={
            confirmAction.type === "delete"
              ? "Delete"
              : confirmAction.type === "deactivate"
                ? "Deactivate"
                : confirmAction.type === "activate"
                  ? "Activate"
                  : "Reset password"
          }
          tone={confirmAction.type === "delete" || confirmAction.type === "deactivate" ? "danger" : "primary"}
          requireText={confirmAction.type === "delete" ? confirmAction.staff.email : undefined}
          typed={confirmAction.typed ?? ""}
          onTypedChange={(value) =>
            setConfirmAction((current) => ({ ...current, typed: value }))
          }
          busy={busy}
          onConfirm={() => runAction(confirmAction.type, confirmAction.staff)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {generated && (
        <GeneratedPasswordModal
          title={generated.title}
          email={generated.email}
          password={generated.password}
          onClose={() => setGenerated(null)}
        />
      )}
    </div>
  );
};

export default StaffAccountsPage;
