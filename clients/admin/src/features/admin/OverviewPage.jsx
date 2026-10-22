import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import useActivityStats from "../../hooks/useActivityStats";
import useDashboardSummary from "../../hooks/useDashboardSummary";
import { useAuth } from "../../context/AuthContext";
import StatusPanel from "../../components/ui/StatusPanel";
import ActivityHeatmapCard from "./overview/ActivityHeatmapCard";
import BriefStrip from "./overview/BriefStrip";
import FacilityLoadCards from "./overview/FacilityLoadCards";
import FlowPanel from "./overview/FlowPanel";
import HeroHeader from "./overview/HeroHeader";
import NeedsAttentionCard from "./overview/NeedsAttentionCard";
import RecentActivityCard from "./overview/RecentActivityCard";
import ReadinessRadialCard from "./overview/ReadinessRadialCard";

/**
 * Admin Overview — an "operations brief" in three deliberate zones under the
 * fixed hero band (identity + the one headline occupancy metric):
 *
 *   brief strip  → ONE hairline grid (facilities · staff · essentials · 24h
 *                  flow) — a network briefing, not four floating cards;
 *   command row  → the dominant visual (Network flow chart) beside the
 *                  ACTION RAIL: "Needs attention" (threshold exceptions)
 *                  over "Readiness" (mandatory essentials);
 *   detail row   → the dense facility-load table beside the activity feed.
 *
 * Facts live once (headline + drill-down is the allowed pairing): occupancy
 * and facility states in the hero, network counts in the strip, tempo in the
 * flow panel meta, per-essential detail in Readiness, per-facility detail in
 * the table, events in the feed. Data: one GET /dashboard/summary plus the
 * day-bucketed GET /activity/stats?interval=day for the chart.
 */
const OverviewPage = () => {
  const { user } = useAuth();
  const { summary, loading, error, reload } = useDashboardSummary();
  const reduceMotion = useReducedMotion();

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
      // One 31-day day-bucketed fetch feeds both views: the chart shows the
      // last 14 days (slice), the pulse heatmap uses the full window.
      chartWindow: {
        interval: "day",
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }, []);
  const { timeline, loading: chartLoading } = useActivityStats(chartWindow);

  const firstName = user?.firstName || String(user?.role).toLocaleLowerCase();
  const occupancyPct = summary ? Math.round(summary.capacity.pct) : 0;

  // Quiet staggered entrance for the zones (instant under reduced motion).
  const zone = (index) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.3,
      delay: reduceMotion ? 0 : 0.06 * index,
      ease: [0.22, 1, 0.36, 1],
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero band (fixed foundation — not part of the redesign) ── */}
      <HeroHeader
        today={today}
        greeting={greeting}
        firstName={firstName}
        summary={summary}
        occupancyPct={occupancyPct}
      />

      {error && (
        <StatusPanel tone="error" title="Could not load the dashboard" onRetry={reload}>
          {error.message}
        </StatusPanel>
      )}

      {/* ── Zone 1: the network brief strip ─────────────────────── */}
      <motion.div {...zone(0)}>
        <BriefStrip summary={summary} />
      </motion.div>

      {/* ── Command row: flow (natural size) with facility load directly
             beneath it; the action rail + feed beside them. Cards keep their
             natural heights — no stretching to chase whitespace. ──────── */}
      <motion.div
        {...zone(1)}
        className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <FlowPanel
            summary={summary}
            timeline={timeline ? timeline.slice(-14) : timeline}
            loading={chartLoading}
          />
          <FacilityLoadCards summary={summary} loading={loading} />
          <ActivityHeatmapCard timeline={timeline} loading={chartLoading} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <NeedsAttentionCard summary={summary} />
          <ReadinessRadialCard summary={summary} />
          <RecentActivityCard />
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewPage;
