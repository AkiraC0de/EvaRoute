import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Gauge, UserCheck, UserPlus, Users } from "lucide-react";
import EmptyArt from "../../components/ui/EmptyArt";
import StatusPanel from "../../components/ui/StatusPanel";
import ActivityFeed from "../activity/ActivityFeed";
import useActivityStats from "../../hooks/useActivityStats";
import * as api from "../../lib/api";

/**
 * Admin overview — network health at a glance, composed from existing
 * endpoints only (GET /facility, GET /staff, per-facility stay/occupancy).
 * No aggregate endpoint exists yet, so occupancy is summed client-side;
 * fine at the current number of facilities (see the plan's gap list).
 *
 * Styled per the EvaRoute claymorphism design spec (§4 color/status rules,
 * §6 spacing, §7 statistic cards, §8 typography): token-only colors,
 * `text-ink` values with `text-muted` support, status paired with labels,
 * and 4/8-based spacing.
 */

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Icon-tile tones (spec §7: accent-soft or feedback-soft backgrounds). */
const ICON_TONES = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

/** Prominent statistic card (spec §7: label, primary number, support, icon). */
const StatCard = ({ icon, tone = "accent", label, value, caption }) => (
  <div className="rounded-clay bg-surface p-6 shadow-clay">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold leading-none text-ink">{value}</p>
        {caption && <p className="mt-2 text-sm text-muted">{caption}</p>}
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
  </div>
);

/** Compact figure inside a section — an inset statistic area (spec §4). */
const MiniStat = ({ label, value, caption }) => (
  <div className="rounded-clay-sm bg-sunken px-4 py-3 shadow-clay-inset">
    <p className="text-sm font-medium text-muted">{label}</p>
    <p className="mt-1 text-2xl font-bold leading-none text-ink">{value}</p>
    {caption && <p className="mt-1.5 text-sm text-muted">{caption}</p>}
  </div>
);

