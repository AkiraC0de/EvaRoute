import { useCallback, useEffect, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StatusPanel from "../../components/ui/StatusPanel";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";

/**
 * Staff assignment for one facility: the assigned list plus an assign picker
 * fed by GET /staff (search + unassigned filter server-side).
 *
 * Assign semantics come from the server: assigning a staff who already belongs
 * to another facility TRANSFERS them — the confirm dialog says so.
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
      <h2 className="mb-3 text-[12px] font-bold text-ink-soft">Assigned staff</h2>

      {actionError && (
        <div className="mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      )}

      {loading && (
        <StatusPanel title="Loading staff…">
          Fetching the staff assigned to this facility.
        </StatusPanel>
      )}

      {!loading && error && (
        <StatusPanel tone="error" title="Could not load staff" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!loading && !error && (
        <ul className="mb-4 space-y-2">
          {staff.map((member) => (
            <li
              key={member.userId}
              className="flex items-center gap-3 rounded-clay-sm bg-sunken px-3 py-2 shadow-clay-inset"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-ink-soft">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.email}
                </p>
                <p className="text-[8px] text-muted">{member.email}</p>
              </div>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => {
                  setActionError("");
                  setDismissTarget(member);
                }}
              >
                <X size={11} strokeWidth={2} className="mr-1" /> Dismiss
              </Button>
            </li>
          ))}
          {staff.length === 0 && (
            <li className="py-4 text-center text-[9px] text-muted">
              No staff assigned to this facility yet.
            </li>
          )}
        </ul>
      )}

      <h3 className="mb-2 text-[8px] font-semibold uppercase tracking-[0.7px] text-[#9aa8c5]">
        Assign staff
      </h3>
      <div className="relative mb-2">
        <Search
          size={13}
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-dim"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search staff accounts…"
          aria-label="Search staff accounts"
          className="h-9 w-full rounded-clay-sm bg-sunken pl-8 pr-3 text-[10px] font-medium text-ink-soft shadow-clay-inset outline-none transition placeholder:text-muted-dim hover:bg-[#f2f5fb] ring-accent focus:ring-2"
        />
      </div>
      <ul className="max-h-40 space-y-1 overflow-y-auto pr-1">
        {candidates.map((candidate) => (
          <li
            key={candidate.id}
            className="flex items-center gap-3 rounded-clay-sm px-2 py-1.5 transition hover:bg-sunken"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold text-ink-soft">
                {candidate.firstName && candidate.lastName
                  ? `${candidate.firstName} ${candidate.lastName}`
                  : candidate.email}
              </p>
              <p className="text-[8px] text-muted">
                {candidate.facility ? `Currently: ${candidate.facility.name} (will transfer)` : "Unassigned"}
              </p>
            </div>
            <Button size="sm" variant="soft" onClick={() => assign(candidate)} disabled={busy}>
              <UserPlus size={11} strokeWidth={2} className="mr-1" /> Assign
            </Button>
          </li>
        ))}
        {candidates.length === 0 && (
          <li className="py-3 text-center text-[9px] text-muted">
            {query ? "No staff accounts match that search." : "All staff accounts are already assigned here."}
          </li>
        )}
      </ul>

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
