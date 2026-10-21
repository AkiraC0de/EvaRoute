import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Button from "../../components/ui/Button";
import { slideVariants } from "../../components/ui/slideVariants";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
import { SkeletonActivityRow } from "../../components/ui/Skeleton";
import { RefreshCw } from "lucide-react";
import useActivityPage from "../../hooks/useActivityPage";
import ActivityRow from "./ActivityRow";
import PaginationBar from "./PaginationBar";
import { dayLabel } from "./activityText";

/** Groups a newest-first list into contiguous calendar-day sections. */
function groupByDay(activities) {
  const groups = [];
  for (const log of activities) {
    const label = dayLabel(log.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(log);
    else groups.push({ label, items: [log] });
  }
  return groups;
}

/**
 * Full activity feed for the History screen: date-grouped timeline with
 * numbered pagination (server `page` mode) and a refresh control. Sits on a
 * Card (HistoryPage) — the header strip follows the app's section-header
 * language.
 */
export default function PagedActivityFeed({
  query = {},
  pageSize = 15,
  showFacility = false,
  emptyTitle = "Nothing recorded yet",
  emptyDetail = "Check-ins, resource changes and account actions will appear here as they happen.",
}) {
  const { activities, total, totalPages, page, loading, error, setPage, reload } = useActivityPage(
    query,
    pageSize,
  );

  const [dir, setDir] = useState(1);
  const reduceMotion = useReducedMotion();
  // Page travel direction for the slide-in (pages arrive from the server, so
  // this is an entrance-only slide keyed by `page` — see slideVariants).
  const goPage = (next) => {
    setDir(next >= page ? 1 : -1);
    setPage(next);
  };

  const header = (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <h2 className="text-[13px] font-bold text-ink-soft">
        Activity{" "}
        <span className="ml-1 text-[11px] font-medium text-muted">
          {loading ? "Loading…" : `${total} recorded ${total === 1 ? "event" : "events"}`}
        </span>
      </h2>
      <Button variant="neutral" size="sm" onClick={reload} disabled={loading} aria-label="Refresh activity">
        <RefreshCw size={11} className="mr-1" />
        Refresh
      </Button>
    </div>
  );

  if (loading) {
    return (
      <>
        {header}
        <div className="px-4 pb-4">
          <div role="status" aria-label="Loading activity" className="space-y-2">
            {[0, 1, 2].map((n) => (
              <SkeletonActivityRow key={n} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <div className="px-4 pb-4">
          <StatusPanel tone="error" title="Could not load activity" onRetry={reload}>
            The activity feed is unavailable right now. Please try again.
          </StatusPanel>
        </div>
      </>
    );
  }

  if (activities.length === 0) {
    return (
      <>
        {header}
        <div className="px-4 pb-8 pt-2 text-center">
          <EmptyArt variant="boxes" className="mx-auto h-18 w-32" />
          <p className="mt-3 text-[15px] font-bold text-ink-soft">{emptyTitle}</p>
          <p className="mt-1 text-[12px] text-muted">{emptyDetail}</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {header}
      <motion.div
        key={page}
        custom={dir}
        variants={slideVariants(reduceMotion)}
        initial="enter"
        animate="center"
      >
      {groupByDay(activities).map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="bg-surface-2 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            {group.label}
          </h3>
          <ul>
            {group.items.map((log) => (
              <ActivityRow key={log.id} log={log} showFacility={showFacility} />
            ))}
          </ul>
        </section>
      ))}
      </motion.div>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onChange={goPage}
      />
    </div>
  );
}
