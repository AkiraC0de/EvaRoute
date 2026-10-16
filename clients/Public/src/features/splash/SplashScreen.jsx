import { useEffect, useRef, useState } from 'react';
import ClaymorphicCard from '../../components/ui/ClaymorphicCard';

/** Progress floor while waiting on the user to grant location permission. */
const WAITING_FOR_LOCATION = 55;
/** Where the bar settles once the location arrives but the app is still loading. */
const LOCATION_ACQUIRED = 72;
/** How long the one-shot fulfilment flourish is held before it settles. */
const FULFILLED_FLASH_MS = 720;

function ProgressBar({ filled }) {
  return (
    <div
      className="h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-sunken shadow-clay-inset"
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Width IS the real progress; the travelling highlight is clipped
          inside it, so the bar never reads as more full than it is. */}
      <div
        className="relative h-full overflow-hidden rounded-full bg-accent shadow-[0_0_10px_rgba(74,114,255,0.35)] transition-[width] duration-[1400ms] ease-out motion-reduce:duration-200"
        style={{ width: `${filled}%` }}
      >
        <div
          className="absolute inset-0 animate-[splash-sheen_2400ms_ease-in-out_infinite] bg-[linear-gradient(100deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0)_100%)] motion-reduce:animate-none"
          style={{ transform: 'translateX(-100%)' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function SpinnerIcon({ className }) {
  // Clean circular arc spinner — reads as "in progress" at any size.
  return (
    <svg className={className ?? 'h-3.5 w-3.5 animate-spin'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" d="M12 3a9 9 0 1 1-6.36 2.64" />
    </svg>
  );
}

const RADIO_STATE = {
  complete: 'bg-[rgba(47,169,104,0.18)] text-success shadow-[inset_0_0_0_1px_rgba(47,169,104,0.25)]',
  spinning: 'bg-[rgba(74,114,255,0.16)] text-accent shadow-[inset_0_0_0_1px_rgba(74,114,255,0.22)]',
  unavailable: 'bg-[rgba(229,72,77,0.14)] text-danger shadow-[inset_0_0_0_1px_rgba(229,72,77,0.22)]',
  pending: 'bg-[rgba(27,42,68,0.08)] text-muted-dim shadow-[inset_0_0_0_1px_rgba(27,42,68,0.06)]',
};

/**
 * A single requirement row.
 *
 * `fulfilled` is the real confirmed state from the caller — nothing here
 * infers success. `flash` is set by the parent for the pass following a
 * genuine false → true transition, so the flourish plays on real change only.
 */
function ChecklistItem({ label, fulfilled, spinning, unavailable, flash, delay = 0 }) {
  const stateClass = fulfilled ? 'complete' : unavailable ? 'unavailable' : spinning ? 'spinning' : 'pending';

  return (
    <div className="flex items-center gap-2 animate-fade-in [animation-delay:var(--delay)] motion-reduce:animate-none" style={{ '--delay': `${delay}ms` }}>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition duration-300 ${RADIO_STATE[stateClass]} ${flash ? 'animate-[splash-fulfil-pop_720ms_ease-out_1] motion-reduce:animate-none' : ''}`}
        aria-hidden="true"
      >
        {fulfilled && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
          </svg>
        )}
        {spinning && !fulfilled && <SpinnerIcon className="h-3.5 w-3.5" />}
        {unavailable && !fulfilled && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
            <circle cx="12" cy="12" r="6.5" />
            <path strokeLinecap="round" d="M7.8 16.2l8.4-8.4" />
          </svg>
        )}
        {!fulfilled && !spinning && !unavailable && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <circle cx="12" cy="12" r="6.5" strokeOpacity={0.5} />
          </svg>
        )}
      </div>
      <span className="text-[15px] font-medium leading-tight text-ink">{label}</span>
    </div>
  );
}

/**
 * Tracks a boolean requirement and reports the window following a genuine
 * false → true flip, so the fulfilment flourish plays once and never on
 * unrelated re-renders.
 */
function useFulfilmentFlash(fulfilled) {
  const previous = useRef(fulfilled);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const was = previous.current;
    previous.current = fulfilled;
    if (!fulfilled || was) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), FULFILLED_FLASH_MS);
    return () => clearTimeout(t);
  }, [fulfilled]);

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
}) {
  const [progress, setProgress] = useState(0);

  // Animate 0 → WAITING_FOR_LOCATION once on mount, then hold there.
  useEffect(() => {
    if (locationReady) {
      setProgress(LOCATION_ACQUIRED);
      return;
    }
    const frame = requestAnimationFrame(() => setProgress(WAITING_FOR_LOCATION));
    return () => cancelAnimationFrame(frame);
  }, [locationReady, ready]);

  // Real confirmed states only. A denied location stays unfulfilled —
  // skipping location explicitly does NOT confirm GPS.
  const locationFulfilled = locationReady;
  const centresFulfilled = ready;
  const tilesFulfilled = ready;
  const allFulfilled = locationFulfilled && centresFulfilled && tilesFulfilled;
  const locationFlash = useFulfilmentFlash(locationFulfilled);
  const centresFlash = useFulfilmentFlash(centresFulfilled);
  const tilesFlash = useFulfilmentFlash(tilesFulfilled);

  const recoveryMessage = permissionBlocked
    ? 'Location permission is blocked for this site. To use your real location, allow location access in your browser\u2019s site settings, then try again.'
    : (locationErrorMessage ?? 'We could not determine your location.');

  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 overflow-y-auto bg-canvas px-4 py-12 [justify-content:safe_center] motion-reduce:gap-4 sm:gap-12">
      {/* Logo */}
      <div className="flex w-full items-center justify-center" aria-hidden="true">
        <img
          src="/evaRouteLogo.png"
          alt="EvaRoute Logo"
          className="block h-[200px] w-[200px] object-contain mix-blend-multiply [@media(max-height:720px)]:h-[132px] [@media(max-height:720px)]:w-[132px]"
        />
      </div>

      {/* Branding */}
      <div className="text-center">
        <h1 className="text-[28px] font-bold leading-tight text-accent">EvaRoute</h1>
        <p className="mt-1 text-[15px] font-medium text-muted">Your Route to Safety!</p>
      </div>

      <ProgressBar filled={progress} />

      {/* Single splash card: requirements, and — only when location actually
          failed — the recovery actions inside the same surface. */}
      <ClaymorphicCard
        padding="lg"
        className={`w-full max-w-[340px] !p-4 !px-4 !py-6 ${allFulfilled ? 'animate-[splash-card-fulfil_900ms_ease-out_1] motion-reduce:animate-none' : ''}`}
      >
        <div className="flex flex-col gap-2">
          <ChecklistItem
            label={locationFailed ? 'Location unavailable' : 'Getting your location'}
            fulfilled={locationFulfilled}
            spinning={!locationReady && !ready && !locationFailed}
            unavailable={locationFailed}
            flash={locationFlash}
            delay={40}
          />
          <ChecklistItem label="Finding nearby centers" fulfilled={centresFulfilled} spinning={!ready} unavailable={false} flash={centresFlash} delay={90} />
          <ChecklistItem label="Loading map tiles…" fulfilled={tilesFulfilled} spinning={!ready} unavailable={false} flash={tilesFlash} delay={140} />
        </div>

        {/* Recovery wrapper is ALWAYS mounted and collapses via grid rows
            (0fr → 1fr); unmounting it would make the exit untransitionable. */}
        <div
          className={`grid transition-[grid-template-rows] duration-[340ms] ease-out motion-reduce:duration-200 ${locationFailed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          aria-hidden={!locationFailed}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`mt-4 border-t border-line pt-4 text-center transition duration-300 ${locationFailed ? 'translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0'}`}
            >
              <p className="mb-2 text-[11px] leading-relaxed text-muted" role="status">
                {recoveryMessage}
              </p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="motion-safe-transform min-h-11 w-full rounded-full bg-accent px-4 py-2 text-[11px] font-semibold text-white shadow-[0_2px_6px_rgba(74,114,255,0.3),inset_2px_2px_6px_rgba(255,255,255,0.25)] transition hover:bg-accent-strong disabled:opacity-60"
                  onClick={onRetryLocation}
                  disabled={retrying}
                >
                  {retrying ? 'Locating\u2026' : 'Use My Location'}
                </button>
                <button
                  type="button"
                  className="min-h-11 w-full rounded-full bg-surface px-4 py-2 text-[11px] font-semibold text-muted shadow-clay-xs transition hover:text-ink active:shadow-clay-inset"
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
