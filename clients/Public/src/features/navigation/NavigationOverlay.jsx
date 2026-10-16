/**
 * NavigationOverlay — live turn-by-turn navigation (frames 08–09).
 *
 * A floating TurnInstruction card sits above the route-card sheet, which
 * collapses to the remaining-distance summary.
 */
import { useAppState } from '../../contexts/AppStateContext';
import OverlayContainer from '../../components/OverlayContainer';
import DragHandle from '../../components/ui/DragHandle';
import RoutePreviewCard from './RoutePreviewCard';
import TurnInstruction from './TurnInstruction';

export default function NavigationOverlay() {
  const { state, actions } = useAppState();
  const { facility, routeData, navStepIndex, navRemainingKm } = state;
  if (!facility) return null;

  const steps = routeData?.legs?.flatMap((l) => l.steps) ?? [];
  const currentStep = steps[navStepIndex];
  const instruction = currentStep?.text ?? 'Following route';

  const renderCollapsed = () => (
    <div className="route-preview-collapsed">
      {/* Shared DragHandle pill, matching the facility-detail and collapsed
          route-preview grips. */}
      <button
        className="route-preview-collapsed-chevron"
        onClick={actions.expand}
        aria-label="Show navigation details"
      >
        <DragHandle />
      </button>

      <div className="route-preview-collapsed-row">
        <div className="route-preview-collapsed-info">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse shrink-0" />
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate">
              {navRemainingKm != null ? `${navRemainingKm.toFixed(1)} km remaining` : 'Navigating'}
            </div>
            <div className="text-[var(--font-size-xs)] text-[var(--color-text-caption)] truncate">
              {facility.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TurnInstruction
        instruction={instruction}
        distance={navRemainingKm != null ? parseFloat(navRemainingKm.toFixed(1)) : undefined}
      />
      <OverlayContainer
        variant="route-card"
        expanded={state.sheetExpanded}
        mobileExpanded={state.mobilePanelExpanded}
        onMobileToggle={actions.toggleMobilePanel}
        className="navigation-overlay"
        collapsedContent={renderCollapsed()}
      >
        <RoutePreviewCard
          facility={facility}
          routeData={routeData}
          routeLoading={false}
          isNavigating
          onCancel={actions.cancelNavigation}
        />
      </OverlayContainer>
    </>
  );
}
