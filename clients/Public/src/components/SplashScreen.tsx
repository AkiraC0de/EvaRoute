import { useEffect, useRef, useState } from 'react';
import ClaymorphicCard from './primitives/ClaymorphicCard';

interface SplashScreenProps {
  /** Whether the user's location has been acquired (item 1 complete). */
  locationReady: boolean;
  /** Whether initialization is fully complete (items 2–3 complete). */
  ready: boolean;
  /** True once an automatic request has failed, so recovery actions are shown. */
  locationFailed: boolean;
  /** Message explaining the failure (denied / unavailable / timeout / unsupported). */
  locationErrorMessage: string | null;
  /** True when the browser reports the origin as blocked in site settings. */
  permissionBlocked: boolean;
  /** True while a retry request is in flight. */
  retrying: boolean;
  /** Retry via the existing geolocation request (may re-prompt the browser). */
  onRetryLocation: () => void;
  /** Explicit user choice to enter the app without real location. */
  onContinueWithoutLocation: () => void;
}

/** Progress floor while waiting on the user to grant location permission. */
const WAITING_FOR_LOCATION = 55;
/** Where the bar settles once the location arrives but the app is still loading. */
const LOCATION_ACQUIRED = 72;
/** How long the one-shot fulfilment flourish is held before it settles. */
const FULFILLED_FLASH_MS = 720;

function ProgressBar({ filled }: { filled: number }) {
  return (
    <div
      className="splash-progress-bar"
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Width is the real progress value; the travelling highlight is a
          pseudo-element clipped inside this fill, so the bar never reads as
          more full than it is. */}
      <div
        className="splash-progress-fill"
        style={{ width: `${filled}%` }}
      />
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'w-3 h-3 animate-spin'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2v20M12 2l2 2M12 2l-2 2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22a10 10 0 1 1 0-20"
        strokeOpacity={0.3}
      />
    </svg>
  );
}

/**
 * A single requirement row.
 *
 * `fulfilled` is the real confirmed state from the caller — nothing here infers
 * success. `flash` is set by the parent for ONE render pass when this row
 * genuinely transitions into that state, so the flourish plays on real change
 * only and never replays on re-render.
 */
function ChecklistItem({
  label,
  fulfilled,
  spinning,
  unavailable,
  flash,
}: {
  label: string;
  fulfilled: boolean;
  spinning: boolean;
  unavailable: boolean;
  flash: boolean;
}) {
  const stateClass = fulfilled
    ? 'complete'
    : unavailable
      ? 'unavailable'
      : spinning
        ? 'spinning'
        : '';

  return (
    <div className={`splash-checklist-item ${flash ? 'is-fulfilled' : ''}`}>
      <div
        className={`splash-checklist-radio ${stateClass}`}
        aria-hidden="true"
      >
        {fulfilled && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5l4 4L19 7"
            />
          </svg>
        )}
        {spinning && !fulfilled && <SpinnerIcon className="w-3 h-3" />}
        {unavailable && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.6}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        )}
      </div>
      <span className="splash-checklist-label">{label}</span>
    </div>
  );
}

/**
 * Tracks a boolean requirement and reports the single render pass in which it
 * flips false → true, so callers can play a one-shot animation that is tied to
 * a genuine state change (and never replays on unrelated re-renders).
 */
function useFulfilmentFlash(fulfilled: boolean) {
  const [flash, setFlash] = useState(false);
  const previous = useRef(fulfilled);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const was = previous.current;
    previous.current = fulfilled;

    // Only a genuine false → true transition counts.
    if (!fulfilled || was) return;

    setFlash(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(false), FULFILLED_FLASH_MS);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [fulfilled]);

  // Clear on unmount so no timer outlives the splash.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return flash;
}

