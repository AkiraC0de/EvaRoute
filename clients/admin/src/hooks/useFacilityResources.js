import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";
import { TAGS } from "../lib/api/cacheTags.js";

/**
 * Resource list + CRUD for one facility, backed by the real endpoints:
 *   GET    /api/v1/facility/:facilityId/resource
 *   POST   /api/v1/facility/:facilityId/resource
 *   PATCH  /api/v1/facility/:facilityId/resource/:resourceId
 *   DELETE /api/v1/facility/:facilityId/resource/:resourceId
 *
 * TanStack Query adapter. Mutations splice the SERVER's returned record into
 * the cache for an immediate paint (never an optimistic guess — a failed
 * request can never look like success); the request() seam's invalidation
 * confirms with a refetch right after. Pass `facilityId` = null when the user
 * has no assigned facility.
 */
export default function useFacilityResources(facilityId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["api", TAGS.resources, { facilityId: facilityId ?? null }],
    queryFn: () => api.listResources(facilityId),
    enabled: Boolean(facilityId),
    staleTime: 60_000,
  });

  const updateCache = useCallback(
    (updater) => {
      queryClient.setQueryData(
        ["api", TAGS.resources, { facilityId: facilityId ?? null }],
        (prev) => (Array.isArray(prev) ? updater(prev) : prev),
      );
    },
    [queryClient, facilityId],
  );

  const createResource = useCallback(
    async (body) => {
      const created = await api.createResource(facilityId, body);
      updateCache((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [facilityId, updateCache],
  );

  const saveResource = useCallback(
    async (resourceId, patch) => {
      const updated = await api.updateResource(facilityId, resourceId, patch);
      updateCache((current) =>
        current.map((resource) => (resource.id === updated.id ? updated : resource)),
      );
    },
    [facilityId, updateCache],
  );

  const removeResource = useCallback(
    async (resourceId) => {
      await api.deleteResource(facilityId, resourceId);
      updateCache((current) =>
        current.filter((resource) => resource.id !== resourceId),
      );
    },
    [facilityId, updateCache],
  );

  return {
    resources: query.data ?? [],
    loading: Boolean(facilityId) && query.isPending,
    error: query.error ?? null,
    retry: () => query.refetch(),
    createResource,
    saveResource,
    removeResource,
  };
}
