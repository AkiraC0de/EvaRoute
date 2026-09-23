import AppShell from './components/AppShell';
import { useAppState } from './state/useAppState';

/**
 * EvaRoute — Main application component.
 *
 * Renders the app shell and the current state's overlay content.
 * The state machine drives which overlays are visible.
 *
 * The map is always present as the background.
 * Overlays change based on the current EvaRouteState.
 */
export default function App() {
  const { state, transition } = useAppState();

  return (
    <AppShell>
      {/* ── Initializing state ── */}
      {state.status === 'initializing' && (
        <div className="flex flex-col items-center justify-center gap-6 p-6 animate-fade-in">
          {/* Logo placeholder — actual logo asset TBD from Figma */}
          <div className="clay-card flex items-center justify-center w-20 h-20">
            <svg
              className="w-10 h-10 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75h-9"
              />
            </svg>
          </div>

          <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-primary)] tracking-tight">
            EvaRoute
          </h1>
          <p className="text-[var(--font-size-base)] text-[var(--color-text-secondary)]">
            Your Route to Safety
          </p>

          {/* Loading checklist */}
          <div className="clay-card w-full max-w-xs p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="inset-track w-6 h-6 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6m0 0l6-6m-6 6v-11.25" />
                </svg>
              </div>
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                Getting your location
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="inset-track w-6 h-6 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6m0 0l6-6m-6 6v-11.25" />
                </svg>
              </div>
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                Finding nearby centers
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="inset-track w-6 h-6 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6m0 0l6-6m-6 6v-11.25" />
                </svg>
              </div>
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                Loading map tiles…
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-caption)] uppercase tracking-wider">
            Prototype v0.9 · Works offline
          </p>
        </div>
      )}

      {/* ── Location ready state ── */}
      {state.status === 'location_ready' && (
        <div className="flex flex-col items-center justify-center gap-6 p-6 animate-fade-in">
          <div className="clay-card flex items-center justify-center w-20 h-20">
            <svg
              className="w-10 h-10 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15.75v.008"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75h-9"
              />
            </svg>
          </div>

          <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-primary)] tracking-tight">
            EvaRoute
          </h1>
          <p className="text-[var(--font-size-base)] text-[var(--color-text-secondary)]">
            Your Route to Safety
          </p>

          <button
            className="clay-button clay-button-primary"
            onClick={() => transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' })}
          >
            View Nearby Centers
          </button>

          <p className="text-xs text-[var(--color-text-caption)] uppercase tracking-wider">
            Prototype v0.9 · Works offline
          </p>
        </div>
      )}

      {/* ── Discovery state (placeholder) ── */}
      {state.status === 'discovery' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div className="clay-card p-4">
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
              Nearby Evacuation Centers
            </h2>
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-1">
              {state.sheetExpanded
                ? 'List expanded — showing centers'
                : 'List collapsed — tap to expand'}
            </p>
          </div>
          <button
            className="clay-button clay-button-secondary w-full"
            onClick={() => transition({ status: 'discovery', sheetExpanded: !state.sheetExpanded, searchQuery: state.searchQuery })}
          >
            {state.sheetExpanded ? 'Collapse' : 'Expand'} List
          </button>
        </div>
      )}

      {/* ── Center selected state (placeholder) ── */}
      {state.status === 'center_selected' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div className="clay-card p-4 max-w-md">
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
              {state.facility.name}
            </h2>
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-1">
              {state.facility.address}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: state.facility.status === 'AVAILABLE'
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
                  color: 'white',
                }}
              >
                {state.facility.status === 'AVAILABLE' ? 'Safe' : 'Caution'}
              </span>
              <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Max capacity: {state.facility.maxCapacity}
              </span>
            </div>
          </div>
          <button
            className="clay-button clay-button-primary w-full"
            onClick={() => transition({ status: 'route_preview', centerId: state.centerId, sheetExpanded: true })}
          >
            Get Route
          </button>
          <button
            className="clay-button clay-button-secondary w-full"
            onClick={() => transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' })}
          >
            Back to List
          </button>
        </div>
      )}

      {/* ── Route preview state (placeholder) ── */}
      {state.status === 'route_preview' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div className="clay-card p-4 max-w-md">
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
              Route Preview
            </h2>
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-1">
              {state.sheetExpanded
                ? 'Route summary expanded'
                : 'Route summary collapsed'}
            </p>
            <div className="mt-3 flex items-center gap-4 text-[var(--font-size-sm)]">
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.00 9.00 0 100-18 9.00 9.00 0 000 18z" />
                </svg>
                3.2 km
              </span>
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                15 min
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="clay-button clay-button-primary flex-1"
              onClick={() => transition({ status: 'navigating', centerId: state.centerId, sheetExpanded: true })}
            >
              Start Navigation
            </button>
            <button
              className="clay-button clay-button-secondary flex-1"
              onClick={() => transition({ status: 'center_selected', centerId: state.centerId, sheetExpanded: true, facility: { id: state.centerId, name: 'Center', address: '', maxCapacity: 0, status: 'AVAILABLE', latitude: 0, longitude: 0 } })}
            >
              Cancel
            </button>
          </div>
          <button
            className="clay-button clay-button-secondary w-full"
            onClick={() => transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' })}
          >
            Back to Discovery
          </button>
        </div>
      )}

      {/* ── Navigating state (placeholder) ── */}
      {state.status === 'navigating' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          {/* Turn-by-turn pill (top center) */}
          <div className="clay-card px-4 py-2 text-center text-sm font-medium text-[var(--color-text-primary)] max-w-xs mx-auto">
            <span>Head north on Main St →</span>
          </div>
          <div className="clay-card p-4 max-w-md">
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)]">
              Navigation
            </h2>
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-1">
              {state.sheetExpanded
                ? 'Progress expanded'
                : 'Progress collapsed'}
            </p>
          </div>
          <button
            className="clay-button clay-button-secondary w-full"
            onClick={() => transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' })}
          >
            Cancel Navigation
          </button>
        </div>
      )}

      {/* ── Arrived state (placeholder) ── */}
      {state.status === 'arrived' && (
        <div className="flex flex-col items-center justify-center gap-6 p-6 animate-fade-in relative">
          {/* Dimmed overlay backdrop */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            style={{ zIndex: 'var(--z-modal)' }}
          />

          <div className="clay-card clay-card-centered p-8 text-center max-w-sm w-full relative">
            {/* Success checkmark */}
            <div className="w-16 h-16 rounded-full bg-[var(--color-success)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6m0 0l6-6m-6 6v-11.25" />
              </svg>
            </div>

            <h2 className="text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
              You have arrived
            </h2>
            <p className="text-[var(--font-size-base)] text-[var(--color-text-secondary)] mt-2">
              You've reached your evacuation center safely.
            </p>

            <button
              className="clay-button clay-button-primary mt-6 w-full"
              onClick={() => transition({ status: 'discovery', sheetExpanded: true, searchQuery: '' })}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
