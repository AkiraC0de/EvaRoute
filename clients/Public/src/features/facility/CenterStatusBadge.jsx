import { getFacilityStatusMeta } from '../../lib/facilityMeta';

export default function CenterStatusBadge({ status, fullLabel = false, className = '' }) {
  // Fallback keeps an unexpected/legacy status visible as its own name
  // instead of crashing the card/detail on `undefined` meta (API-04).
  const statusMeta = getFacilityStatusMeta(status);
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-[5px] whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${className}`}
      style={{ backgroundColor: statusMeta.background, color: statusMeta.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: statusMeta.color }}
        aria-hidden="true"
      />
      {fullLabel ? statusMeta.fullLabel : statusMeta.label}
    </span>
  );
}
