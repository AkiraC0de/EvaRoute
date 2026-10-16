/**
 * useNavigationTracking — live position tracking while navigating.
 *
 * - watchPosition feeds the user's live position and remaining distance
 * - the current turn step always follows the closest route step (the old
 *   code's distance guard compared kilometres to metres and never fired,
 *   so "snap to nearest step" is the behaviour being preserved — made
 *   intentional here instead of accidental)
 * - arriving within ARRIVAL_THRESHOLD_M of the center advances to `arrived`
 */
import { useEffect } from 'react';
import { haversineKm } from '../../lib/geo';
import { ARRIVAL_THRESHOLD_M } from '../../lib/constants';

export function useNavigationTracking(state, dispatch) {
  const { status, facility, routeData } = state;

  useEffect(() => {
    if (status !== 'navigating' || !facility) {
      if (status !== 'arrived') {
        dispatch({
          type: 'set',
          patch: { navUserPosition: null, navRemainingKm: null, navStepIndex: 0 },
        });
      }
      return;
    }
    if (!navigator.geolocation) return;

    const steps = routeData?.legs?.flatMap((l) => l.steps) ?? [];
    const targetLat = facility.latitude;
    const targetLon = facility.longitude;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const remaining = haversineKm(latitude, longitude, targetLat, targetLon);

        // Always follow the closest route step (see header note).
        let navStepIndex;
        if (steps.length > 0) {
          let closestIdx = 0;
          let closestDist = Infinity;
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (!step.location || step.location.length < 2) continue;
            const d = haversineKm(latitude, longitude, step.location[1], step.location[0]);
            if (d < closestDist) {
              closestDist = d;
              closestIdx = i;
            }
          }
          navStepIndex = closestIdx;
        }

        dispatch({
          type: 'set',
          patch: {
            navUserPosition: { latitude, longitude },
            navRemainingKm: remaining,
            ...(navStepIndex != null ? { navStepIndex } : {}),
          },
        });

        if (remaining * 1000 < ARRIVAL_THRESHOLD_M) {
          dispatch({ type: 'goto', to: 'arrived' });
        }
      },
      (err) => console.warn('Navigation tracking error:', err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [status, facility, routeData, dispatch]);
}
