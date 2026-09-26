import type { OSRMRoute } from '../services/osrm';
import type { Facility } from '../types/facility';
import CenterStatusBadge from './primitives/CenterStatusBadge';
import PillButton from './primitives/PillButton';

interface RoutePreviewCardProps {
  facility: Facility;
  routeData: OSRMRoute | null;
  routeLoading: boolean;
  onCancel: () => void;
  onStartNavigation?: () => void;
  isNavigating?: boolean;
  /** Current occupancy for slots-left display (not yet available from backend). */
  currentOccupancy?: number;
}

function formatArrivalTime(durationSeconds: number) {
  const arrival = new Date(Date.now() + durationSeconds * 1000);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(arrival);
}

function StatIcon({ type }: { type: 'distance' | 'time' | 'arrival' }) {
  if (type === 'distance') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19l6-14 4 10 6-6" />
      </svg>
    );
  }

  if (type === 'time') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 7v5l3 2" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.2 6-11a6 6 0 10-12 0c0 5.8 6 11 6 11z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

export default function RoutePreviewCard({
  facility,
  routeData,
  routeLoading,
  onCancel,
  onStartNavigation,
  isNavigating = false,
  currentOccupancy,
}: RoutePreviewCardProps) {
  const hasRoute = routeData != null && routeData.distance > 0 && routeData.duration > 0;
  const distance = hasRoute ? `${(routeData.distance / 1000).toFixed(1)} km` : '—';
  const eta = hasRoute ? `${Math.max(1, Math.round(routeData.duration / 60))} min` : '—';
  const arrival = hasRoute ? formatArrivalTime(routeData.duration) : '—';

  return (
    <div className="route-preview-card" aria-live="polite">
      <div className="route-preview-handle" aria-hidden="true" />

      <div className="route-preview-destination">
        <div className="min-w-0">
          <p className="facility-discovery-kicker">{isNavigating ? 'Active navigation' : 'Route preview'}</p>
          <h2 className="route-preview-title">{facility.name}</h2>
          <p className="route-preview-address">{facility.address}</p>
        </div>
        <CenterStatusBadge status={facility.status} />
      </div>

      <div className="route-preview-capacity">
        <span>Maximum capacity</span>
        <strong>{facility.maxCapacity.toLocaleString()} spaces</strong>
      </div>

      {currentOccupancy != null && currentOccupancy > 0 && (
        <div className="route-preview-slots">
          <span className="route-preview-slots-label">{currentOccupancy.toLocaleString()} slots left</span>
        </div>
      )}

      {routeLoading ? (
        <div className="route-preview-loading">
          <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span>Calculating the best route…</span>
        </div>
      ) : hasRoute ? (
        <div className="route-preview-stats">
          <div className="route-preview-stat">
            <StatIcon type="distance" />
            <span>Distance</span>
            <strong>{distance}</strong>
          </div>
          <div className="route-preview-stat">
            <StatIcon type="time" />
            <span>ETA</span>
            <strong>{eta}</strong>
          </div>
          <div className="route-preview-stat">
            <StatIcon type="arrival" />
            <span>Arrival</span>
            <strong>{arrival}</strong>
          </div>
        </div>
      ) : (
        <div className="route-preview-unavailable">
          <p>Route information is unavailable right now.</p>
          <span>Choose another center or try again later.</span>
        </div>
      )}

      <div className={`route-preview-actions ${isNavigating || !hasRoute || routeLoading ? 'single' : ''}`}>
        <PillButton
          variant="secondary"
          className="w-full"
          onClick={onCancel}
        >
          Cancel Route
        </PillButton>
        {!isNavigating && hasRoute && !routeLoading && onStartNavigation && (
          <PillButton variant="primary" className="w-full" onClick={onStartNavigation}>
            Start Navigation
          </PillButton>
        )}
      </div>
    </div>
  );
}
