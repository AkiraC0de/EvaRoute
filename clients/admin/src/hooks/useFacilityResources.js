import { useCallback, useEffect, useState } from "react";
import * as api from "../lib/api";

/**
 * Resource list + CRUD for one facility, backed by the real endpoints:
 *   GET    /api/v1/facility/:facilityId/resource
 *   POST   /api/v1/facility/:facilityId/resource
 *   PATCH  /api/v1/facility/:facilityId/resource/:resourceId
 *   DELETE /api/v1/facility/:facilityId/resource/:resourceId
 *
 * Mutations only update local state from the record the API returns (no
 * optimistic updates), so a failed request can never look like success.
 *
 * Results are tagged with the facilityId they were fetched for and the public
 * values are derived at render time — no state is written synchronously inside
 * the effect (react-hooks/set-state-in-effect), and a facility switch can
 * never show another facility's rows. Pass `facilityId` = null when the user
 * has no assigned facility.
 */
export default function useFacilityResources(facilityId) {
  const [data, setData] = useState({ forId: null, resources: [], error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!facilityId) return undefined;

    let cancelled = false;

    api
      .listResources(facilityId)
      .then((next) => {
        if (!cancelled) setData({ forId: facilityId, resources: next, error: null });
      })
      .catch((err) => {
        if (!cancelled) setData({ forId: facilityId, resources: [], error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [facilityId, reloadToken]);

  const retry = useCallback(() => {
    // Event handler, not the effect: clearing `forId` marks the next fetch as
    // in-flight so the derived `loading` flips on without setState in an effect.
    setData((prev) => ({ ...prev, forId: null, error: null }));
    setReloadToken((token) => token + 1);
  }, []);

  const updateResources = useCallback(
    (updater) => {
      setData((prev) =>
        prev.forId === facilityId
          ? { ...prev, resources: updater(prev.resources) }
          : prev,
      );
    },
    [facilityId],
  );

  const createResource = useCallback(
    async (body) => {
      const created = await api.createResource(facilityId, body);
      updateResources((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [facilityId, updateResources],
  );

  const saveResource = useCallback(
    async (resourceId, patch) => {
      const updated = await api.updateResource(facilityId, resourceId, patch);
      updateResources((current) =>
        current.map((resource) => (resource.id === updated.id ? updated : resource)),
      );
    },
    [facilityId, updateResources],
  );

  const removeResource = useCallback(
    async (resourceId) => {
      await api.deleteResource(facilityId, resourceId);
      updateResources((current) =>
        current.filter((resource) => resource.id !== resourceId),
      );
    },
    [facilityId, updateResources],
  );

  const current = data.forId === facilityId ? data : { resources: [], error: null };

  return {
    resources: current.resources,
    loading: Boolean(facilityId) && data.forId !== facilityId,
    error: current.error,
    retry,
    createResource,
    saveResource,
    removeResource,
  };
}
