/**
 * useFacilitiesFeed — loads evacuation centers from the public API.
 *
 * GET /api/v1/public/facility requires fromLong/fromLat, so the FIRST request
 * is deferred until geolocation has settled — a real fix or an explicit
 * denial. Failing either within GEO_SETTLE_TIMEOUT_MS (denied, unavailable,
 * or a slow fix), the feed falls back to DEFAULT_CENTER — the same fallback
 * the map already uses — so discovery never hangs on a GPS that never
 * answers. Until then nothing is fetched: users never see Manila-centered
 * results flash before their own.
 *
 * Re-runs when the resolved center changes, so a late-arriving GPS fix
 * replaces the fallback-center results.
 */
import { useEffect, useState } from 'react';
import { fetchPublicFacilities } from '../../services/facility';
import { DEFAULT_CENTER } from '../../lib/constants';

/** Bounded wait for the first geolocation result before falling back. */
const GEO_SETTLE_TIMEOUT_MS = 3500;

export function useFacilitiesFeed(state, dispatch, position, geoDenied) {
  const queryLongitude = position && !geoDenied ? position.coords.longitude : DEFAULT_CENTER[1];
  const queryLatitude = position && !geoDenied ? position.coords.latitude : DEFAULT_CENTER[0];
  const searchRadiusKm = state.searchRadiusKm;

  // Geolocation "settles" on the first fix or denial; the timeout covers
  // denied/unavailable/never-answering cases (useGeolocation's own request
  // can take up to 10 s — too long to block the whole feed on).
  const [geoFallbackReady, setGeoFallbackReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGeoFallbackReady(true), GEO_SETTLE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);
  const geoSettled = position != null || geoDenied || geoFallbackReady;

  useEffect(() => {
    // Wait for geolocation to settle before querying.
    if (!geoSettled) return;

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
  }, [queryLongitude, queryLatitude, geoSettled, searchRadiusKm, dispatch]);
}
