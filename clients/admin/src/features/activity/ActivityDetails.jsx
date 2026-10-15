import { ArrowRight } from "lucide-react";
import { buildDetailRows, redact } from "./detailFormat";

/**
 * Clay detail panel for one activity's metadata — the expanded "Details"
 * view. Renders human-readable label/value facts and before/after changes
 * in an inset (recessed) surface, never raw JSON.
 *
 * Single-column rows keep every value right-aligned to the same edge, so
 * even a one-row panel reads as a tidy label/value list.
 */
export default function ActivityDetails({ metadata }) {
  const rows = buildDetailRows(redact(metadata ?? {}));
  if (rows.length === 0) return null;

  return (
    <div className="mt-1.5 rounded-clay-sm bg-sunken px-3.5 py-2.5 shadow-clay-inset-strong">
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-[9px] font-medium text-[#65718c]">{row.label}</dt>
            <dd className="min-w-0 text-right">
              {row.kind === "diff" ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded-md border border-border/50 bg-surface/70 px-1.5 py-0.5 text-[9px] text-muted line-through decoration-[#b9c3dc]">
                    {row.from}
                  </span>
                  <ArrowRight size={10} className="text-accent" />
                  <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent ring-1 ring-accent/20">
                    {row.to}
                  </span>
                </span>
              ) : (
                <span className="truncate text-[10px] font-semibold text-ink-soft">{row.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
