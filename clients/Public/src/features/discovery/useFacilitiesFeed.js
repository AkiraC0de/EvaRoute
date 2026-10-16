/**
 * useFacilitiesFeed — loads evacuation centers from the public API.
 *
 * GET /api/v1/public/facility requires fromLong/fromLat, so the request is
 * deferred until geolocation has settled (granted OR denied). On denial we
 * fall back to DEFAULT_CENTER — the same fallback the map already uses — so
 * discovery still works without a GPS fix.
 *
 * Re-runs when the resolved center changes, so a late-arriving GPS fix
 * replaces the fallback-center results.
 */
import { useEffect } from 'react';
import { fetchPublicFacilities } from '../../services/facility';
import { DEFAULT_CENTER } from '../../lib/constants';

export function useFacilitiesFeed(state, dispatch, position, geoDenied, geoLoading) {
  const queryLongitude = position && !geoDenied ? position.coords.longitude : DEFAULT_CENTER[1];
  const queryLatitude = position && !geoDenied ? position.coords.latitude : DEFAULT_CENTER[0];
  const searchRadiusKm = state.searchRadiusKm;

  useEffect(() => {
    // Wait for geolocation to settle before querying.
    if (geoLoading) return;

    let cancelled = false;
    dispatch({ type: 'set', patch: { facilitiesLoading: true } });

    fetchPublicFacilities({
      longitude: queryLongitude,
      latitude: queryLatitude,
      distanceKm: searchRadiusKm ?? undefined,
    })
      .then((data) => {
        if (cancelled) return;
        // Always replace the placeholder, including with an empty list, so
        // the real (possibly empty) backend state is what the UI reflects.
        dispatch({ type: 'set', patch: { facilities: data, facilitiesError: null } });
      })
      .catch((err) => {
        if (cancelled) return;
        // Do NOT fall back to mock data on failure — surface the error
        // instead of showing stale placeholder facilities as if they were real.
        dispatch({
          type: 'set',
          patch: {
            facilities: [],
            facilitiesError:
              err instanceof Error ? err.message : 'Failed to load evacuation centers.',
          },
        });
      })
      .finally(() => {
        if (cancelled) return;
        dispatch({ type: 'set', patch: { facilitiesLoading: false } });
      });

    return () => {
      cancelled = true;
    };
  }, [queryLongitude, queryLatitude, geoLoading, searchRadiusKm, dispatch]);
}
