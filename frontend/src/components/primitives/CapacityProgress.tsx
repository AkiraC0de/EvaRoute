import { type ReactNode } from 'react';

/**
 * CapacityProgress — inset-track progress bar with "current / max" label.
 *
 * Reflects the Figma design: inner-shadow track, solid fill proportional
 * to current occupancy, and a text label ("1,203 / 5,000").
 *
 * When `current` is undefined/null, the track stays inset (empty) and the
 * label shows only the max capacity — honest for when occupancy data isn't
 * available from the backend yet.
 */
interface CapacityProgressProps {
  current?: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

function fmt(n: number) {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

export default function CapacityProgress({
  current,
  max,
  className = '',
  showLabel = true,
}: CapacityProgressProps) {
  const fill = current != null && current > 0 ? Math.min((current / max) * 100, 100) : 0;
  const empty = current == null || current === 0;

  return (
    <div className={`capacity-progress inline-flex flex-col gap-1 ${className}`}>
      <div
        className="inset-track w-full h-2.5 rounded-full overflow-hidden"
        style={{ flex: 0 }}
      >
        {!empty && (
          <div
            className="h-full rounded-full"
            style={{
              width: `${fill}%`,
              backgroundColor: 'var(--color-primary)',
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
          {empty ? (
            <>{fmt(max)} spaces</>
          ) : (
            <>{fmt(current)} / {fmt(max)}</>
          )}
        </span>
      )}
    </div>
  );
}
