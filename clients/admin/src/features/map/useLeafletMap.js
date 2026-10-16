import { useEffect, useRef, useState } from "react";
import { TILE_URL, TILE_OPTIONS, DEFAULT_CENTER, DEFAULT_ZOOM } from "./tileConfig";
import "./map.css";

/**
 * Shared Leaflet lifecycle: lazy-imports Leaflet (and its CSS) only when a map
 * component actually mounts, creates the map once, keeps it correctly sized in
 * dynamic containers (modals, tabs, toggled views) via a ResizeObserver, and
 * tears everything down on unmount.
 *
 * @param {object} containerRef  ref for the div that hosts the map
 * @param {object} options       { center, zoom, onReady(map, L) }
 * @returns {{ status: "loading"|"ready"|"error", mapRef }}
 *
 * `center`/`zoom` are read at mount; `onReady` may change freely (kept in a
 * ref, updated in an effect).
 */
export default function useLeafletMap(containerRef, { center, zoom, onReady } = {}) {
  const [status, setStatus] = useState("loading");
  const mapRef = useRef(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let cancelled = false;
    let map = null;
    let observer = null;

    (async () => {
      try {
        const mod = await import("leaflet");
        const L = mod.default ?? mod;
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          center: center ?? DEFAULT_CENTER,
          zoom: zoom ?? DEFAULT_ZOOM,
          zoomControl: true,
          attributionControl: true,
        });
        L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map);
        mapRef.current = map;

        // Modal/tab layouts report the wrong size until a frame or two later.
        const invalidate = () => map.invalidateSize();
        observer = new ResizeObserver(invalidate);
        observer.observe(containerRef.current);
        invalidate();

        // The map is usable immediately (a view is established above), so
        // readiness does not gate on whenReady — which never fires for maps
        // created without an initial view.
        setStatus("ready");
        readyRef.current?.(map, L);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once per mount
  }, []);

  return { status, mapRef };
}
