import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listActivity } from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Numbered-pagination fetch for the History screen (server `page` mode).
 * TanStack Query adapter with `keepPreviousData`, so paging and filter
 * changes never blink the table to empty. Public shape unchanged.
 *
 * @param {object} query     { facilityId?, action?, search?, from?, to? }
 * @param {number} pageSize  rows per page (default 15)
 */
export default function useActivityPage(query = {}, pageSize = 15) {
  const [page, setPage] = useState(1);

  const feed = useQuery({
    queryKey: ["api", TAGS.activity, { query: query ?? {}, page, pageSize, mode: "page" }],
    queryFn: () => listActivity({ ...query, limit: pageSize, page }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    activities: feed.data?.activities ?? [],
    total: feed.data?.total ?? feed.data?.activities?.length ?? 0,
    totalPages: feed.data?.totalPages ?? 1,
    page,
    loading: feed.isPending,
    error: feed.error ?? null,
    setPage,
    reload: () => feed.refetch(),
  };
}
