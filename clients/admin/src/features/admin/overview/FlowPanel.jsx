import Chart from "../../../components/ui/Chart";
import EmptyArt from "../../../components/ui/EmptyArt";
import { SkeletonChartBars } from "../../../components/ui/Skeleton";
import SectionCard from "./SectionCard";

/**
 * Network flow — the page's dominant visual element: the 14-day day-bucketed
 * activity chart with its legend, and the week's volume in the panel meta
 * (where the trend story belongs). Loading/empty/error states preserved
 * from the old chart card.
 */
const FlowPanel = ({ summary, timeline, loading }) => (
  <SectionCard
    title="Network flow"
    meta={
      summary
        ? `Daily activity over the last 14 days · ${summary.activity.last7d.events} events this week.`
        : "Daily activity over the last 14 days."
    }
    action={
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> Check-ins
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
          <span className="h-2 w-2 rounded-full bg-chart-quiet ring-1 ring-line" aria-hidden="true" /> Other events
        </span>
      </div>
    }
  >
    {loading && <SkeletonChartBars height={220} />}
    {!loading &&
      timeline &&
      (timeline.every((bucket) => bucket.total === 0) ? (
        <div className="py-12 text-center">
          <EmptyArt variant="people" className="mx-auto h-16 w-28" />
          <p className="mt-2 text-[12px] text-muted">
            No activity in the last 14 days — it will appear here as it happens.
          </p>
        </div>
      ) : (
        <Chart data={timeline} />
      ))}
    {!loading && !timeline && (
      <p className="py-10 text-center text-[12px] text-muted">
        Activity data could not be loaded.
      </p>
    )}
  </SectionCard>
);

export default FlowPanel;
