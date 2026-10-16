import Skeleton from "../../components/ui/Skeleton";

/** Lightweight clay placeholder shown while Leaflet lazy-loads. */
const MapSkeleton = ({ height = 260, label = "Loading map" }) => (
  <div
    role="status"
    aria-label={label}
    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sunken"
    style={{ height }}
  >
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-2 w-36" />
  </div>
);

/** Map failed to initialize (script blocked, container gone, …). */
const MapErrorState = ({ height = 260, onRetry }) => (
  <div
    role="alert"
    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sunken px-4 text-center"
    style={{ height }}
  >
    <p className="text-[10px] font-semibold text-ink-soft">The map could not be loaded.</p>
    <p className="text-[9px] text-muted">
      Locations still save as coordinates — the map is visual only.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-clay-sm bg-accent px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-accent-strong"
      >
        Try again
      </button>
    )}
  </div>
);

export { MapSkeleton, MapErrorState };
