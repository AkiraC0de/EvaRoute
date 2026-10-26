import { useQuery } from "@tanstack/react-query";
import { listActivityStats } from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Accurate activity counts for a period (default: server's 7-day window).
 * TanStack Query adapter. Counts stay `null` until measured — a 0 must be a
 * measured zero, so callers render `—` (not a fake 0) while loading or after
 * a failure. Public shape unchanged.
 *
 * @param {object} window  { from?, to? } ISO strings
 */
export default function useActivityStats(window = {}) {
  const stats = useQuery({
    queryKey: ["api", TAGS.activity, { window: window ?? {}, mode: "stats" }],
    queryFn: () => listActivityStats(window),
    staleTime: 30_000,
  });

  return {
    total: stats.data?.total ?? null,
    byAction: stats.data?.byAction ?? null,
    timeline: stats.data?.timeline ?? null,
    loading: stats.isPending,
    error: stats.error ?? null,
  };
}
