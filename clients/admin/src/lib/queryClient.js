import { QueryClient } from "@tanstack/react-query";

/**
 * Shared query defaults for the operations console: correctness-first.
 * Mutations invalidate (lib/api/cacheTags.js via the request() seam); these
 * TTLs only bound redundant background refetches. 4xx never retries — the
 * 401 path is already handled by request()'s single-flight refresh.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) =>
          (error?.status ?? 500) === 0 && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
