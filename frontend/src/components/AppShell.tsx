import { type ReactNode } from 'react';

/**
 * AppShell — the root layout container for EvaRoute.
 *
 * Establishes the full-viewport, overlay-based architecture:
 * - A map area (absolute, full viewport, lowest z-index)
 * - An overlay area (absolute, full viewport, higher z-index, pointer-events: none)
 *   Overlay children re-enable pointer events individually.
 *
 * The map is always the background. Overlays appear on top based on state.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="evaroute-shell">
      {/* Map area — always present, behind all overlays */}
      <div className="map-area">
        {/* Map provider placeholder — to be replaced with actual map */}
        <div className="w-full h-full bg-[var(--surface-base)] flex items-center justify-center">
          <span className="text-sm text-[var(--color-text-caption)]">
            Map area — map provider integration deferred
          </span>
        </div>
      </div>

      {/* Overlay area — overlays render here, on top of the map */}
      <div className="overlay-area">
        {children}
      </div>
    </div>
  );
}
