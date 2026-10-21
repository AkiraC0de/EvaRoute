/**
 * Neutral surface-tone loading skeletons (never primary-colored). The base
 * block plus composed shapes that mirror the current component anatomy —
 * flat hairline cards (rounded-lg + border), KPI tiles with their icon
 * chip, ID-credential cards with their dark header band, activity rows,
 * load rows, chart bars and form fields — so loading states read as the
 * page that is coming, not as random gray boxes.
 */
const Skeleton = ({ className = "", ...props }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none ${className}`}
    {...props}
  />
);

/** Thin text bar. */
export const SkeletonText = ({ className = "" }) => (
  <Skeleton className={`h-2.5 rounded-full ${className}`} />
);

/** Form field: micro-label + input well. */
export const SkeletonField = ({ className = "" }) => (
  <div className={className}>
    <Skeleton className="h-2.5 w-16 rounded-full" />
    <Skeleton className="mt-1.5 h-10 w-full rounded-md" />
  </div>
);

/** KPI tile — mirrors StatCard (flat hairline card: label, big number,
 *  caption, category icon chip top-right). */
export const SkeletonStatCard = () => (
  <div className="rounded-lg border border-line bg-surface p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-2.5 w-24 rounded-full" />
        <Skeleton className="mt-2.5 h-7 w-16 rounded-full" />
        <Skeleton className="mt-3 h-2.5 w-36 rounded-full" />
      </div>
      <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
    </div>
  </div>
);

/** ID-credential card — mirrors StaffIdCard (header band, photo, rows,
 *  footer) on the flat hairline card. */
/**
 * Overview skeletons — each mirrors its REAL component's anatomy exactly
 * (same boxes, same rhythm) so the loading state and the loaded state are
 * the same shape: no pop-in, no layout jump.
 */

/** One brief-strip cell: icon tile + label/value/caption stack. */
export const SkeletonBriefCell = () => (
  <div className="flex items-start gap-3 bg-surface px-3.5 py-3">
    <Skeleton className="h-8 w-8 rounded-md" />
    <div className="min-w-0 flex-1">
      <Skeleton className="h-2 w-16 rounded-full" />
      <Skeleton className="mt-1.5 h-5 w-12 rounded-none" />
      <Skeleton className="mt-1.5 h-2 w-24 rounded-full" />
    </div>
  </div>
);

/** One "Needs attention" row: icon + name line + indented reason line. */
export const SkeletonAttentionRow = () => (
  <div className="flex min-h-11 flex-col gap-1.5 rounded-md border border-line bg-surface-2 px-3 py-2.5">
    <div className="flex items-center gap-2">
      <Skeleton className="h-3.5 w-3.5 rounded-none" />
      <Skeleton className="h-2.5 flex-1 rounded-full" />
      <Skeleton className="h-3 w-3 rounded-none" />
    </div>
    <Skeleton className="ml-[23px] h-2 w-2/5 rounded-full" />
  </div>
);

/** One Readiness row: label + count line over the coverage meter. */
export const SkeletonCoverageRow = () => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <Skeleton className="h-2.5 w-28 rounded-full" />
      <Skeleton className="h-2 w-20 rounded-full" />
    </div>
    <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
  </div>
);

/** One facility-load table row: name / status / meter+% / occupancy. */
export const SkeletonLoadTableRow = () => (
  <div className="grid grid-cols-1 gap-1.5 py-2.5 md:grid-cols-[minmax(0,1fr)_92px_minmax(150px,240px)_190px] md:items-center md:gap-3">
    <Skeleton className="h-3 w-40 rounded-full" />
    <Skeleton className="h-5 w-16 rounded-full" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-2 flex-1 rounded-full" />
      <Skeleton className="h-2.5 w-8 rounded-none" />
    </div>
    <Skeleton className="h-2.5 w-32 rounded-full" />
  </div>
);

/** Chunk-loading fallback for a lazy route — block shapes mirror a page. */
export const SkeletonPage = () => (
  <div role="status" aria-label="Loading page" className="flex flex-col gap-4">
    <Skeleton className="h-8 w-56" />
    <Skeleton className="h-28 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export const SkeletonIdCard = () => (
  <div className="relative pt-2.5">
    <Skeleton className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 rounded-t-full" />
    <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl border-2 border-primary bg-surface">
      <div className="flex items-start justify-between px-5 pt-4">
        <div>
          <Skeleton className="h-2.5 w-16 rounded-none" />
          <Skeleton className="mt-1.5 h-1.5 w-24 rounded-none" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-3 flex gap-4 px-5">
        <Skeleton className="h-[72px] w-[72px] rounded-none" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-32 rounded-none" />
          <Skeleton className="mt-2 h-2 w-20 rounded-none" />
          <div className="mt-3 space-y-[7px]">
            {[0, 1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-2 w-full rounded-none" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/** Activity row — mirrors ActivityRow (icon, text lines, meta row). */
export const SkeletonActivityRow = () => (
  <div className="flex items-start gap-2.5 border-b border-line px-4 py-2.5">
    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1">
      <Skeleton className="h-2.5 w-2/3 rounded-full" />
      <div className="mt-1.5 flex items-center gap-2">
        <Skeleton className="h-2 w-12 rounded-full" />
        <Skeleton className="h-2 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

/** Facility-load row — mirrors LoadRow (name + status pill + capacity meter). */
export const SkeletonLoadRow = () => (
  <div className="border-b border-line py-2.5 last:border-0">
    <div className="flex items-center justify-between gap-2">
      <Skeleton className="h-2.5 w-2/5 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-2.5 w-10 rounded-full" />
    </div>
    <Skeleton className="mt-2 h-2 w-full rounded-full" />
  </div>
);

/** Chart plot — bar silhouettes with quiet/busy rhythm. */
export const SkeletonChartBars = ({ height = 220 }) => (
  <div
    aria-hidden="true"
    className="flex items-end justify-between gap-2 px-2"
    style={{ height }}
  >
    {[0.12, 0.18, 0.1, 0.14, 0.55, 0.92, 0.16, 0.35, 0.88, 0.12, 0.1, 0.2, 0.3, 0.62].map(
      (ratio, n) => (
        <Skeleton
          key={n}
          className="w-full rounded-b-none rounded-t-md"
          style={{ height: `${Math.max(ratio * 100, 6)}%` }}
        />
      ),
    )}
  </div>
);

export default Skeleton;
