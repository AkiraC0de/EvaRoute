import { RefreshCw } from "lucide-react";
import Button from "../../components/ui/Button";
import useActivity from "../../hooks/useActivity";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
import Skeleton from "../../components/ui/Skeleton";
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
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[11px] font-bold text-ink-soft">
        {loading ? "Loading…" : `${activities.length} recent ${activities.length === 1 ? "entry" : "entries"}`}
      </span>
      <Button variant="neutral" size="sm" onClick={reload} disabled={loading} aria-label="Refresh activity">
        <RefreshCw size={11} className="mr-1" />
        Refresh
      </Button>
    </div>
  );

  if (loading) {
    return (
      <>
        {refreshButton}
        <div className="px-4 pb-4">
          <div role="status" aria-label="Loading activity" className="space-y-2">
            {[0, 1, 2].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {refreshButton}
        <div className="px-4 pb-4">
          <StatusPanel tone="error" title="Could not load activity" onRetry={reload}>
            The activity feed is unavailable right now. Please try again.
          </StatusPanel>
        </div>
      </>
    );
  }

  if (activities.length === 0) {
    return compact ? (
      <p className="px-4 py-3 text-[10px] text-muted">No recent activity.</p>
    ) : (
      <>
        {refreshButton}
        <div className="px-4 pb-8 pt-2 text-center">
          <EmptyArt variant="boxes" className="mx-auto h-18 w-32" />
          <p className="mt-3 text-[13px] font-bold text-ink-soft">{emptyTitle}</p>
          <p className="mt-1 text-[10px] text-muted">{emptyDetail}</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {refreshButton}
      <ul className="divide-y divide-line">
        {activities.map((log) => (
          <ActivityRow key={log.id} log={log} showFacility={showFacility} />
        ))}
      </ul>
      {nextCursor && (
        <div className="p-3 text-center">
          <Button variant="neutral" size="sm" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
