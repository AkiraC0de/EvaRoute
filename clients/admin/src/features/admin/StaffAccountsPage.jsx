import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import { FilterSearch, FilterSelect } from "../../components/ui/FilterControls";
import Checkbox from "../../components/ui/Checkbox";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyArt from "../../components/ui/EmptyArt";
import Modal from "../../components/ui/Modal";
import StatusPanel from "../../components/ui/StatusPanel";
import Skeleton from "../../components/ui/Skeleton";
import StatusPill from "../../components/ui/StatusPill";
import TextField from "../../components/ui/Field";
import { TableShell, Th, Td, Tr } from "../../components/ui/Table";
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
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-ink">Staff accounts</h1>
          <p className="mt-1 text-[13px] text-muted">
            Create and manage the accounts that run your facilities
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={13} strokeWidth={2.2} className="mr-1" /> Create staff account
        </Button>
      </header>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-clay bg-surface p-3 shadow-clay">
        <FilterSearch
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Search email or name…"
          ariaLabel="Search staff accounts"
        />
        <FilterSelect
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          ariaLabel="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </FilterSelect>
        <label className="flex items-center gap-1.5">
          <Checkbox
            checked={filters.unassigned}
            onChange={(event) =>
              setFilters((current) => ({ ...current, unassigned: event.target.checked }))
            }
            ariaLabel="Unassigned only"
          />
          <span className="text-[11px] font-medium text-[#65718c]">Unassigned only</span>
        </label>
      </div>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && (
        <div
          role="status"
          aria-label="Loading staff accounts"
          className="rounded-clay bg-surface p-5 shadow-clay"
        >
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-9 w-full rounded-clay-sm" />
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="mt-2 h-11 w-full rounded-clay-sm" />
          ))}
        </div>
      )}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load staff accounts" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-clay bg-surface p-8 text-center shadow-clay">
          <EmptyArt variant="people" className="mx-auto h-18 w-32" />
          <p className="mt-3 text-[15px] font-bold text-ink-soft">No staff accounts found</p>
          <p className="mt-1 text-[12px] text-muted">
            Create an account so staff can sign in and run a facility.
          </p>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <TableShell>
          <thead>
            <tr className="bg-sunken">
              {["Name", "Email", "Facility", "Status", "Actions"].map((label) => (
                <Th key={label}>{label}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((staff) => {
              const isSelf = staff.email === me?.email;
              return (
                <Tr key={staff.id}>
                  <Td>
                    <span className="text-[12px] font-semibold text-ink-soft">
                      {staff.firstName || staff.lastName
                        ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
                        : "—"}
                    </span>
                    {isSelf && <span className="ml-2 text-[10px] text-muted-dim">(you)</span>}
                  </Td>
                  <Td>
                    <span className="text-[11px] text-muted">{staff.email}</span>
                  </Td>
                  <Td>
                    <span className="text-[11px] text-muted">
                      {staff.facility ? staff.facility.name : "Unassigned"}
                    </span>
                  </Td>
                  <Td>
                    <StatusPill tone={staff.isActive ? "success" : "danger"}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </StatusPill>
                  </Td>
                  <Td>
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
                        className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
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
                            className="text-[11px] font-semibold text-warning transition hover:text-[#8a5400]"
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
                          className="text-[11px] font-semibold text-success transition hover:text-[#155c2c]"
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
                        className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
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
                          className="text-[11px] font-semibold text-danger transition hover:text-danger-strong"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableShell>
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
            <TextField
              label="Work email"
              type="email"
              required
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <p className="text-[11px] leading-relaxed text-muted-dim">
              The server generates a default password and emails it to the staff member. You
              will also see it once so you can share it securely.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="neutral" size="sm" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
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
            <TextField
              label="First name"
              value={editDraft.firstName}
              onChange={(event) =>
                setEditDraft((current) => ({ ...current, firstName: event.target.value }))
              }
            />
            <TextField
              label="Last name"
              value={editDraft.lastName}
              onChange={(event) =>
                setEditDraft((current) => ({ ...current, lastName: event.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="neutral" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
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
