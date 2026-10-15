import { RefreshCw } from "lucide-react";
import useActivity from "../../hooks/useActivity";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
import ActivityRow from "./ActivityRow";

/**
 * Reusable activity list with loading/empty/error states and cursor
 * "load more". Used by the History screen, the admin Overview panel, and the
 * facility-scoped strips (Facility detail / My Facility).
 *
 * @param {object} query       { facilityId?, action?, actorId?, from?, to? }
 * @param {number} limit       page size
 * @param {boolean} showFacility  show the facility chip per row (network feeds)
 * @param {boolean} compact    tighter rows, no empty-state art (side panels)
 * @param {string} emptyTitle  empty-state heading
 * @param {string} emptyDetail empty-state body
 */
export default function ActivityFeed({
  query = {},
  limit = 8,
  showFacility = false,
  compact = false,
  showRefresh = false,
  emptyTitle = "Nothing recorded yet",
  emptyDetail = "Check-ins, resource changes and account actions will appear here as they happen.",
}) {
  const { activities, nextCursor, loading, error, loadMore, loadingMore, reload } = useActivity(query, limit);

  const refreshButton = showRefresh && (
    <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
      <span className="text-[11px] font-bold text-ink-soft">
        {loading ? "Loading…" : `${activities.length} recent ${activities.length === 1 ? "entry" : "entries"}`}
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

  if (loading) return (<>{refreshButton}<StatusPanel loading /></>);

  if (error) {
    return (
      <>
        {refreshButton}
        <StatusPanel
          title="Activity could not be loaded."
          detail="Please try again."
          onRetry={reload}
        />
      </>
    );
  }

  if (activities.length === 0) {
    return compact ? (
      <p className="px-4 py-3 text-sm text-ink-muted">No recent activity.</p>
    ) : (
      <>
        {refreshButton}
        <EmptyArt variant="boxes" title={emptyTitle} detail={emptyDetail} />
      </>
    );
  }

  return (
    <div>
      {refreshButton}
      <ul className="divide-y divide-border/50">
        {activities.map((log) => (
          <ActivityRow key={log.id} log={log} showFacility={showFacility} />
        ))}
      </ul>
      {nextCursor && (
        <div className="border-t border-border/60 p-3 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-clay-sm border border-border bg-canvas px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-accent disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
