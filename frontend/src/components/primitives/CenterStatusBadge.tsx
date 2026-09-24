import type { FacilityStatus } from '../../types/facility';

interface CenterStatusBadgeProps {
  status: FacilityStatus;
  className?: string;
}

export default function CenterStatusBadge({
  status,
  className = '',
}: CenterStatusBadgeProps) {
  const isSafe = status === 'AVAILABLE';
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`}
      style={{
        backgroundColor: isSafe ? 'var(--color-success)' : 'var(--color-warning)',
        color: 'white',
      }}
    >
      {isSafe ? 'Safe' : 'Caution'}
    </span>
  );
}
