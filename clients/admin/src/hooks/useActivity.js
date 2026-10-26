import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { listActivity } from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Cursor-paged activity feed with "load more" (GET /api/v1/activity).
 * TanStack Query infinite adapter: each loaded page is cached per query, so
 * revisiting a feed restores it instantly. Public shape unchanged.
 *
 * @param {object} query  { facilityId?, action?, actorId?, from?, to? }
 * @param {number} limit  page size (default 6 — compact strips use 5)
 */
export default function useActivity(query = {}, limit = 6) {
  const queryClient = useQueryClient();
  const baseKey = ["api", TAGS.activity, { query: query ?? {}, limit, mode: "cursor" }];

  const feed = useInfiniteQuery({
    queryKey: baseKey,
    queryFn: ({ pageParam }) =>
      listActivity({ ...query, limit, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  const pages = feed.data?.pages ?? [];
  const activities = pages.flatMap((page) => page?.activities ?? []);
  const nextCursor = pages.length > 0 ? pages[pages.length - 1]?.nextCursor ?? null : null;

  return {
    activities,
    nextCursor,
    loading: feed.isPending,
    error: feed.error ?? feed.fetchNextPageError ?? null,
    loadMore: () => {
      if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
    },
    loadingMore: feed.isFetchingNextPage,
    // Re-fetches the first page (drops loaded pages — expected for a refresh).
    reload: () => queryClient.resetQueries({ queryKey: baseKey }),
  };
}
