import Button from "../../components/ui/Button";
import { ChevronLeft, ChevronRight } from "../../components/icons/evaIcons";

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
 * Numbered pagination for the History feed, built from the shared Button
 * (neutral = inactive, primary = current page). Collapses to a plain count
 * line when everything fits on one page.
 */
export default function PaginationBar({ page, totalPages, total, pageSize, onChange }) {
  if (!total || totalPages <= 1) {
    return (
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-muted">
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
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="text-[11px] text-muted">
        Showing <span className="font-semibold text-ink-soft">{first}–{last}</span> of{" "}
        <span className="font-semibold text-ink-soft">{total}</span>
      </p>

      <nav aria-label="Activity pages" className="flex items-center gap-1.5">
        <Button
          variant="neutral"
          size="sm"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="px-2"
        >
          <ChevronLeft size={13} />
        </Button>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="px-0.5 text-[11px] text-muted">
              …
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === page ? "primary" : "neutral"}
              size="sm"
              onClick={() => go(entry)}
              aria-current={entry === page ? "page" : undefined}
            >
              {entry}
            </Button>
          ),
        )}

        <Button
          variant="neutral"
          size="sm"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="px-2"
        >
          <ChevronRight size={13} />
        </Button>
      </nav>
    </div>
  );
}
