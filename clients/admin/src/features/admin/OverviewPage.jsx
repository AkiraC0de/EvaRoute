import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatTile from "../../components/ui/StatTile";
import StatusPanel from "../../components/ui/StatusPanel";
import * as api from "../../lib/api";

/**
 * Admin overview — network health at a glance, composed from existing
 * endpoints only (GET /facility, GET /staff, per-facility stay/occupancy).
 * No aggregate endpoint exists yet, so occupancy is summed client-side;
 * fine at the current number of facilities (see the plan's gap list).
 */
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

        setStats({
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
      <PageHeader
        title="Overview"
        subtitle="How your evacuation center network is doing right now"
      />

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
        <StatusPanel tone="empty" title="No facilities yet">
          Register your first evacuation center to start tracking occupancy and resources.
        </StatusPanel>
      )}

      {stats && stats.facilities > 0 && (
        <>
          <section aria-label="Network summary" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Facilities" value={stats.facilities} />
            <StatTile label="Available" value={stats.available} />
            <StatTile label="Unavailable" value={stats.unavailable} />
            <StatTile label="Total capacity" value={stats.capacity} />
          </section>

          <section aria-label="Evacuees" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Checked in now" value={stats.occupants} />
            <StatTile label="Families" value={stats.families} />
            <StatTile label="Staff active" value={stats.staffActive} />
            <StatTile label="Staff unassigned" value={stats.staffUnassigned} />
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { to: "/facilities", title: "Facilities", caption: "Register, edit and restore centers" },
              { to: "/staff", title: "Staff accounts", caption: `${stats.staffTotal} accounts managed` },
              { to: "/occupancy", title: "Occupancy", caption: "Check evacuees in and out" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)] transition hover:shadow-[0_10px_26px_rgba(40,60,100,0.14)]"
              >
                <p className="text-[11px] font-bold text-[#35405e]">{link.title}</p>
                <p className="mt-1 text-[9px] text-[#8290aa]">{link.caption}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
