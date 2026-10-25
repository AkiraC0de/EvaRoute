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
    <div className="flex w-full flex-col items-center gap-1">
      <button
        className="flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
        onClick={actions.expand}
        aria-label="Show navigation details"
      >
        <DragHandle />
      </button>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-success" />
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-accent)', opacity: 0.12 }}
          >
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-ink">
              {navRemainingKm != null ? `${navRemainingKm.toFixed(1)} km remaining` : 'Navigating'}
            </div>
            <div className="truncate text-[11px] text-muted-dim">{facility.name}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TurnInstruction
        instruction={instruction}
        maneuverType={currentStep?.maneuverType}
        // The step's OWN length (meters) — not navRemainingKm, which is the
        // remaining distance to the center and is already labeled "remaining"
        // in the collapsed summary below.
        distance={currentStep?.distance}
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
