import { useCallback, useEffect, useState } from "react";
import Banner from "../../../components/ui/Banner";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import useAsyncAction from "../../../hooks/useAsyncAction";
import * as api from "../../../lib/api";
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
 * content, wider), the assign picker in a recessed well on the right. Stacks
 * on small screens. This component owns data flow and the dismiss dialog; the
 * two panes live in their own modules.
 */
const FacilityStaffSection = ({ facilityId }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [dismissTarget, setDismissTarget] = useState(null);
  const { busy, error: actionError, setError: setActionError, run } = useAsyncAction();

  useEffect(() => {
    let cancelled = false;

    api
      .listFacilityStaff(facilityId)
      .then((rows) => {
        if (!cancelled) setStaff(rows);
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
  }, [facilityId, reloadToken]);

  // Assign picker: search across all accounts (server-side `search`).
  useEffect(() => {
    let cancelled = false;

    api
      .listStaffAccounts({ search: query || undefined })
      .then(({ staffs }) => {
        if (!cancelled) {
          setCandidates(staffs.filter((entry) => !staff.some((s) => s.userId === entry.id)));
        }
      })
      .catch(() => {
        if (!cancelled) setCandidates([]);
      });

    return () => {
      cancelled = true;
    };
  }, [query, staff, reloadToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

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
