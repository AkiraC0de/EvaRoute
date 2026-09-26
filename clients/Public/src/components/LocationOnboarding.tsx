import ClaymorphicCard from './primitives/ClaymorphicCard';
import PillButton from './primitives/PillButton';

interface LocationOnboardingProps {
  loading: boolean;
  denied: boolean;
  error: string | null;
  onRequestLocation: () => void;
}

function StepIcon({ complete, active }: { complete?: boolean; active?: boolean }) {
  return (
    <div className={`onboarding-step-icon ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}>
      {complete ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
        </svg>
      ) : active ? (
        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" aria-hidden="true" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-[var(--color-text-caption)]" aria-hidden="true" />
      )}
    </div>
  );
}

function BrandHeader({
  title,
  subtitle,
  variant = 'default',
}: {
  title: string;
  subtitle: string;
  variant?: 'default' | 'error' | 'success';
}) {
  return (
    <div className="onboarding-brand">
      <div className={`onboarding-illustration ${variant}`} aria-hidden="true">
        {variant === 'default' ? (
          <svg className="onboarding-map-icon" fill="none" viewBox="0 0 96 96" stroke="currentColor" strokeWidth={2}>
            <path d="M16 25l22-9 20 9 22-9v55l-22 9-20-9-22 9V25z" />
            <path d="M38 16v55M58 25v55" />
            <path d="M27 56c8-13 16-11 23-2 7 9 14 9 22-4" stroke="var(--color-primary)" strokeWidth={4} strokeLinecap="round" />
            <circle cx="27" cy="56" r="5" fill="var(--color-primary)" stroke="none" />
            <circle cx="72" cy="50" r="5" fill="var(--color-success)" stroke="none" />
          </svg>
        ) : variant === 'success' ? (
          <svg className="w-10 h-10 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.75h18.606L12 3 2.697 19.5z" />
            <path strokeLinecap="round" d="M12 16.5v.01" />
          </svg>
        )}
      </div>
      <p className="onboarding-eyebrow">EvaRoute</p>
      <h1 className="onboarding-title">{title}</h1>
      <p className="onboarding-subtitle">{subtitle}</p>
    </div>
  );
}

function MessageIcon({ variant = 'default' }: { variant?: 'default' | 'warning' | 'success' }) {
  if (variant === 'success') {
    return (
      <div className="onboarding-message-icon success" aria-hidden="true">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (variant === 'warning') {
    return (
      <div className="onboarding-message-icon warning" aria-hidden="true">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.75h18.606L12 3 2.697 19.5z" />
          <path strokeLinecap="round" d="M12 16.5v.01" />
        </svg>
      </div>
    );
  }

  return (
    <div className="onboarding-message-icon" aria-hidden="true">
      <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2.5" />
        <path strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2" />
      </svg>
    </div>
  );
}

function Step({ children, complete, active }: { children: string; complete?: boolean; active?: boolean }) {
  return (
    <div className="onboarding-step">
      <StepIcon complete={complete} active={active} />
      <span className={active ? 'active' : ''}>{children}</span>
    </div>
  );
}

export default function LocationOnboarding({
  loading,
  denied,
  error,
  onRequestLocation,
}: LocationOnboardingProps) {
  const showError = !loading && (denied || Boolean(error));

  if (showError) {
    return (
      <div className="onboarding-screen animate-fade-in">
        <BrandHeader
          title="Location access is unavailable"
          subtitle="Your route to safety starts nearby."
          variant="error"
        />
        <ClaymorphicCard className="onboarding-card">
          <div className="flex items-start gap-3">
            <MessageIcon variant="warning" />
            <div>
              <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">
                {denied ? 'We could not access your location' : 'We could not find your location'}
              </h2>
              <p className="mt-2 text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]">
                {denied
                  ? 'EvaRoute needs your location to find evacuation centers near you. Check your browser or site settings, then try again.'
                  : 'EvaRoute needs your location to find evacuation centers near you. Please check your connection or device settings, then try again.'}
              </p>
            </div>
          </div>
          <PillButton variant="primary" onClick={onRequestLocation} loading={loading} className="mt-5 w-full">
            {loading ? 'Getting location…' : 'Try again'}
          </PillButton>
          {denied && (
            <p className="mt-3 text-center text-[var(--font-size-xs)] leading-relaxed text-[var(--color-text-caption)]">
              If access was permanently blocked, re-enable location in your browser&apos;s site settings.
            </p>
          )}
        </ClaymorphicCard>
        <p className="onboarding-footnote">Private by design · Location is used to find nearby centers</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="onboarding-screen animate-fade-in" aria-busy="true">
        <BrandHeader title="Finding your location" subtitle="Your route to safety starts nearby." />
        <ClaymorphicCard className="onboarding-card">
          <div className="flex items-start gap-3">
            <MessageIcon />
            <div>
              <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">Requesting your location</h2>
              <p className="mt-2 text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]" aria-live="polite">
                Please wait while EvaRoute requests your location.
              </p>
            </div>
          </div>
          <div className="onboarding-steps" aria-label="Location setup progress">
            <Step active>Requesting your location</Step>
            <Step>Find nearby centers</Step>
            <Step>Prepare your map</Step>
          </div>
          <PillButton variant="primary" onClick={onRequestLocation} loading className="mt-5 w-full">
            Getting location…
          </PillButton>
        </ClaymorphicCard>
        <p className="onboarding-footnote">Private by design · Location is used to find nearby centers</p>
      </div>
    );
  }

  return (
    <div className="onboarding-screen animate-fade-in">
      <BrandHeader title="Your route to safety" subtitle="Find nearby evacuation centers when you need them most." />
      <ClaymorphicCard className="onboarding-card">
        <div className="flex items-start gap-3">
          <MessageIcon />
          <div>
            <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">Use your location to get started</h2>
            <p className="mt-2 text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]">
              EvaRoute uses your location to show evacuation centers near you and guide you there.
            </p>
          </div>
        </div>
        <div className="onboarding-steps" aria-label="Location setup progress">
          <Step active>Location permission</Step>
          <Step>Find nearby centers</Step>
          <Step>Prepare your map</Step>
        </div>
        <PillButton variant="primary" onClick={onRequestLocation} className="mt-5 w-full">
          Turn on location
        </PillButton>
      </ClaymorphicCard>
      <p className="onboarding-footnote">Private by design · Location is used to find nearby centers</p>
    </div>
  );
}

export function LocationReady({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="onboarding-screen animate-fade-in">
      <BrandHeader title="Location found" subtitle="Your nearby evacuation centers are ready to explore." variant="success" />
      <ClaymorphicCard className="onboarding-card">
        <div className="flex items-start gap-3">
          <MessageIcon variant="success" />
          <div>
            <h2 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">Ready to find a center</h2>
            <p className="mt-2 text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]">
              EvaRoute has your location and can now show nearby evacuation centers on the map.
            </p>
          </div>
        </div>
        <div className="onboarding-steps" aria-label="Location setup progress">
          <Step complete>Location obtained</Step>
          <Step active>Nearby centers ready</Step>
          <Step>Explore the map</Step>
        </div>
        <PillButton variant="primary" onClick={onContinue} className="mt-5 w-full">
          View nearby centers
        </PillButton>
      </ClaymorphicCard>
      <p className="onboarding-footnote">Private by design · Location is used to find nearby centers</p>
    </div>
  );
}
