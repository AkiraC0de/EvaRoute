import { Pencil } from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facility hero strip — the detail page's identity + live operational facts
 * in one band: status, address, occupancy meter (occupied/max + families),
 * essentials readiness (N of 3), and the Edit action. Every fact appears
 * once here; the sections below own their drill-downs.
 */
const FacilityHeroStrip = ({ facility, resources = [], occupancy, onEdit }) => {
  const essentials = resources.filter((row) => row.essentialType);
  const available = essentials.filter((row) => row.isAvailable).length;
  const occupied = occupancy?.occupied ?? 0;
  const pct =
    facility.maxCapacity > 0
      ? Math.min(100, Math.round((occupied / facility.maxCapacity) * 100))
      : 0;

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-bold text-ink">
              {displayPlaceName(facility.name)}
            </h2>
            <StatusPill status={facility.status} />
          </div>
          <p className="mt-1 truncate text-[11px] text-muted" title={facility.address}>
            {displayPlaceName(facility.address)}
          </p>
        </div>
        <Button size="sm" variant="neutral" onClick={onEdit} className="min-h-9">
          <Pencil size={12} strokeWidth={2} className="mr-1" /> Edit
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted">
              Occupancy
            </p>
            <p className="text-[11px] text-muted">
              <span className="font-semibold text-ink-soft">{occupied}</span>/
              {facility.maxCapacity} places ·{" "}
              <span className="font-semibold text-ink-soft">{occupancy?.families ?? 0}</span>{" "}
              families
            </p>
          </div>
          <div
            role="img"
            aria-label={`${pct} percent full`}
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted">
            Essentials
          </p>
          <p className="mt-1 text-[11px] text-muted">
            <span className="font-semibold text-ink-soft">{available}</span> of{" "}
            {essentials.length || 3} available
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1 sm:justify-end">
            {essentials.map((row) => (
              <span
                key={row.id ?? row.essentialType}
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  row.isAvailable
                    ? "bg-success-soft text-success"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {row.isAvailable ? "✓ " : "— "}
                {row.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FacilityHeroStrip;
