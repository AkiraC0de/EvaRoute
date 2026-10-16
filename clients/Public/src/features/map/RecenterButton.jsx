export default function RecenterButton({ mapRef, position, defaultCenter, inline = false, className = '' }) {
  function handleRecenter() {
    if (!mapRef.current) return;
    const target = position != null ? [position.latitude, position.longitude] : defaultCenter ?? [14.5964, 120.9736];
    // setView, not flyTo — Leaflet's flight animation is unreliable here.
    mapRef.current.setView(target, 14, { animate: true, duration: 0.75 });
  }

  return (
    <button
      className={[
        'flex h-11 w-11 items-center justify-center rounded-full bg-surface text-accent shadow-clay transition hover:scale-105 hover:shadow-clay-lg active:scale-95 motion-safe-transform',
        inline ? 'shrink-0' : 'fixed bottom-6 right-6 z-20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleRecenter}
      aria-label="Recenter on your location"
      title="Recenter"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      </svg>
    </button>
  );
}
