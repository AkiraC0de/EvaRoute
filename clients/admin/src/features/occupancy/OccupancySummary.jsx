import { Home, Baby, Users } from "lucide-react";
import StatTile from "../../components/ui/StatTile";

/**
 * Occupancy summary — the three supporting metrics beside the occupancy
 * meter. Capacity, seats remaining and the occupancy % live in the meter
 * card itself; the people count is split by age group here instead.
 */
const OccupancySummary = ({ occupancy }) => (
  <section aria-label="Occupancy summary" className="grid grid-cols-1 gap-2">
    <StatTile label="Households" value={occupancy.families} icon={<Home size={13} strokeWidth={1.9} />} />
    <StatTile label="Children" value={occupancy.children} icon={<Baby size={13} strokeWidth={1.9} />} />
    <StatTile label="Adults" value={occupancy.adults} icon={<Users size={13} strokeWidth={1.9} />} />
  </section>
);

export default OccupancySummary;
