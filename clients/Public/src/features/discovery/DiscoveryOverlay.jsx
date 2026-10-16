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

export default function DiscoveryOverlay({
  facilities,
  sortedFacilities,
  totalFacilities,
  recenterSlot,
}) {
  const { state, actions } = useAppState();

  const renderCollapsed = () => (
    <button
      type="button"
      className="discovery-collapsed-toggle flex flex-col items-center w-full py-3"
      onClick={actions.expand}
      aria-label="Expand list"
    >
      {/* Pill button with a chevron inside, matching the sheet-handle language
          used by facility detail, route preview and navigation. */}
      <span className="discovery-collapsed-handle" aria-hidden="true">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
        </svg>
      </span>
      <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)] truncate mt-2">
        Nearby Evacuation Centers
      </h2>
    </button>
  );

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
          collapsedContent={renderCollapsed()}
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
          {!state.facilitiesLoading &&
            !state.facilitiesError &&
            sortedFacilities.length === 0 &&
            state.searchRadiusKm === null && (
              <div className="facility-expand-search">
                <p className="facility-expand-search-text">
                  No centers found within the default 10 km radius.
                </p>
                <button
                  type="button"
                  className="facility-expand-search-button"
                  onClick={actions.expandSearchRadius}
                >
                  Search up to 200 km
                </button>
              </div>
            )}
        </OverlayContainer>
      ) : (
        renderCollapsed()
      )}
    </>
  );
}
