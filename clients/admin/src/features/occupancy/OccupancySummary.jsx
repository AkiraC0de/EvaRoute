import { Building2, Home, Percent, Users } from "lucide-react";
import StatTile from "../../components/ui/StatTile";
import { occupancyPct } from "./occupancyUtils";

/**
 * Occupancy summary cards — the operational numbers staff need first.
 * People (members) and households are displayed as separate metrics so the
 * two are never confused. Reuses the shared StatTile.
 */
const OccupancySummary = ({ occupancy }) => {
  const pct = occupancyPct(occupancy.members, occupancy.maxCapacity);

  return (
    <section
      aria-label="Occupancy summary"
      className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
    >
      <StatTile
        label="People in facility"
        value={occupancy.members}
        icon={<Users size={13} strokeWidth={1.9} />}
      />
      <StatTile label="Households" value={occupancy.families} icon={<Home size={13} strokeWidth={1.9} />} />
      <StatTile
        label="Total capacity"
        value={occupancy.maxCapacity}
        icon={<Building2 size={13} strokeWidth={1.9} />}
      />
      <StatTile label="Seats remaining" value={occupancy.remaining} />
      <StatTile label="Occupancy" value={`${pct}%`} icon={<Percent size={13} strokeWidth={1.9} />} />
    </section>
  );
};

export default OccupancySummary;
