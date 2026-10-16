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
 * - denied: boolean — true only for PERMISSION_DENIED (code 1)
 * - permissionBlocked: boolean — true when the browser reports PERMISSION_DENIED
 *   and offers no further prompt, i.e. the origin is blocked in site settings
 * - requestLocation: () => void — re-trigger a geolocation request
 */
import { useState, useCallback } from 'react';
const DEFAULT_CENTER = [14.5964, 120.9736]; // Manila
/**
 * GeolocationPositionError codes.
 *
 * These are STATIC constants on the GeolocationPositionError constructor, not
 * instance properties — the earlier implementation compared against
 * `err.PERMISSION_DENIED` and friends, which are always `undefined`, so every
 * failure collapsed into the `default:` branch and `denied` never became true.
 * Compare the instance's numeric `code` against these constants instead.
 */
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;
export function useGeolocation() {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [denied, setDenied] = useState(false);
    const [permissionBlocked, setPermissionBlocked] = useState(false);
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        // Clear the blocked flag optimistically: a retry may well succeed now that
        // the user has visited their browser's site settings.
        setPermissionBlocked(false);
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
        };
        navigator.geolocation.getCurrentPosition((pos) => {
            setPosition(pos);
            setLoading(false);
            setError(null);
            setDenied(false);
            setPermissionBlocked(false);
        }, (err) => {
            setLoading(false);
            // Compare the numeric instance `code`, not `err.PERMISSION_DENIED`:
            // those constants live on the GeolocationPositionError constructor and
            // are undefined on the instance.
            switch (err?.code) {
                case PERMISSION_DENIED:
                    setDenied(true);
                    setError('Location access was denied.');
                    // Once an origin is blocked, browsers return PERMISSION_DENIED
                    // immediately without showing another prompt. A page cannot undo
                    // that, so flag it and let the UI explain the site-settings route
                    // instead of inviting an endless retry loop.
                    setPermissionBlocked(true);
                    break;
                case POSITION_UNAVAILABLE:
                    setError('Location information is unavailable.');
                    break;
                case TIMEOUT:
                    setError('The request to get your location timed out.');
                    break;
                default:
                    setError('An unknown location error occurred.');
                    break;
            }
        }, options);
    }, []);
    return {
        position,
        loading,
        error,
        denied,
        permissionBlocked,
        defaultCenter: DEFAULT_CENTER,
        requestLocation,
    };
}
export { DEFAULT_CENTER };