/** Section shell: raised card with a semibold `text-ink` title (spec §8). */
const Section = ({ title, meta, action, children }) => (
  <section className="rounded-clay bg-surface p-6 shadow-clay">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const STATUS_BADGES = {
  AVAILABLE: { label: "Available", className: "bg-success-soft text-success" },
  UNAVAILABLE: { label: "Unavailable", className: "bg-warning-soft text-warning" },
  LIMITED: { label: "Limited", className: "bg-accent-soft text-accent" },
};

const StatusBadge = ({ status }) => {
  const badge = STATUS_BADGES[status] ?? { label: status ?? "Unknown", className: "bg-sunken text-muted" };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
};

const OccupancyBar = ({ members, capacity, className = "h-2.5" }) => {
  const pct = capacity > 0 ? Math.min(100, Math.round((members / capacity) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={members}
      className={`w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${
          pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-accent"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

/** Capacity health — the bar's color is always paired with words (spec §4). */
const capacityState = (pct) => {
  if (pct >= 90) return { label: "Near capacity", className: "bg-danger-soft text-danger" };
  if (pct >= 70) return { label: "Filling up", className: "bg-warning-soft text-warning" };
  return { label: "Healthy", className: "bg-success-soft text-success" };
};

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Accurate 7-day activity aggregates (DB GROUP BY via /activity/stats).
  const activityStats = useActivityStats();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const [facilities, { staffs }] = await Promise.all([
          api.listFacilities(),
          api.listStaffAccounts(),
        ]);

        const occupancies = await Promise.all(
          facilities.map((facility) =>
            api.getOccupancy(facility.id).catch(() => ({
              members: 0,
              families: 0,
              maxCapacity: facility.maxCapacity,
            })),
          ),
        );

        if (cancelled) return;

        const rows = facilities.map((facility, index) => ({
          ...facility,
          occupancy: occupancies[index],
        }));

        setStats({
          rows,
          facilities: facilities.length,
          available: facilities.filter((f) => f.status === "AVAILABLE").length,
          unavailable: facilities.filter((f) => f.status === "UNAVAILABLE").length,
          capacity: facilities.reduce((sum, f) => sum + f.maxCapacity, 0),
          occupants: occupancies.reduce((sum, o) => sum + o.members, 0),
          families: occupancies.reduce((sum, o) => sum + o.families, 0),
          staffTotal: staffs.length,
          staffActive: staffs.filter((s) => s.isActive).length,
          staffUnassigned: staffs.filter((s) => !s.facility).length,
        });
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  const networkPct =
    stats && stats.capacity > 0 ? Math.round((stats.occupants / stats.capacity) * 100) : 0;

  return (
    <div>
      {/* Hero: title + quick actions (spec §7 buttons) */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-ink">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            How your evacuation center network is doing right now
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/facilities"
            className={`inline-flex items-center gap-2 rounded-clay-sm bg-surface px-4 py-3 text-sm font-semibold text-ink-soft shadow-clay-xs transition hover:text-accent hover:shadow-clay ${FOCUS_RING}`}
          >
            <Building2 size={15} strokeWidth={1.9} /> Manage facilities
          </Link>
          <Link
            to="/staff"
            className={`inline-flex items-center gap-2 rounded-clay-sm bg-accent px-4 py-3 text-sm font-semibold text-white shadow-clay-accent transition hover:bg-accent-strong ${FOCUS_RING}`}
          >
            <UserPlus size={15} strokeWidth={1.9} /> Create staff account
          </Link>
        </div>
      </header>

      {error && (
        <StatusPanel tone="error" title="Could not load the overview" onRetry={retry}>
          {error.message}
        </StatusPanel>
      )}

      {!error && !stats && (
        <StatusPanel title="Loading overview…">
          Fetching facilities, occupancy and staff from the EvaRoute API.
        </StatusPanel>
      )}

      {stats && stats.facilities === 0 && (
        <div className="rounded-clay bg-surface p-8 text-center shadow-clay">
          <EmptyArt variant="map" className="mx-auto h-20 w-36" />
          <p className="mt-4 text-lg font-semibold text-ink">No facilities yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Register your first evacuation center to start tracking occupancy and resources.
          </p>
          <Link
            to="/facilities"
            className={`mt-5 inline-flex items-center gap-2 rounded-clay-sm bg-accent px-4 py-3 text-sm font-semibold text-white shadow-clay-accent transition hover:bg-accent-strong ${FOCUS_RING}`}
          >
            <Building2 size={15} strokeWidth={1.9} /> Go to facilities
          </Link>
        </div>
      )}

      {stats && stats.facilities > 0 && (
        <div className="space-y-6">
          {/* Statistic cards (spec §7) */}
          <section aria-label="Network summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Building2 size={19} strokeWidth={1.8} />}
              label="Facilities"
              value={stats.facilities}
              caption={`${stats.available} available · ${stats.unavailable} unavailable`}
            />
            <StatCard
              icon={<Gauge size={19} strokeWidth={1.8} />}
              label="Checked in now"
              value={stats.occupants}
              caption={`of ${stats.capacity} places · ${stats.families} families`}
            />
            <StatCard
              icon={<UserCheck size={19} strokeWidth={1.8} />}
              label="Staff active"
              value={stats.staffActive}
              caption={`of ${stats.staffTotal} accounts`}
            />
            <StatCard
              icon={<Users size={19} strokeWidth={1.8} />}
              tone={stats.staffUnassigned > 0 ? "warning" : "accent"}
              label="Unassigned staff"
              value={stats.staffUnassigned}
              caption={stats.staffUnassigned === 0 ? "Everyone has a facility" : "Needs assignment"}
            />
          </section>

          {/* Network capacity — color paired with a status label (spec §4) */}
          <Section
            title="Network capacity"
            meta={
              <>
                {stats.occupants} of {stats.capacity} places occupied
                {stats.capacity > 0 && ` · ${networkPct}%`}
              </>
            }
            action={
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  capacityState(networkPct).className
                }`}
              >
                {capacityState(networkPct).label}
              </span>
            }
          >
            <OccupancyBar members={stats.occupants} capacity={stats.capacity} className="h-3" />
          </Section>

          {/* Per-facility occupancy strip */}
          <Section title="Facilities" meta="Occupancy, families and staffing per evacuation center">
            <ul className="space-y-2">
              {stats.rows.map((row) => {
                const pct =
                  row.maxCapacity > 0
                    ? Math.min(100, Math.round((row.occupancy.members / row.maxCapacity) * 100))
                    : 0;
                return (
                  <li key={row.id}>
                    <Link
                      to={`/facilities/${row.id}`}
                      className={`block rounded-clay-sm px-3 py-3 transition hover:bg-sunken ${FOCUS_RING}`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                          {row.name}
                        </p>
                        <StatusBadge status={row.status} />
                        <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-sm font-medium text-ink-soft">
                          {row.occupancy.members}/{row.maxCapacity}
                        </span>
                        <p className="shrink-0 text-sm text-muted">
                          {row.occupancy.families} families · {row.staffCount ?? 0} staff
                        </p>
                      </div>
                      <div className="mt-2.5">
                        <OccupancyBar members={row.occupancy.members} capacity={row.maxCapacity} />
                        <span className="sr-only">{pct}% occupied</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Activity summary metrics (accurate counts from /activity/stats) */}
          <Section
            title="Activity — last 7 days"
            meta={
              activityStats.loading
                ? "Loading…"
                : `${activityStats.total} recorded ${activityStats.total === 1 ? "event" : "events"}`
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                label="Check-ins"
                value={activityStats.byAction.STAY_CHECKED_IN ?? 0}
                caption="Families housed"
              />
              <MiniStat
                label="Check-outs"
                value={activityStats.byAction.STAY_CHECKED_OUT ?? 0}
                caption="Families departed"
              />
              <MiniStat
                label="Resource edits"
                value={
                  (activityStats.byAction.RESOURCE_CREATED ?? 0) +
                  (activityStats.byAction.RESOURCE_UPDATED ?? 0) +
                  (activityStats.byAction.RESOURCE_DELETED ?? 0)
                }
                caption="Added, changed, removed"
              />
              <MiniStat
                label="Staff actions"
                value={Object.entries(activityStats.byAction)
                  .filter(([action]) => action.startsWith("STAFF_"))
                  .reduce((sum, [, count]) => sum + count, 0)}
                caption="Accounts & assignments"
              />
            </div>
          </Section>

          {/* Recent activity */}
          <Section
            title="Recent activity"
            action={
              <Link
                to="/history"
                className={`inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-strong ${FOCUS_RING}`}
              >
                View full history →
              </Link>
            }
          >
            <div className="overflow-hidden rounded-clay-sm border border-line">
              <ActivityFeed
                query={{}}
                limit={6}
                showFacility
                compact
                emptyTitle="Nothing recorded yet"
                emptyDetail="Check-ins, resource changes and account actions will appear here as they happen."
              />
            </div>
          </Section>

          {/* Staff pulse */}
          <Section
            title="Staff"
            meta="Facility staff accounts across the network"
            action={
              <Link
                to="/staff"
                className={`inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-strong ${FOCUS_RING}`}
              >
                Manage staff accounts →
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Total" value={stats.staffTotal} />
              <MiniStat label="Active" value={stats.staffActive} />
              <MiniStat label="Inactive" value={stats.staffTotal - stats.staffActive} />
              <MiniStat label="Unassigned" value={stats.staffUnassigned} />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
