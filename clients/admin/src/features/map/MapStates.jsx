import Skeleton from "../../components/ui/Skeleton";

/** Lightweight flat placeholder shown while Leaflet lazy-loads. */
const MapSkeleton = ({ height = 260, label = "Loading map" }) => (
  <div
    role="status"
    aria-label={label}
    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2"
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
    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2 px-4 text-center"
    style={{ height }}
  >
    <p className="text-[12px] font-semibold text-ink-soft">The map could not be loaded.</p>
    <p className="text-[11px] text-muted">
      Locations still save as coordinates — the map is visual only.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-primary-strong"
      >
        Try again
      </button>
    )}
  </div>
);

export { MapSkeleton, MapErrorState };
