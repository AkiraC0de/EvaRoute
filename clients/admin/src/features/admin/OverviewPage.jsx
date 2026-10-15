import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Gauge, UserCheck, UserPlus, Users } from "lucide-react";
import EmptyArt from "../../components/ui/EmptyArt";
import StatTile from "../../components/ui/StatTile";
import StatusPanel from "../../components/ui/StatusPanel";
import * as api from "../../lib/api";

/**
 * Admin overview — network health at a glance, composed from existing
 * endpoints only (GET /facility, GET /staff, per-facility stay/occupancy).
 * No aggregate endpoint exists yet, so occupancy is summed client-side;
 * fine at the current number of facilities (see the plan's gap list).
 *
 * Hierarchy: hero + quick actions -> KPI cards -> network capacity bar ->
 * per-facility occupancy strip -> staff pulse. Every number shown here is
 * computed from live API data; nothing is decorative.
 */

const KpiCard = ({ icon, label, value, caption }) => (
  <div className="rounded-clay bg-surface p-4 shadow-clay">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.8px] text-muted">{label}</p>
        <p className="mt-1 text-[22px] font-bold leading-none text-ink">{value}</p>
        {caption && <p className="mt-1.5 text-[9px] text-muted">{caption}</p>}
      </div>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent shadow-clay-inset"
      >
        {icon}
      </span>
    </div>
  </div>
);

const OccupancyBar = ({ members, capacity, className = "h-2" }) => {
  const pct = capacity > 0 ? Math.min(100, Math.round((members / capacity) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={members}
      className={`w-full overflow-hidden rounded-full bg-[#edf0f6] shadow-clay-inset ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] ${
          pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-[#f0b642]" : "bg-accent"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

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

  return (
    <div>
      {/* Hero: title + quick actions */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold leading-tight text-ink">Overview</h1>
          <p className="mt-1 text-[11px] text-muted">
            How your evacuation center network is doing right now
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-1.5 rounded-clay-sm bg-surface px-3.5 py-2 text-[10px] font-semibold text-[#65718c] shadow-clay-xs transition hover:text-accent hover:shadow-clay"
          >
            <Building2 size={13} strokeWidth={1.9} /> Manage facilities
          </Link>
          <Link
            to="/staff"
            className="inline-flex items-center gap-1.5 rounded-clay-sm bg-accent px-3.5 py-2 text-[10px] font-semibold text-white shadow-clay-accent transition hover:bg-accent-strong"
          >
            <UserPlus size={13} strokeWidth={1.9} /> Create staff account
          </Link>
        </div>
      </div>

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
          <p className="mt-3 text-[13px] font-bold text-ink-soft">No facilities yet</p>
          <p className="mt-1 text-[10px] text-muted">
            Register your first evacuation center to start tracking occupancy and resources.
          </p>
          <Link
            to="/facilities"
            className="mt-4 inline-flex items-center gap-1.5 rounded-clay-sm bg-accent px-4 py-2 text-[10px] font-semibold text-white shadow-clay-accent transition hover:bg-accent-strong"
          >
            <Building2 size={13} strokeWidth={1.9} /> Go to facilities
          </Link>
        </div>
      )}

      {stats && stats.facilities > 0 && (
        <>
          {/* KPI cards */}
          <section aria-label="Network summary" className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Building2 size={17} strokeWidth={1.8} />}
              label="Facilities"
              value={stats.facilities}
              caption={`${stats.available} available · ${stats.unavailable} unavailable`}
            />
            <KpiCard
              icon={<Gauge size={17} strokeWidth={1.8} />}
              label="Checked in now"
              value={stats.occupants}
              caption={`of ${stats.capacity} places · ${stats.families} families`}
            />
            <KpiCard
              icon={<UserCheck size={17} strokeWidth={1.8} />}
              label="Staff active"
              value={stats.staffActive}
              caption={`of ${stats.staffTotal} accounts`}
            />
            <KpiCard
              icon={<Users size={17} strokeWidth={1.8} />}
              label="Unassigned staff"
              value={stats.staffUnassigned}
              caption={stats.staffUnassigned === 0 ? "Everyone has a facility" : "Needs assignment"}
            />
          </section>

          {/* Network capacity */}
          <section aria-label="Network capacity" className="mb-4 rounded-clay bg-surface p-4 shadow-clay">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="text-[11px] font-bold text-ink-soft">Network capacity</h2>
              <p className="text-[9px] text-muted">
                {stats.occupants} of {stats.capacity} places occupied
                {stats.capacity > 0 &&
                  ` · ${Math.round((stats.occupants / stats.capacity) * 100)}%`}
              </p>
            </div>
            <OccupancyBar members={stats.occupants} capacity={stats.capacity} className="h-3" />
          </section>

          {/* Per-facility occupancy strip */}
          <section aria-label="Facility occupancy" className="mb-4 rounded-clay bg-surface p-4 shadow-clay">
            <h2 className="mb-3 text-[11px] font-bold text-ink-soft">Facilities</h2>
            <ul className="space-y-2.5">
              {stats.rows.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/facilities/${row.id}`}
                    className="block rounded-clay-sm px-2 py-2 transition hover:bg-sunken"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            row.status === "AVAILABLE" ? "bg-success" : "bg-[#e5a83c]"
                          }`}
                        />
                        <p className="truncate text-[10px] font-semibold text-ink-soft">{row.name}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[8px] font-semibold text-muted shadow-clay-inset">
                        {row.occupancy.members}/{row.maxCapacity}
                      </span>
                      <p className="shrink-0 text-[9px] text-muted">
                        {row.occupancy.families} families · {row.staffCount ?? 0} staff
                      </p>
                    </div>
                    <div className="mt-1.5">
                      <OccupancyBar members={row.occupancy.members} capacity={row.maxCapacity} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Staff pulse */}
          <section aria-label="Staff summary" className="rounded-clay bg-surface p-4 shadow-clay">
            <h2 className="mb-3 text-[11px] font-bold text-ink-soft">Staff</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile label="Total" value={stats.staffTotal} />
              <StatTile label="Active" value={stats.staffActive} />
              <StatTile label="Inactive" value={stats.staffTotal - stats.staffActive} />
              <StatTile label="Unassigned" value={stats.staffUnassigned} />
            </div>
            <Link
              to="/staff"
              className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-semibold text-accent transition hover:text-accent-strong"
            >
              Manage staff accounts →
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
