import { ArrowRight } from "lucide-react";
import { buildDetailRows, redact } from "./detailFormat";

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
export default function ActivityDetails({ metadata }) {
  const rows = buildDetailRows(redact(metadata ?? {}));
  if (rows.length === 0) return null;

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
                  <ArrowRight size={10} className="text-primary" />
                  <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[12px] font-semibold text-primary">
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
    </div>
  );
}
