/** 
 * useGeolocation — Hook for browser geolocation.
 * 
 * Requests the user's location via the Geolocation API.
 * Handles permission denial and errors gracefully.
 * 
 * Returns:
 * - position: GeolocationPosition | null — available when granted
 * - loading: boolean — true while requesting
 * - error: string | null — error message if request fails
 * - denied: boolean — true if permission was denied
 * - requestLocation: () => void — re-trigger a geolocation request
 */

import { useState, useCallback } from 'react';

const DEFAULT_CENTER: [number, number] = [14.5964, 120.9736]; // Manila

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setLoading(false);
        setError(null);
        setDenied(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setDenied(true);
            setError('Location access was denied.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('The request to get your location timed out.');
            break;
          default:
            setError('An unknown location error occurred.');
            break;
        }
      },
      options,
    );
  }, []);

  return { position, loading, error, denied, defaultCenter: DEFAULT_CENTER, requestLocation };
}

export { DEFAULT_CENTER };