export default function SplashScreen({
  locationReady,
  ready,
  locationFailed,
  locationErrorMessage,
  permissionBlocked,
  retrying,
  onRetryLocation,
  onContinueWithoutLocation,
}: SplashScreenProps) {
  // Animate 0 → WAITING_FOR_LOCATION once on mount, then hold there. The bar
  // reflects real app state rather than a loop: it stops at the "waiting on the
  // user" point because geolocation permission genuinely has not resolved yet,
  // and only jumps to 100% once `ready` is true.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (ready) {
      setProgress(100);
      return;
    }
    if (locationReady) {
      setProgress(LOCATION_ACQUIRED);
      return;
    }

    const frame = requestAnimationFrame(() => setProgress(WAITING_FOR_LOCATION));
    return () => cancelAnimationFrame(frame);
  }, [locationReady, ready]);

  // Real confirmed states only. A denied location stays unfulfilled — skipping
  // location explicitly does NOT confirm GPS.
  const locationFulfilled = locationReady;
  const centresFulfilled = ready;
  const tilesFulfilled = ready;
  const allFulfilled = locationFulfilled && centresFulfilled && tilesFulfilled;

  const locationFlash = useFulfilmentFlash(locationFulfilled);
  const centresFlash = useFulfilmentFlash(centresFulfilled);
  const tilesFlash = useFulfilmentFlash(tilesFulfilled);

  const recoveryMessage = permissionBlocked
    ? 'Location permission is blocked for this site. To use your real location, allow location access in your browser\u2019s site settings, then try again.'
    : locationErrorMessage ?? 'We could not determine your location.';

  return (
    <div className="splash-screen">
      {/* Logo illustration */}
      <div className="splash-illustration" aria-hidden="true">
        <img
          src="/evaRouteLogo.png"
          alt="EvaRoute Logo"
          className="splash-logo"
        />
      </div>

      {/* Branding */}
      <div className="splash-branding">
        <h1 className="splash-title">EvaRoute</h1>
        <p className="splash-subtitle">Your Route to Safety!</p>
      </div>

      {/* Progress bar */}
      <ProgressBar filled={progress} />

      {/* Single splash card: requirements, and — only when location actually
          failed — the recovery actions inside the same surface. */}
      <ClaymorphicCard
        className={`splash-checklist-card ${allFulfilled ? 'is-all-fulfilled' : ''}`}
      >
        <div className="splash-checklist">
          <ChecklistItem
            label={locationFailed ? 'Location unavailable' : 'Getting your location'}
            fulfilled={locationFulfilled}
            spinning={!locationReady && !ready && !locationFailed}
            unavailable={locationFailed}
            flash={locationFlash}
          />
          <ChecklistItem
            label="Finding nearby centers"
            fulfilled={centresFulfilled}
            spinning={!ready}
            unavailable={false}
            flash={centresFlash}
          />
          <ChecklistItem
            label="Loading map tiles…"
            fulfilled={tilesFulfilled}
            spinning={!ready}
            unavailable={false}
            flash={tilesFlash}
          />
        </div>

        {/*
          Recovery wrapper is ALWAYS mounted and collapses via
          `grid-template-rows: 0fr -> 1fr`. Conditionally unmounting it would
          make the exit impossible (display:none cannot be transitioned), and a
          `display: block/none` toggle cannot animate at all. Keeping it mounted
          lets the same element animate both directions, and the inner content
          is inert while collapsed.
        */}
        <div
          className={`splash-recovery-region ${locationFailed ? 'is-open' : ''}`}
          aria-hidden={!locationFailed}
        >
          <div className="splash-recovery-clip">
            <div className="splash-recovery">
              <p className="splash-recovery-message" role="status">
                {recoveryMessage}
              </p>
              <div className="splash-recovery-actions">
                <button
                  type="button"
                  className="splash-recovery-button splash-recovery-button-primary"
                  onClick={onRetryLocation}
                  disabled={retrying}
                >
                  {retrying ? 'Locating\u2026' : 'Use My Location'}
                </button>
                <button
                  type="button"
                  className="splash-recovery-button"
                  onClick={onContinueWithoutLocation}
                >
                  Continue Without Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </ClaymorphicCard>
    </div>
  );
}
