/**
 * SplashFlow — the app's entry screen (frames 01–02).
 *
 * A failed automatic request keeps the user on the splash, where they can
 * retry or explicitly continue without location — a failure is a question for
 * the user to answer, not something to silently skip past.
 */
import { useAppState } from '../../contexts/AppStateContext';
import SplashScreen from './SplashScreen';

export default function SplashFlow() {
  const {
    state,
    position,
    geoLoading,
    geoDenied,
    geoError,
    geoPermissionBlocked,
    requestLocation,
    actions,
  } = useAppState();

  const locationFailed =
    !state.locationSkipped &&
    position == null &&
    !geoLoading &&
    (geoDenied || geoError != null);

  return (
    <SplashScreen
      locationReady={position != null}
      ready={state.status === 'location_ready'}
      locationFailed={locationFailed}
      locationErrorMessage={geoError}
      permissionBlocked={geoPermissionBlocked}
      retrying={geoLoading}
      onRetryLocation={requestLocation}
      onContinueWithoutLocation={actions.continueWithoutLocation}
    />
  );
}
