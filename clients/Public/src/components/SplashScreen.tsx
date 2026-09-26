import ClaymorphicCard from './primitives/ClaymorphicCard';

interface SplashScreenProps {
  /** Whether the user's location has been acquired (item 1 complete). */
  locationReady: boolean;
  /** Whether initialization is fully complete (items 2–3 complete). */
  ready: boolean;
}

function ProgressBar({ filled }: { filled: number }) {
  return (
    <div
      className="splash-progress-bar"
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={100}
    >
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

function ChecklistItem({
  label,
  complete,
  spinning,
}: {
  label: string;
  complete: boolean;
  spinning: boolean;
}) {
  return (
    <div className="splash-checklist-item">
      <div
        className={`splash-checklist-radio ${complete ? 'complete' : spinning ? 'spinning' : ''}`}
        aria-hidden="true"
      >
        {complete && (
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
        {spinning && <SpinnerIcon className="w-3 h-3" />}
      </div>
      <span className="splash-checklist-label">{label}</span>
    </div>
  );
}

export default function SplashScreen({ locationReady, ready }: SplashScreenProps) {
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
      <ProgressBar filled={ready ? 100 : 40} />

      {/* Checklist card */}
      <ClaymorphicCard className="splash-checklist-card">
        <div className="splash-checklist">
          <ChecklistItem
            label="Getting your location"
            complete={locationReady}
            spinning={!locationReady && !ready}
          />
          <ChecklistItem
            label="Finding nearby centers"
            complete={ready}
            spinning={!ready}
          />
          <ChecklistItem
            label="Loading map tiles…"
            complete={ready}
            spinning={!ready}
          />
        </div>
      </ClaymorphicCard>
    </div>
  );
}
