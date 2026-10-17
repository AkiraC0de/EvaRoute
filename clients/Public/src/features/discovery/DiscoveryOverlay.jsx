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
