/**
 * FacilityOverlay — the selected center's detail sheet (frame 05).
 *
 * Expanded shows the FacilityDetailSidebar; collapsed shows a compact
 * summary (name, address, status, capacity) in one tap target with the grip.
 */
import { useAppState } from '../../contexts/AppStateContext';
import { haversineKm } from '../../lib/geo';
import { formatCount } from '../../lib/format';
import OverlayContainer from '../../components/OverlayContainer';
import DragHandle from '../../components/ui/DragHandle';
import CenterStatusBadge from './CenterStatusBadge';
import FacilityDetailSidebar from './FacilityDetailSidebar';

export default function FacilityOverlay() {
  const { state, position, geoLoading, geoPermissionBlocked, hasRealLocation, actions } = useAppState();
  const facility = state.facility;
  if (!facility) return null;

  // Live distance only with a genuine fix — never measured from DEFAULT_CENTER.
  let liveDistance;
  if (position && !geoLoading && hasRealLocation) {
    liveDistance = haversineKm(
      position.coords.latitude,
      position.coords.longitude,
      facility.latitude,
      facility.longitude,
    );
  }

  return (
    <OverlayContainer
      variant="panel"
      expanded={state.sheetExpanded}
      mobileExpanded={state.mobilePanelExpanded}
      onMobileToggle={actions.toggleMobilePanel}
      className="facility-detail-overlay no-scrollbar"
      collapsedContent={
        // One tap target holds the grip and the summary together, so the
        // handle stays attached to the sheet it collapses.
        <button
          type="button"
          className="flex w-full flex-col items-center gap-1 border-0 bg-transparent text-center touch-manipulation"
          onClick={actions.expand}
          aria-label="Show details"
        >
          <DragHandle className="mb-1 w-full" />
          <span className="block max-w-full truncate whitespace-nowrap text-[13px] font-semibold text-ink">
            {facility.name}
          </span>
          <span className="block max-w-full truncate whitespace-nowrap text-[11px] text-muted">
            {facility.address}
          </span>
          <span className="mt-1 flex flex-wrap items-center justify-center gap-1">
            <CenterStatusBadge status={facility.status} fullLabel />
            <span className="whitespace-nowrap text-[11px] font-medium text-muted">
              {formatCount(facility.maxCapacity)} spaces max
            </span>
          </span>
        </button>
      }
    >
      <FacilityDetailSidebar
        facility={facility}
        distance={liveDistance}
        currentOccupancy={undefined}
        resources={facility.resources}
        onBack={actions.backToDiscovery}
        onGetRoute={actions.getRoute}
        locationPrompt={
          state.routeAwaitingLocation && !hasRealLocation
            ? {
                requesting: geoLoading,
                // A blocked origin gets the site-settings wording; anything
                // else (unavailable/timeout) stays retryable.
                blocked: geoPermissionBlocked,
              }
            : null
        }
        onEnableLocation={actions.enableLocation}
      />
    </OverlayContainer>
  );
}
