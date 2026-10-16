/**
 * RoutePreviewOverlay — route summary before starting (frames 06–07).
 *
 * Expanded shows the full RoutePreviewCard; collapsed shows the compact
 * distance/time row with the shared drag handle and a Cancel action.
 */
import { useAppState } from '../../contexts/AppStateContext';
import OverlayContainer from '../../components/OverlayContainer';
import DragHandle from '../../components/ui/DragHandle';
import RoutePreviewCard from './RoutePreviewCard';

export default function RoutePreviewOverlay() {
  const { state, actions } = useAppState();
  const { facility, routeData, routeLoading } = state;
  if (!facility) return null;

  const renderCollapsed = () => {
    if (!routeData || routeData.distance === 0) {
      return (
        <div className="route-preview-collapsed">
          <button
            className="route-preview-collapsed-chevron"
            onClick={actions.expand}
            aria-label="Show route details"
          >
            <DragHandle />
          </button>
          <div className="route-preview-collapsed-row">
            <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
              Route Preview
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="route-preview-collapsed">
        {/* Reuses the shared DragHandle pill (same as the facility-detail sheet)
            so the control reads as a grip rather than an arrow. */}
        <button
          className="route-preview-collapsed-chevron"
          onClick={actions.expand}
          aria-label="Show route details"
        >
          <DragHandle />
        </button>

        <div className="route-preview-collapsed-row">
          <div className="route-preview-collapsed-info">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}
            >
              <svg
                className="w-5 h-5 text-[var(--color-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate">
                {(routeData.distance / 1000).toFixed(1)} km ·{' '}
                {Math.round(routeData.duration / 60)} min
              </div>
              <div className="text-[var(--font-size-xs)] text-[var(--color-text-caption)] truncate">
                to {facility.name}
              </div>
            </div>
          </div>
          <button className="route-preview-collapsed-cancel" onClick={actions.cancelRoutePreview}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <OverlayContainer
      variant="route-card"
      expanded={state.sheetExpanded}
      mobileExpanded={state.mobilePanelExpanded}
      onMobileToggle={actions.toggleMobilePanel}
      collapsedContent={renderCollapsed()}
    >
      <RoutePreviewCard
        facility={facility}
        routeData={routeData}
        routeLoading={routeLoading}
        currentOccupancy={undefined}
        onCancel={actions.cancelRoutePreview}
        onStartNavigation={actions.startNavigation}
      />
    </OverlayContainer>
  );
}
