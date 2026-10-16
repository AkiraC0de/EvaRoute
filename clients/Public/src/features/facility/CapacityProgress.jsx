function fmt(n) {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

export default function CapacityProgress({
  current,
  max,
  className = '',
  showLabel = true,
  showSlotsLeft = false,
  showPercentage = false,
}) {
  const fill = current != null && current > 0 ? Math.min((current / max) * 100, 100) : 0;
  const empty = current == null || current === 0;
  const slotsLeft = current != null ? max - current : undefined;
  const pct = current != null && !empty ? Math.round((current / max) * 100) : undefined;

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset" style={{ flex: 0 }}>
        {!empty && <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${fill}%` }} />}
      </div>
      {showLabel && (
        <span className="text-[11px] text-muted">
          {empty ? (
            <>{fmt(max)} spaces</>
          ) : (
            <>
              {fmt(current)} / {fmt(max)}
              {showPercentage && pct != null && <> · {pct}% Occupancy</>}
            </>
          )}
        </span>
      )}
      {showSlotsLeft && slotsLeft != null && slotsLeft > 0 && (
        <span className="text-[11px] font-semibold text-ink">{slotsLeft.toLocaleString()} slots left</span>
      )}
    </div>
  );
}
