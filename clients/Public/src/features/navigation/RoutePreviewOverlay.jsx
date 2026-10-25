/**
 * RoutePreviewOverlay — route summary before starting (frames 06–07).
 *
 * Expanded shows the full RoutePreviewCard; collapsed shows the compact
 * distance/time row with the shared grip and a Cancel action.
 */
import { useAppState } from '../../contexts/AppStateContext';
import OverlayContainer from '../../components/OverlayContainer';
import DragHandle from '../../components/ui/DragHandle';
import RoutePreviewCard from './RoutePreviewCard';

export default function RoutePreviewOverlay() {
  const { state, actions } = useAppState();
  const { facility, routeData, routeLoading, routeError } = state;
  if (!facility) return null;

  const renderCollapsed = () => {
    if (!routeData || routeData.distance === 0) {
      return (
        <div className="flex w-full flex-col items-center gap-1">
          <button
            className="flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
            onClick={actions.expand}
            aria-label="Show route details"
          >
            <DragHandle />
          </button>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">Route Preview</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex w-full flex-col items-center gap-1">
        <button
          className="flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
          onClick={actions.expand}
          aria-label="Show route details"
        >
          <DragHandle />
        </button>

        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--color-accent)', opacity: 0.12 }}
            >
              <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink">
                {(routeData.distance / 1000).toFixed(1)} km · {Math.round(routeData.duration / 60)} min
              </div>
              <div className="truncate text-[11px] text-muted-dim">to {facility.name}</div>
            </div>
          </div>
          <button
            className="motion-safe-transform min-h-12 shrink-0 whitespace-nowrap rounded-full bg-sunken px-6 text-[11px] font-medium text-muted transition hover:text-ink touch-manipulation"
            onClick={actions.cancelRoutePreview}
          >
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
        routeError={routeError}
        onRetry={actions.retryRoute}
        currentOccupancy={undefined}
        onCancel={actions.cancelRoutePreview}
        onStartNavigation={actions.startNavigation}
      />
    </OverlayContainer>
  );
}
