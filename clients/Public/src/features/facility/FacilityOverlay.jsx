/**
 * FacilityOverlay — the selected center's detail sheet (frame 05).
 *
 * Shows the facility detail sidebar expanded, or a compact collapsed summary
 * (name, address, status, capacity) in one tap target with the drag handle.
 */
import { useAppState } from '../../contexts/AppStateContext';
import { haversineKm } from '../../lib/geo';
import { formatCount } from '../../lib/format';
import OverlayContainer from '../../components/OverlayContainer';
import DragHandle from '../../components/ui/DragHandle';
import CenterStatusBadge from './CenterStatusBadge';
import FacilityDetailSidebar from './FacilityDetailSidebar';

export default function FacilityOverlay() {
  const {
    state,
    position,
    geoLoading,
    geoPermissionBlocked,
    hasRealLocation,
    actions,
  } = useAppState();
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
      className="facility-detail-overlay"
      collapsedContent={
        // One tap target holds the drag handle and the summary together, so the
        // handle stays attached to the sheet it collapses. The handle is a
        // sibling above the text rather than an overlay, so nothing overlaps.
        <button
          type="button"
          className="facility-detail-collapsed-summary"
          onClick={actions.expand}
          aria-label="Show details"
        >
          <span className="facility-detail-collapsed-handle" aria-hidden="true">
            <DragHandle />
          </span>
          <span className="facility-detail-collapsed-name">{facility.name}</span>
          <span className="facility-detail-collapsed-address">{facility.address}</span>
          <span className="facility-detail-collapsed-status">
            <CenterStatusBadge status={facility.status} fullLabel />
            <span className="facility-detail-collapsed-capacity">
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
