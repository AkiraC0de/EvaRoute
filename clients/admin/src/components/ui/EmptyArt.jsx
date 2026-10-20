/**
 * Flat SVG spot illustrations for empty states — simple shapes in the
 * design-system tints (map/places = warm, records = neutral, people = teal),
 * no external assets. `variant` picks the scene; all are decorative
 * (aria-hidden).
 */
const SCENES = {
  // Rounded hills + route pin: "nothing mapped yet"
  map: (
    <svg viewBox="0 0 120 72" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="8" y="40" width="104" height="24" rx="8" fill="var(--color-warm-soft)" />
      <path d="M20 46c8-10 18-12 26-4s16 6 24-2 18-8 26 2" stroke="var(--color-warm)" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 8c-6.6 0-12 5.4-12 12 0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="var(--color-primary)" />
      <circle cx="60" cy="20" r="4.5" fill="var(--color-surface)" />
    </svg>
  ),
  // Stack of flat boxes: "no records"
  boxes: (
    <svg viewBox="0 0 120 72" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="18" y="34" width="40" height="26" rx="8" fill="var(--color-surface-2)" />
      <rect x="62" y="26" width="40" height="34" rx="8" fill="var(--color-surface-2-hover)" />
      <rect x="38" y="12" width="44" height="24" rx="8" fill="var(--color-line-strong)" />
      <path d="M46 24h28M46 30h18" stroke="var(--color-muted-dim)" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  // People pair: "no staff / no households"
  people: (
    <svg viewBox="0 0 120 72" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="44" cy="24" r="10" fill="var(--color-secondary)" fillOpacity="0.4" />
      <rect x="28" y="38" width="32" height="22" rx="10" fill="var(--color-secondary-soft)" />
      <circle cx="78" cy="28" r="8" fill="var(--color-secondary)" fillOpacity="0.3" />
      <rect x="66" y="40" width="26" height="18" rx="8" fill="var(--color-secondary-soft)" />
    </svg>
  ),
};

const EmptyArt = ({ variant = "map", className = "h-16 w-28" }) => (
  <span className={`inline-block ${className}`}>{SCENES[variant] ?? SCENES.map}</span>
);

export default EmptyArt;
