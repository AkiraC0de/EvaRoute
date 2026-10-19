/**
 * DiscoveryOverlay — the map screen's list + search/filter (frames 03–04).
 *
 * Renders the search/filter overlay, then the bottom sheet: expanded list
 * ("Nearby Evacuation Centers") or the collapsed handle bar.
 */
import { useAppState } from '../../contexts/AppStateContext';
import FacilityDiscoveryPanel from './FacilityDiscoveryPanel';
import FacilitySearchFilterOverlay from './FacilitySearchFilterOverlay';
import OverlayContainer from '../../components/OverlayContainer';

function CollapsedToggle({ onClick }) {
  return (
    <button
      type="button"
      className="focus-ring flex w-full flex-col items-center gap-1 border-0 bg-transparent py-2.5 touch-manipulation"
      onClick={onClick}
      aria-label="Expand list"
    >
      {/* Grip pill with a chevron inside — same handle language as the other
          sheets (facility detail, route preview, navigation). */}
      <span
        className="flex h-5 w-14 items-center justify-center rounded-full bg-surface text-muted shadow-clay-xs"
        aria-hidden="true"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
        </svg>
      </span>
      <h2 className="mt-1 truncate text-[15px] font-semibold text-ink">Nearby Evacuation Centers</h2>
    </button>
  );
}

/** Map-first open pill (mobile): floats over the map while the discovery
 *  sheet is closed — the map is fully visible first; the pill opens the
 *  nearby-centers list. ≥44px touch target. */
function OpenListPill({ onClick }) {
  return (
    <button
      type="button"
      className="focus-ring flex items-center gap-2 rounded-full bg-surface py-2.5 pr-4 pl-3 shadow-clay-lg touch-manipulation"
      onClick={onClick}
      aria-label="Open nearby evacuation centers"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
        {/* Map pin — same stroke language as the app's inline icons */}
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[14px] font-semibold text-ink">Nearby Evacuation Centers</span>
      <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
      </svg>
    </button>
  );
}

export default function DiscoveryOverlay({ facilities, sortedFacilities, totalFacilities, recenterSlot }) {
  const { state, actions } = useAppState();

  return (
    <>
      {/* Search/filter + recenter overlay — all screen sizes */}
      <FacilitySearchFilterOverlay
        query={state.searchQuery}
        facilities={facilities}
        statusFilter={state.statusFilter}
        onQueryChange={actions.setSearch}
        onStatusFilterChange={actions.setStatusFilter}
        recenterSlot={recenterSlot}
      />
      {state.sheetExpanded ? (
        <OverlayContainer
          variant="panel"
          expanded={true}
          mobileExpanded={state.mobilePanelExpanded}
          onMobileToggle={actions.toggleMobilePanel}
          collapsedContent={<CollapsedToggle onClick={actions.expand} />}
          mobileClosedPill={<OpenListPill onClick={actions.expand} />}
        >
          <FacilityDiscoveryPanel
            facilities={sortedFacilities}
            totalFacilities={totalFacilities}
            onSelect={actions.selectCenter}
            loading={state.facilitiesLoading}
            error={state.facilitiesError}
            searchRadiusKm={state.searchRadiusKm}
            onExpandSearch={actions.expandSearchRadius}
          />
        </OverlayContainer>
      ) : (
        <CollapsedToggle onClick={actions.expand} />
      )}
    </>
  );
}
