import { LEGEND_ITEMS } from "./statusColors";

/** Marker-color legend for facility maps — a small white bordered chip. */
const MapLegend = () => (
  <div className="pointer-events-none absolute right-2 top-2 z-[500] rounded-md border border-line bg-surface px-2.5 py-2 shadow-xs">
    <p className="text-[9px] font-semibold uppercase tracking-[0.8px] text-muted">Status</p>
    <ul className="mt-1 flex flex-col gap-1">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.status} className="flex items-center gap-1.5">
          <span className={`map-marker ${item.markerClass} h-2.5 w-2.5 border-2`} aria-hidden="true" />
          <span className="text-[10px] font-medium text-ink-soft">{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default MapLegend;
