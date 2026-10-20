import { useMemo } from "react";
import useActivityStats from "../../hooks/useActivityStats";
import useDashboardSummary from "../../hooks/useDashboardSummary";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../occupancy/SectionHeader";
import ActivityChartCard from "./overview/ActivityChartCard";
import FacilityLoadCard from "./overview/FacilityLoadCard";
import HeroHeader from "./overview/HeroHeader";
import Last24hCard from "./overview/Last24hCard";
import RecentActivityCard from "./overview/RecentActivityCard";
import StatRow from "./overview/StatRow";

/**
 * Admin Overview — an operations dashboard in flat operational BANDS on the
 * warm canvas (not a grid of identical floating cards):
 *
 *   hero band        → navy headline panel (occupancy + facility states +
 *                      quick actions) with the KPI wall right below it;
 *   operational band → titled section header + activity chart / recent feed
 *                      beside facility load / the rolling-window strip.
 *
 * Facts live in exactly one place: occupancy in the hero, facility-state
 * counts in the hero chips, capacity/people/places/accounts in the KPI
 * cards, rolling windows in "At a glance".
 *
 * Data: ONE GET /api/v1/dashboard/summary (facility states, live occupancy,
 * staff states, rolling windows, per-facility load) plus the day-bucketed
 * GET /api/v1/activity/stats?interval=day for the chart. No client-side
 * aggregation, no N+1. Type scale matches the rest of the app: 22px page
 * title, 24px KPI values, 10px tracked labels, 9–11px support text.
 */

const OverviewPage = () => {
  const { user } = useAuth();
  const { summary, loading, error, reload } = useDashboardSummary();

  // Date-dependent values are computed once per mount (render purity).
  const { today, greeting, chartWindow } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    return {
      today: now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      greeting:
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
      // Chart window: last 14 days, day-bucketed by the server (UTC days).
      chartWindow: {
        interval: "day",
        from: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }, []);
  const { timeline, loading: chartLoading } = useActivityStats(chartWindow);

  const firstName = user?.firstName || String(user?.role).toLocaleLowerCase();
  const occupancyPct = summary ? Math.round(summary.capacity.pct) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Hero band: headline panel + supporting KPI wall ─────── */}
      <HeroHeader
        today={today}
        greeting={greeting}
        firstName={firstName}
        summary={summary}
        occupancyPct={occupancyPct}
      />
      <StatRow error={error} loading={loading} summary={summary} reload={reload} />

      {/* ── Operational band ───────────────────────────────────── */}
      <SectionHeader
        top
        title="Network operations"
        caption="Activity trend, facility load and the latest changes"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ActivityChartCard timeline={timeline} loading={chartLoading} />
          <RecentActivityCard />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <FacilityLoadCard summary={summary} loading={loading} />
          {summary && <Last24hCard summary={summary} />}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
