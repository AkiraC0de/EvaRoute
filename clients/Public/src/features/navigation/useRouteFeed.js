/**
 * useRouteFeed — loads the route to the selected facility during route
 * preview, and clears it when the user drops back to an earlier screen.
 *
 * Returns null from the service when no route exists — the RoutePreviewCard
 * renders that as "route unavailable". Failures (timeout, network, server
 * error envelope) land in `routeError` with a retry hook (routeRetryToken)
 * instead of leaving the spinner running forever.
 *
 * The fetch keys on the screen + facility — NOT on `position` — so GPS
 * jitter never re-triggers it, and a `cancelled` flag drops late responses
 * that would otherwise resurrect a stale route after the user has already
 * left route_preview (the useFacilitiesFeed pattern).
 */
import { useEffect, useRef } from 'react';
import { getRouteToFacility } from '../../services/routing';

const CLEAR_ROUTE_STATUSES = ['discovery', 'center_selected', 'location_ready', 'initializing'];

export function useRouteFeed(state, dispatch, position, geoDenied) {
  const { status, facility, routeRetryToken } = state;
  const facilityId = facility ? facility.id : null;
  const hasPosition = position != null;

  // Latest fix, read at fetch time — the effect keys on screen + facility.
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    const pos = positionRef.current;
    if (status === 'route_preview' && pos && facilityId && !geoDenied) {
      let cancelled = false;
      dispatch({ type: 'set', patch: { routeLoading: true, routeError: null } });
      getRouteToFacility(
        facilityId,
        pos.coords.longitude,
        pos.coords.latitude,
      )
        .then((r) => {
          if (cancelled) return;
          dispatch({ type: 'set', patch: { routeData: r, routeLoading: false } });
        })
        .catch((err) => {
          if (cancelled) return;
          dispatch({
            type: 'set',
            patch: {
              routeData: null,
              routeLoading: false,
              routeError:
                err instanceof Error ? err.message : 'Failed to calculate the route.',
            },
          });
        });
      return () => {
        cancelled = true;
      };
    }
    if (CLEAR_ROUTE_STATUSES.includes(status)) {
      dispatch({
        type: 'set',
        patch: { routeData: null, routeLoading: false, routeError: null },
      });
    } else if (status === 'route_preview') {
      // Previewing but no fetch is possible (no fix / denied) — never leave
      // the "Calculating…" spinner running.
      dispatch({ type: 'set', patch: { routeLoading: false } });
    }
    return undefined;
  }, [status, facilityId, hasPosition, geoDenied, routeRetryToken, dispatch]);
}
