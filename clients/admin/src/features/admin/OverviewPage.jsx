import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Gauge,
  History as HistoryIcon,
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Chart from "../../components/ui/Chart";
import EmptyArt from "../../components/ui/EmptyArt";
import Skeleton from "../../components/ui/Skeleton";
import StatusPill from "../../components/ui/StatusPill";
import ActivityFeed from "../activity/ActivityFeed";
import useActivityStats from "../../hooks/useActivityStats";
import useDashboardSummary from "../../hooks/useDashboardSummary";
import { useAuth } from "../../context/AuthContext";

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

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const GRID = "grid grid-cols-2 gap-4 lg:grid-cols-4";
const CARD = "rounded-clay bg-surface p-5 shadow-clay";

/** Icon-tile tones (accent-soft or feedback-soft backgrounds only). */
const ICON_TONES = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

/** KPI card — label, primary number, support caption, optional meter. */
const StatCard = ({ icon, tone = "accent", label, value, caption, meter }) => (
  <div className={`${CARD} transition hover:-translate-y-0.5 hover:shadow-clay-lg`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-[0.8px] text-muted">
          {label}
        </p>
        <p className="mt-1 text-[22px] font-bold leading-none text-ink">{value}</p>
        {caption && <p className="mt-1.5 text-[9px] text-muted">{caption}</p>}
      </div>
      {icon && (
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-clay-sm ${ICON_TONES[tone]}`}
        >
          {icon}
        </span>
      )}
    </div>
    {/* Number.isFinite: `0 && …` would render a literal "0" (React falsy footgun). */}
    {Number.isFinite(meter) && (
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-500"
          style={{ width: `${Math.min(Math.max(meter, 0), 100)}%` }}
        />
      </div>
    )}
  </div>
);

/** Compact figure — an inset statistic (spec §4). */
const MiniStat = ({ label, value, caption }) => (
  <div className="rounded-clay-sm bg-sunken px-4 py-3 shadow-clay-inset">
    <p className="text-[7px] font-semibold uppercase tracking-[0.5px] text-muted">
      {label}
    </p>
    <p className="mt-0.5 text-[15px] font-bold leading-5 text-ink">{value}</p>
    {caption && <p className="mt-0.5 text-[8px] text-muted">{caption}</p>}
  </div>
);

/** Section card with title, optional meta and an optional corner link. */
const SectionCard = ({ title, meta, action, children }) => (
  <section className={CARD}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[11px] font-bold text-ink-soft">{title}</h2>
        {meta && <p className="mt-1 text-[9px] text-muted">{meta}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

/** Status → tone/label for the shared StatusPill (which renders children). */
const STATUS_TONE = { AVAILABLE: "success", UNAVAILABLE: "danger", LIMITED: "warning" };
const STATUS_LABEL = { AVAILABLE: "Available", UNAVAILABLE: "Unavailable", LIMITED: "Limited" };

/** One facility-load row: name, status, capacity meter. */
const LoadRow = ({ facility }) => (
  <div className="py-2.5 first:pt-0 last:pb-0">
    <div className="flex items-center justify-between gap-2">
      <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-ink-soft">
        {facility.name}
      </p>
      <StatusPill tone={STATUS_TONE[facility.status] ?? "neutral"}>
        {STATUS_LABEL[facility.status] ?? facility.status}
      </StatusPill>
      <p className="shrink-0 text-[9px] text-muted">
        <span className="font-semibold text-ink-soft">{facility.occupied}</span>
        /{facility.maxCapacity}
      </p>
    </div>
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-500"
        style={{ width: `${Math.min(facility.pct, 100)}%` }}
      />
    </div>
  </div>
);

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
      <header className="relative overflow-hidden rounded-clay bg-gradient-to-br from-accent to-accent-strong p-6 shadow-clay">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[1px] text-white">
              {today}
            </p>
            <h1 className="mt-1 text-[20px] font-bold leading-tight text-white">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 text-[11px] text-white">
              Network operations at a glance — occupancy, staffing and activity.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[8px] font-semibold text-ink-soft shadow-clay-xs">
                {summary?.facilities.total ?? "—"} facilities
              </span>
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[8px] font-semibold text-ink-soft shadow-clay-xs">
                {summary?.occupants.families ?? "—"} families on site
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-accent-strong">
                {occupancyPct}% occupied
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/facilities">
              <Button variant="onAccentGhost" size="md" className="inline-flex items-center gap-1.5">
                <Building2 size={13} strokeWidth={1.9} aria-hidden="true" /> Facilities
              </Button>
            </Link>
            <Link to="/staff">
              <Button variant="onAccentGhost" size="md" className="inline-flex items-center gap-1.5">
                <UserPlus size={13} strokeWidth={1.9} aria-hidden="true" /> Staff
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="onAccent" size="md" className="inline-flex items-center gap-1.5">
                <HistoryIcon size={13} strokeWidth={1.9} aria-hidden="true" /> View history
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Stat row ───────────────────────────────────────────── */}
      {error && (
        <div className={CARD}>
          <p className="text-[11px] font-semibold text-ink-soft">Could not load the dashboard</p>
          <p className="mt-1 text-[10px] text-muted">{error.message}</p>
          <Button variant="neutral" size="sm" className="mt-3" onClick={reload}>
            Try again
          </Button>
        </div>
      )}
      {loading && !error && (
        <div className={GRID} role="status" aria-label="Loading dashboard">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className={CARD}>
              <Skeleton className="h-2 w-16" />
              <Skeleton className="mt-3 h-6 w-20" />
              <Skeleton className="mt-3 h-2.5 w-24" />
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div className={GRID}>
          <StatCard
            icon={<Gauge size={20} strokeWidth={1.9} />}
            tone="accent"
            label="Network occupancy"
            value={`${occupancyPct}%`}
            caption={`${summary.capacity.occupied} of ${summary.capacity.total} places taken`}
            meter={occupancyPct}
          />
          <StatCard
            icon={<Users size={20} strokeWidth={1.9} />}
            tone="success"
            label="People on site"
            value={summary.occupants.total}
            caption={`${summary.occupants.families} families · ${summary.occupants.children} children, ${summary.occupants.adults} adults`}
          />
          <StatCard
            icon={<Building2 size={20} strokeWidth={1.9} />}
            tone="warning"
            label="Facilities"
            value={summary.facilities.total}
            caption={`${summary.facilities.byStatus.AVAILABLE ?? 0} available · ${
              (summary.facilities.byStatus.UNAVAILABLE ?? 0) +
              (summary.facilities.byStatus.LIMITED ?? 0)
            } limited/unavailable`}
          />
          <StatCard
            icon={<UserCheck size={20} strokeWidth={1.9} />}
            tone="accent"
            label="Staff accounts"
            value={summary.staff.total}
            caption={`${summary.staff.active} active · ${summary.staff.disabled} disabled`}
          />
        </div>
      )}

      {/* ── Two-column grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            title="Activity — last 14 days"
            meta="Daily check-ins and total events across the network."
            action={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[8px] font-semibold text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> Check-ins
                </span>
                <span className="flex items-center gap-1.5 text-[8px] font-semibold text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent-soft" aria-hidden="true" /> Other events
                </span>
              </div>
            }
          >
            {chartLoading && <Skeleton className="h-[220px] w-full rounded-clay-sm" />}
            {!chartLoading &&
              timeline &&
              (timeline.every((bucket) => bucket.total === 0) ? (
                <div className="py-12 text-center">
                  <EmptyArt variant="people" className="mx-auto h-16 w-28" />
                  <p className="mt-2 text-[10px] text-muted">
                    No activity in the last 14 days — it will appear here as it happens.
                  </p>
                </div>
              ) : (
                <Chart data={timeline} />
              ))}
            {!chartLoading && !timeline && (
              <p className="py-10 text-center text-[10px] text-muted">
                Activity data could not be loaded.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="Recent activity"
            meta="The latest meaningful changes across the network."
            action={
              <Link
                to="/history"
                className={`inline-flex items-center gap-1 text-[9px] font-semibold text-accent transition hover:text-accent-strong ${FOCUS_RING}`}
              >
                View full history →
              </Link>
            }
          >
            <ActivityFeed limit={6} />
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            title="Facility load"
            meta="Occupancy by facility, busiest first."
            action={
              <Link
                to="/facilities"
                className={`inline-flex items-center gap-1 text-[9px] font-semibold text-accent transition hover:text-accent-strong ${FOCUS_RING}`}
              >
                Manage →
              </Link>
            }
          >
            {loading && !summary && (
              <div role="status" aria-label="Loading facility load">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="py-2.5 first:pt-0 last:pb-0">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="mt-2 h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            )}
            {summary && summary.facilityLoad.length > 0 ? (
              <div className="divide-y divide-line">
                {summary.facilityLoad.slice(0, 5).map((facility) => (
                  <LoadRow key={facility.id} facility={facility} />
                ))}
              </div>
            ) : null}
            {summary && summary.facilityLoad.length === 0 && (
              <div className="py-6 text-center">
                <EmptyArt variant="map" className="mx-auto h-16 w-28" />
                <p className="mt-2 text-[10px] text-muted">
                  No facilities yet — register one to start tracking load.
                </p>
              </div>
            )}
          </SectionCard>

          {summary && (
            <SectionCard title="Last 24 hours" meta="Rolling window, plus this week's volume.">
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Check-ins" value={summary.activity.last24h.checkIns} />
                <MiniStat label="Check-outs" value={summary.activity.last24h.checkOuts} />
                <MiniStat
                  label="Events (7 days)"
                  value={summary.activity.last7d.events}
                  caption="all recorded actions"
                />
                <MiniStat
                  label="Unassigned staff"
                  value={summary.staff.unassigned}
                  caption="not yet at a facility"
                />
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
