/**
 * useRouteFeed — loads the route to the selected facility during route
 * preview, and clears it when the user drops back to an earlier screen.
 *
 * Returns null from the service on failure — callers treat that as
 * "route unavailable", which the RoutePreviewCard already renders.
 */
import { useEffect } from 'react';
import { getRouteToFacility } from '../../services/routing';

const CLEAR_ROUTE_STATUSES = ['discovery', 'center_selected', 'location_ready', 'initializing'];

export function useRouteFeed(state, dispatch, position, geoDenied) {
  const { status, facility } = state;

  useEffect(() => {
    if (status === 'route_preview' && position && facility && !geoDenied) {
      dispatch({ type: 'set', patch: { routeLoading: true } });
      getRouteToFacility(
        facility.id,
        position.coords.longitude,
        position.coords.latitude,
      ).then((r) => {
        dispatch({ type: 'set', patch: { routeData: r, routeLoading: false } });
      });
    } else if (CLEAR_ROUTE_STATUSES.includes(status)) {
      dispatch({ type: 'set', patch: { routeData: null, routeLoading: false } });
    }
  }, [status, position, facility, geoDenied, dispatch]);
}
