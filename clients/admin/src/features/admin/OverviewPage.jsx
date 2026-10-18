import { useMemo } from "react";
import useActivityStats from "../../hooks/useActivityStats";
import useDashboardSummary from "../../hooks/useDashboardSummary";
import { useAuth } from "../../context/AuthContext";
import ActivityChartCard from "./overview/ActivityChartCard";
import FacilityLoadCard from "./overview/FacilityLoadCard";
import HeroHeader from "./overview/HeroHeader";
import Last24hCard from "./overview/Last24hCard";
import RecentActivityCard from "./overview/RecentActivityCard";
import StatRow from "./overview/StatRow";

/**
 * Admin Overview — a real operations dashboard, composed from the shared UI
 * kit (shadcn composition rules) in the app's clay language:
 *
 *   hero header  → identity + quick actions (modern-dashboard-ui anatomy)
 *   stat row     → 4 KPI cards with support captions + occupancy meter
 *   two columns  → activity chart + recent feed | facility load + 24h strip
 *
 * Data: ONE GET /api/v1/dashboard/summary (facility states, live occupancy,
 * staff states, rolling windows, per-facility load) plus the day-bucketed
 * GET /api/v1/activity/stats?interval=day for the chart. No client-side
 * aggregation, no N+1. Type scale matches the rest of the app: 20px page
 * title, 22px KPI values, 8px tracked labels, 9–11px support text.
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
      {/* ── Hero header ─────────────────────────────────────────── */}
      <HeroHeader
        today={today}
        greeting={greeting}
        firstName={firstName}
        summary={summary}
        occupancyPct={occupancyPct}
      />

      {/* ── Stat row ───────────────────────────────────────────── */}
      <StatRow
        error={error}
        loading={loading}
        summary={summary}
        occupancyPct={occupancyPct}
        reload={reload}
      />

      {/* ── Two-column grid ────────────────────────────────────── */}
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
