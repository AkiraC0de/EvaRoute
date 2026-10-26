import { useMemo, useState } from "react";
import Banner from "../../../components/ui/Banner";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import useAsyncAction from "../../../hooks/useAsyncAction";
import * as api from "../../../lib/api";
import useFacilityStaff from "../../../hooks/useFacilityStaff.js";
import useStaffAccounts from "../staff/useStaffAccounts.js";
import AssignedStaffList from "./AssignedStaffList";
import AssignStaffPanel from "./AssignStaffPanel";

/**
 * Staff assignment for one facility: the assigned list plus an assign picker
 * fed by GET /staff (search + unassigned filter server-side).
 *
 * Assign semantics come from the server: assigning a staff who already belongs
 * to another facility TRANSFERS them — the confirm dialog says so.
 *
 * Layout: a two-pane workspace — the assigned roster on the left (the primary
 * content, wider), the assign picker in a bordered side panel on the right.
 * Stacks on small screens. This component owns data flow and the dismiss
 * dialog; the two panes live in their own modules.
 */
const FacilityStaffSection = ({ facilityId }) => {
  // Assigned roster + assign-picker candidates — both cached query adapters
  // (tag `staff`): one fetch per mount (StrictMode-safe) and assign/dismiss
  // refresh them through the request() seam. `loading`/`error` keep the
  // AssignedStaffList contract.
  const roster = useFacilityStaff(facilityId);
  const staff = roster.rows;
  const loading = roster.status === "pending";
  const error = roster.error;
  const [query, setQuery] = useState("");
  const [dismissTarget, setDismissTarget] = useState(null);
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  // Assign picker: search across all accounts (server-side `search`), minus
  // the ones already assigned — derived from the live roster, so an assign or
  // dismiss updates the picker without a refetch race.
  const candidatesQuery = useStaffAccounts({ search: query });
  const candidates = useMemo(
    () =>
      (candidatesQuery.visible ?? []).filter(
        (entry) => !staff.some((s) => s.userId === entry.id),
      ),
    [candidatesQuery.visible, staff],
  );

  const retry = () => {
    roster.retry();
    candidatesQuery.retry();
  };

  const assign = (candidate) =>
    run(async () => {
      await api.assignFacilityStaff(facilityId, candidate.id);
      retry();
    });

  const dismiss = () =>
    run(async () => {
      await api.dismissFacilityStaff(facilityId, dismissTarget.userId);
      setDismissTarget(null);
      retry();
    });

  return (
    <Card>
      <h2 className="mb-3 text-[13px] font-bold text-ink-soft">Staff assignment</h2>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        {/* Left pane — the roster */}
        <AssignedStaffList
          staff={staff}
          loading={loading}
          error={error}
          onRetry={retry}
          onDismiss={(member) => {
            setActionError("");
            setDismissTarget(member);
          }}
        />

        {/* Right pane — the assign picker */}
        <AssignStaffPanel
          query={query}
          onQueryChange={(event) => setQuery(event.target.value)}
          candidates={candidates}
          busy={busy}
          onAssign={assign}
        />
      </div>

      {dismissTarget && (
        <ConfirmDialog
          title="Dismiss staff"
          message={`Remove ${dismissTarget.firstName ?? dismissTarget.email} from this facility? They will become unassigned.`}
          confirmLabel="Dismiss"
          busy={busy}
          onConfirm={dismiss}
          onCancel={() => setDismissTarget(null)}
        />
      )}
    </Card>
  );
};

export default FacilityStaffSection;
