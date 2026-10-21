import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getStay } from "../../lib/api/stays";
import { buildDetailRows, redact } from "./detailFormat";

/**
 * Family members of a stay event — fetched on expand from the stay record
 * (the source of truth; the activity log keeps counts only, by design).
 * Renders name + age-group chips, or an honest quiet note when the record
 * can no longer be fetched. Only stay events (metadata.stayId +
 * metadata.facility.id) trigger the fetch.
 */
function StayMembers({ facilityId, stayId }) {
  const [state, setState] = useState({ status: "loading", members: [] });

  useEffect(() => {
    let alive = true;
    getStay(facilityId, stayId)
      .then((stay) => {
        if (!alive) return;
        setState({ status: "ready", members: stay?.members ?? [] });
      })
      .catch(() => {
        if (alive) setState({ status: "error", members: [] });
      });
    return () => {
      alive = false;
    };
  }, [facilityId, stayId]);

  if (state.status === "loading") {
    return <p className="text-[11px] text-muted">Loading family members…</p>;
  }
  if (state.status === "error" || state.members.length === 0) {
    return (
      <p className="text-[11px] text-muted">
        Member list is unavailable for this record.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {state.members.map((member) => (
        <li key={member.id} className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-[11.5px] font-semibold text-ink-soft" title={member.fullName}>
            {member.fullName}
          </span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
              member.ageGroup === "CHILD"
                ? "bg-secondary-soft text-secondary-ink"
                : "bg-surface text-muted"
            }`}
          >
            {member.ageGroup === "CHILD" ? "Child" : "Adult"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Flat detail panel for one activity's metadata — the expanded "Details"
 * view. Renders human-readable label/value facts and before/after changes
 * in a bordered inset surface (bg-surface-2 + hairline), never raw JSON.
 * Change rows read as muted struck-through "before" value → accent chip
 * "after" value.
 *
 * Single-column rows keep every value right-aligned to the same edge, so
 * even a one-row panel reads as a tidy label/value list.
 */
export default function ActivityDetails({ metadata, log }) {
  const rows = buildDetailRows(redact(metadata ?? {}));
  // The log row denormalizes facilityId/targetId as SIBLINGS of metadata —
  // stay events carry the stay id in metadata.stayId (or targetId).
  const stayId = metadata?.stayId ?? log?.targetId ?? null;
  const facilityId = metadata?.facility?.id ?? log?.facilityId ?? null;
  const stayFetch =
    stayId && facilityId ? { facilityId, stayId } : null;
  if (rows.length === 0 && !stayFetch) return null;

  return (
    <div className="mt-1.5 rounded-md border border-line bg-surface-2 px-3.5 py-2.5">
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-[11px] font-medium text-muted">{row.label}</dt>
            <dd className="min-w-0 text-right">
              {row.kind === "diff" ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] text-muted line-through">
                    {row.from}
                  </span>
                  <ArrowRight size={10} className="text-primary-ink" />
                  <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[12px] font-semibold text-primary-ink">
                    {row.to}
                  </span>
                </span>
              ) : (
                <span className="truncate text-[12px] font-semibold text-ink-soft">{row.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {stayFetch && (
        <div className="mt-2 border-t border-line pt-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.7px] text-muted-dim">
            Family members
          </p>
          <div className="mt-1.5">
            <StayMembers facilityId={stayFetch.facilityId} stayId={stayFetch.stayId} />
          </div>
        </div>
      )}
    </div>
  );
}
