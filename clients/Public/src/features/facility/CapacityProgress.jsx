function fmt(n) {
    return n >= 1000 ? n.toLocaleString() : String(n);
}
export default function CapacityProgress({ current, max, className = '', showLabel = true, showSlotsLeft = false, showPercentage = false, }) {
    const fill = current != null && current > 0 ? Math.min((current / max) * 100, 100) : 0;
    const empty = current == null || current === 0;
    const slotsLeft = current != null ? max - current : undefined;
    const pct = current != null && !empty ? Math.round((current / max) * 100) : undefined;
    return (<div className={`capacity-progress inline-flex flex-col gap-1 ${className}`}>
      <div className="inset-track w-full h-2.5 rounded-full overflow-hidden" style={{ flex: 0 }}>
        {!empty && (<div className="h-full rounded-full" style={{
                width: `${fill}%`,
                backgroundColor: 'var(--color-primary)',
            }}/>)}
      </div>
      {showLabel && (<span className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
          {empty ? (<>{fmt(max)} spaces</>) : (<>
              {fmt(current)} / {fmt(max)}
              {showPercentage && pct != null && <> · {pct}% Occupancy</>}
            </>)}
        </span>)}
      {showSlotsLeft && slotsLeft != null && slotsLeft > 0 && (<span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
          {slotsLeft.toLocaleString()} slots left
        </span>)}
    </div>);
}
