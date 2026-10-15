import { RefreshCw } from "lucide-react";
import useActivityPage from "../../hooks/useActivityPage";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
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
 * Full activity feed for the History screen: modern date-grouped timeline
 * with numbered pagination (server `page` mode) and a refresh control.
 *
 * @param {object} query      { facilityId?, action?, search?, from?, to? }
 * @param {number} pageSize   rows per page (default 15)
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

  const statusBar = (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5">
      <span className="text-[11px] font-bold text-ink-soft">
        {loading ? "Loading…" : `${total} recorded ${total === 1 ? "event" : "events"}`}
      </span>
      <button
        type="button"
        onClick={reload}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-canvas px-3 py-1.5 text-xs font-medium text-ink-muted shadow-clay transition-all hover:text-accent active:shadow-clay-inset disabled:opacity-50"
        aria-label="Refresh activity"
      >
        <RefreshCw size={12} />
        Refresh
      </button>
    </div>
  );

  if (loading) {
    return (
      <>
        {statusBar}
        <StatusPanel loading />
      </>
    );
  }

  if (error) {
    return (
      <>
        {statusBar}
        <StatusPanel title="Activity could not be loaded." detail="Please try again." onRetry={reload} />
      </>
    );
  }

  if (activities.length === 0) {
    return (
      <>
        {statusBar}
        <EmptyArt variant="boxes" title={emptyTitle} detail={emptyDetail} />
      </>
    );
  }

  return (
    <div>
      {statusBar}
      {groupByDay(activities).map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="bg-sunken/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            {group.label}
          </h3>
          <ul className="divide-y divide-border/50">
            {group.items.map((log) => (
              <ActivityRow key={log.id} log={log} showFacility={showFacility} />
            ))}
          </ul>
        </section>
      ))}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onChange={setPage}
      />
    </div>
  );
}
