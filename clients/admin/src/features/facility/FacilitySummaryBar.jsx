import { Building2 } from "lucide-react";
import StatusPill from "../../components/ui/StatusPill";

/**
 * Facility identity bar: icon, name, capacity and availability pill.
 */
const FacilitySummaryBar = ({ facility, available }) => (
  <div className="mb-5 flex min-h-20.5 flex-wrap items-center gap-4 rounded-clay bg-surface px-5 py-4 shadow-clay">
    <div className="flex h-11 w-11 items-center justify-center rounded-clay-sm bg-accent-soft shadow-clay-inset">
      <Building2 size={20} strokeWidth={1.8} className="text-accent" />
    </div>

    <div>
      <h2 className="text-[15px] font-bold text-ink">{facility.name}</h2>
      <p className="text-[11px] text-muted">
        Capacity {facility.maxCapacity}
      </p>
    </div>

    <StatusPill tone={available ? "success" : "warning"}>
      <span className={`h-2 w-2 rounded-full ${available ? "bg-success" : "bg-[#e5a83c]"}`} />
      {available ? "Available" : "Unavailable"}
    </StatusPill>
  </div>
);

export default FacilitySummaryBar;
