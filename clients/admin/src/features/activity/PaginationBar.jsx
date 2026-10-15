import { ChevronLeft, ChevronRight } from "lucide-react";

/** Windowed page numbers: 1 … 4 [5] 6 … 12 */
function pageWindow(current, total) {
  const pages = [];
  const push = (value) => pages.push(value);
  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) push(i);
    return pages;
  }
  push(1);
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) push("…");
  for (let i = from; i <= to; i += 1) push(i);
  if (to < total - 1) push("…");
  push(total);
  return pages;
}

/**
 * Numbered pagination bar for the History feed: "Showing x–y of z" plus
 * windowed page buttons with prev/next. Hidden when there is only one page.
 */
export default function PaginationBar({ page, totalPages, total, pageSize, onChange }) {
  if (!total || totalPages <= 1) {
    return (
      <div className="border-t border-border/50 px-4 py-2.5">
        <p className="text-xs text-ink-muted">
          {total ? `Showing ${total} ${total === 1 ? "entry" : "entries"}` : "No entries"}
        </p>
      </div>
    );
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const go = (next) => {
    if (next >= 1 && next <= totalPages && next !== page) onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
      <p className="text-xs text-ink-muted">
        Showing <span className="font-medium text-ink">{first}–{last}</span> of{" "}
        <span className="font-medium text-ink">{total}</span>
      </p>

      <nav aria-label="Activity pages" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-canvas text-ink-muted shadow-clay transition-all hover:text-accent active:shadow-clay-inset disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-ink-muted">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => go(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={
                entry === page
                  ? "inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-accent px-2 text-xs font-semibold text-white shadow-clay-accent"
                  : "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border/60 bg-canvas px-2 text-xs font-medium text-ink-muted shadow-clay transition-all hover:text-accent active:shadow-clay-inset"
              }
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-canvas text-ink-muted shadow-clay transition-all hover:text-accent active:shadow-clay-inset disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  );
}
