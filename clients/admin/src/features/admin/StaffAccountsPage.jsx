import { useMemo, useState } from "react";
import useUrlFilters from "../../hooks/useUrlFilters";

// URL-backed filter defaults (keys appear as query params when active).
const STAFF_FILTER_DEFAULTS = { search: "", status: "", unassigned: "" };
import Banner from "../../components/ui/Banner";
import StatusPanel from "../../components/ui/StatusPanel";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import GeneratedPasswordModal from "./GeneratedPasswordModal";
import useStaffAccounts from "./staff/useStaffAccounts";
import StaffHeader from "./staff/StaffHeader";
import StaffToolbar from "./staff/StaffToolbar";
import StaffCardGrid from "./staff/StaffCardGrid";
import { StaffLoading, StaffEmpty } from "./staff/StaffStates";
import CreateStaffDialog from "./staff/CreateStaffDialog";
import EditStaffNameDialog from "./staff/EditStaffNameDialog";
import AssignFacilityDialog from "./staff/AssignFacilityDialog";
import StaffConfirmDialog from "./staff/StaffConfirmDialog";

/**
 * Staff account management (ADMIN only — FETCH_ALL_STAFF & friends).
 *
 * Filters map 1:1 to the server query (`search`, `status`, `unassigned`).
 * Lifecycle: create (email only; server generates + emails the password),
 * edit names, activate/deactivate, reset password, delete — all confirmed
 * where destructive. The server refuses to deactivate/delete YOUR OWN
 * account; the UI hides those actions for your own row.
 *
 * This component owns data flow and composition only — the header, filter
 * band, ID credential cards, list states and dialogs each live in their own
 * module.
 */

const StaffAccountsPage = () => {
  const { user: me } = useAuth();

  const { values, set, clear } = useUrlFilters(STAFF_FILTER_DEFAULTS);
  const filters = useMemo(
    () => ({
      search: values.search,
      status: values.status,
      unassigned: values.unassigned === "1",
    }),
    [values]
  );
  const { visible, loading, error, retry } = useStaffAccounts(filters);

  const [creating, setCreating] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [editing, setEditing] = useState(null); // staff being name-edited
  const [editDraft, setEditDraft] = useState({ firstName: "", lastName: "" });
  const [confirmAction, setConfirmAction] = useState(null); // { type, staff }
  const [generated, setGenerated] = useState(null); // { title, email, password }
  const [assigning, setAssigning] = useState(null); // staff being (re)assigned
  const [assignFacilityId, setAssignFacilityId] = useState("");
  const [assignFacilities, setAssignFacilities] = useState([]);
  const [assignLoadFailed, setAssignLoadFailed] = useState(false);

  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  const create = () =>
    run(
      async () => {
        const data = await api.createStaffAccount(createEmail.trim());
        setCreating(false);
        setCreateEmail("");
        setGenerated({
          title: "Staff account created",
          email: data.email,
          password: data.defaultPassword,
        });
        retry();
      }
    );

  const saveEdit = () =>
    run(
      async () => {
        await api.patchStaffAccount(editing.id, {
          firstName: editDraft.firstName.trim(),
          lastName: editDraft.lastName.trim(),
        });
        setEditing(null);
        retry();
      }
    );

  const runAction = (type, staff) =>
    run(
      async () => {
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
      }
    );

  // Assign / reassign: the server transfers the staff when they already
  // belong to another facility (ASSIGN_STAFF, ADMIN). The facility list is
  // fetched when the dialog opens so the picker is always current.
  const openAssign = (staff) => {
    setActionError("");
    setAssigning(staff);
    setAssignFacilityId("");
    setAssignFacilities([]);
    setAssignLoadFailed(false);
    api
      .listFacilities()
      .then((rows) => setAssignFacilities(rows))
      .catch(() => {
        // Distinct failure state — never render a fetch error as an empty list.
        setAssignFacilities([]);
        setAssignLoadFailed(true);
      });
  };

  const submitAssign = () =>
    run(
      async () => {
        await api.assignFacilityStaff(assignFacilityId, assigning.id);
        setAssigning(null);
        retry();
      }
    );

  return (
    <div>
      <StaffHeader onCreate={() => setCreating(true)} count={visible.length} />

      <StaffToolbar
        filters={filters}
        onSearchChange={(event) => set("search", event.target.value, { replace: true })}
        onStatusChange={(event) => set("status", event.target.value)}
        onUnassignedChange={(event) =>
          set("unassigned", event.target.checked ? "1" : "")
        }
        onClear={clear}
      />

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && <StaffLoading />}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load staff accounts" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && visible.length === 0 && <StaffEmpty />}

      {!loading && !error && visible.length > 0 && (
        <StaffCardGrid
          staffs={visible}
          currentEmail={me?.email}
          onEdit={(staff) => {
            setEditing(staff);
            setEditDraft({
              firstName: staff.firstName ?? "",
              lastName: staff.lastName ?? "",
            });
          }}
          onAssign={openAssign}
          onAction={(type, staff) => {
            setActionError("");
            setConfirmAction({ type, staff });
          }}
        />
      )}

      {creating && (
        <CreateStaffDialog
          email={createEmail}
          onEmailChange={(event) => setCreateEmail(event.target.value)}
          onSubmit={create}
          onClose={() => setCreating(false)}
          busy={busy}
        />
      )}

      {editing && (
        <EditStaffNameDialog
          draft={editDraft}
          onDraftChange={(draft) => setEditDraft(draft)}
          onSubmit={saveEdit}
          onClose={() => setEditing(null)}
          busy={busy}
        />
      )}

      {assigning && (
        <AssignFacilityDialog
          staff={assigning}
          facilities={assignFacilities}
          value={assignFacilityId}
          loadError={assignLoadFailed}
          onChange={(event) => setAssignFacilityId(event.target.value)}
          onSubmit={submitAssign}
          onClose={() => setAssigning(null)}
          busy={busy}
        />
      )}

      {confirmAction && (
        <StaffConfirmDialog
          action={confirmAction}
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
