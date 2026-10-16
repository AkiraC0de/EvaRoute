import CenterStatusBadge from '../facility/CenterStatusBadge';

/** Clock time after `durationSeconds` from now ("1:25 AM"). */
function formatArrivalTime(durationSeconds) {
  return new Date(Date.now() + durationSeconds * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatIcon({ type }) {
  if (type === 'time') {
    return (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 3.5" />
      </svg>
    );
  }
  if (type === 'arrival') {
    return (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18c3 0 3-12 8-12s5 12 8 12" />
    </svg>
  );
}

/**
 * RoutePreviewCard — route summary (before or during navigation).
 *
 * Values are computed ONLY from the route the server returned; without a
 * route every figure renders as "—" rather than a guess.
 */
export default function RoutePreviewCard({
  facility,
  routeData,
  routeLoading,
  currentOccupancy,
  onCancel,
  onStartNavigation,
  isNavigating = false,
}) {
  const hasRoute = routeData != null && routeData.distance > 0;
  const distance = hasRoute ? `${(routeData.distance / 1000).toFixed(1)} km` : '—';
  const eta = hasRoute ? `${Math.max(1, Math.round(routeData.duration / 60))} min` : '—';
  const arrival = hasRoute ? formatArrivalTime(routeData.duration) : '—';

  return (
    <div className="animate-fade-scale flex w-full flex-col gap-4 rounded-clay bg-surface p-4 shadow-clay">
      {/* Destination */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold leading-tight tracking-tight text-ink">{facility.name}</h2>
          <p className="mt-1 break-words text-[11px] capitalize leading-snug text-muted">{facility.address}</p>
        </div>
        <CenterStatusBadge status={facility.status} fullLabel />
      </div>

      {/* Capacity — a flat caption row, not a boxed well */}
      <div className="flex items-center justify-between gap-2 border-t border-line pt-1 text-[11px] text-muted">
        <span>Maximum capacity</span>
        <strong className="text-right font-semibold text-ink">{facility.maxCapacity.toLocaleString()} spaces</strong>
      </div>
      {currentOccupancy != null && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
          <span>Currently checked in</span>
          <strong className="text-right font-semibold text-ink">{currentOccupancy.toLocaleString()}</strong>
        </div>
      )}

      {/* Stats — accent-tinted chips; the value is the payload */}
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
        <div className="flex min-w-0 flex-col items-center gap-[3px] rounded-clay-sm bg-accent-soft px-1 py-2 text-center text-accent shadow-clay-xs">
          <StatIcon type="distance" />
          <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
            Distance
          </span>
          <strong className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold tabular-nums tracking-tight text-ink">
            {distance}
          </strong>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-[3px] rounded-clay-sm bg-accent-soft px-1 py-2 text-center text-accent shadow-clay-xs">
          <StatIcon type="time" />
          <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
            Duration
          </span>
          <strong className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold tabular-nums tracking-tight text-ink">
            {eta}
          </strong>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-[3px] rounded-clay-sm bg-accent-soft px-1 py-2 text-center text-accent shadow-clay-xs">
          <StatIcon type="arrival" />
          <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
            Arrival
          </span>
          <strong className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold tabular-nums tracking-tight text-ink">
            {arrival}
          </strong>
        </div>
      </div>

      {/* Route states */}
      {routeLoading && (
        <div className="flex min-h-[76px] items-center justify-center gap-2 rounded-clay-sm bg-sunken px-4 text-center text-[13px] text-muted shadow-clay-inset">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" d="M12 3a9 9 0 1 1-6.36 2.64" />
          </svg>
          <span>Calculating the best route…</span>
        </div>
      )}
      {!routeLoading && !hasRoute && (
        <div className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-clay-sm bg-sunken px-4 py-4 text-center shadow-clay-inset">
          <p className="text-[13px] font-semibold text-ink">Route unavailable</p>
          <span className="text-[11px] text-muted-dim">
            We could not find a route from your location. You can still head there on your own.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className={`grid gap-2 pt-1 ${isNavigating ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {!isNavigating && (
          <button
            type="button"
            className="motion-safe-transform min-h-12 whitespace-nowrap rounded-full bg-surface px-6 py-2.5 text-[15px] font-semibold text-muted shadow-clay-xs transition hover:bg-sunken hover:text-ink active:shadow-clay-inset"
            onClick={onCancel}
          >
            Cancel Route
          </button>
        )}
        {!isNavigating && (
          <button
            type="button"
            className="motion-safe-transform min-h-12 whitespace-nowrap rounded-full bg-accent px-6 py-2.5 text-[15px] font-semibold text-white shadow-clay-xs transition hover:-translate-y-px hover:bg-accent-strong hover:shadow-clay active:translate-y-0"
            onClick={onStartNavigation}
          >
            Start Navigation
          </button>
        )}
        {isNavigating && (
          <button
            type="button"
            className="motion-safe-transform min-h-12 whitespace-nowrap rounded-full bg-surface px-6 py-2.5 text-[15px] font-semibold text-muted shadow-clay-xs transition hover:bg-sunken hover:text-ink active:shadow-clay-inset"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
