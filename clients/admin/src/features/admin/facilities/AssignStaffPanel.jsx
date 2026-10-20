import { Search, UserPlus } from "lucide-react";
import Button from "../../../components/ui/Button";

/**
 * Right pane of the staff assignment panel — the assign picker: a search
 * input over all staff accounts (server-side `search`) and the candidate
 * rows. Candidates are pre-filtered by the section; `onAssign(candidate)`
 * runs the assign flow (a candidate already elsewhere TRANSFERS).
 */
const AssignStaffPanel = ({ query, onQueryChange, candidates, busy, onAssign }) => (
  <div className="rounded-md border border-line bg-surface-2 p-3">
    <h3 className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-soft">
      <UserPlus size={12} strokeWidth={2} aria-hidden="true" /> Assign staff
    </h3>

    <div className="relative mb-2">
      <Search
        size={13}
        strokeWidth={2}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-dim"
      />
      <input
        value={query}
        onChange={onQueryChange}
        placeholder="Search staff accounts…"
        aria-label="Search staff accounts"
        className="h-11 w-full rounded-md border border-line-strong bg-surface pl-8 pr-3 text-[12px] font-medium text-ink-soft outline-none transition placeholder:text-muted-dim focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
    </div>

    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
      {candidates.map((candidate) => (
        <li
          key={candidate.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-surface"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-ink-soft">
              {candidate.firstName && candidate.lastName
                ? `${candidate.firstName} ${candidate.lastName}`
                : candidate.email}
            </p>
            <p className="text-[10px] text-muted">
              {candidate.facility ? `Currently: ${candidate.facility.name} (will transfer)` : "Unassigned"}
            </p>
          </div>
          <Button size="sm" variant="soft" onClick={() => onAssign(candidate)} disabled={busy}>
            <UserPlus size={11} strokeWidth={2} className="mr-1" /> Assign
          </Button>
        </li>
      ))}
      {candidates.length === 0 && (
        <li className="py-3 text-center text-[11px] text-muted">
          {query ? "No staff accounts match that search." : "All staff accounts are already assigned here."}
        </li>
      )}
    </ul>
  </div>
);

export default AssignStaffPanel;
