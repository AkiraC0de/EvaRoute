import { FACILITY_STATUS_META, type FacilityStatus } from '../../types/facility';

interface CenterStatusBadgeProps {
  status: FacilityStatus;
  /** Show "Limited availability" instead of "Limited" */
  fullLabel?: boolean;
  className?: string;
}

export default function CenterStatusBadge({
  status,
  fullLabel = false,
  className = '',
}: CenterStatusBadgeProps) {
  const statusMeta = FACILITY_STATUS_META[status];

  return (
    <span
      className={`facility-status-badge ${className}`}
      style={{
        backgroundColor: statusMeta.background,
        color: statusMeta.color,
      }}
    >
      <span className="facility-status-dot" style={{ backgroundColor: statusMeta.color }} aria-hidden="true" />
      {fullLabel ? statusMeta.fullLabel : statusMeta.label}
    </span>
  );
}
