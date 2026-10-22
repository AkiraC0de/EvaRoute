import { useCallback, useEffect, useRef, useState } from "react";
import useLeafletMap from "./useLeafletMap";
import { MapSkeleton, MapErrorState } from "./MapStates";
import MapLegend from "./MapLegend";
import { bindFacilityPopup, createStatusIcon } from "./FacilityMarkers";
import { toCoords } from "./coordinateUtils";
import { DEFAULT_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM } from "./tileConfig";

/**
 * Read-only facility map: one status-colored marker per facility with a
 * name/address/status popup and an optional "View details" action.
 *
 * Linked-selection contract (the registry's list⇄map binding):
 *   hoverId     — marker gets a highlight ring while its row is hovered;
 *   selectedId  — selected marker is ringed, camera flies in, popup opens;
 *   onSelect    — fired on marker click (the page keeps the selection; the
 *                 popup stays the in-place detail + action surface).
 * Highlight changes only swap marker icons — layers are never rebuilt, so
 * open popups and camera position survive hover/selection updates.
 */
const FacilityOverviewMap = ({
  facilities = [],
  height = 320,
  showLegend = true,
  onView,
  onSelect,
  hoverId = null,
  selectedId = null,
}) => {
  const containerRef = useRef(null);
  const leafletRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const groupRef = useRef(null);
  const markersRef = useRef(new Map());
  const [skippedCount, setSkippedCount] = useState(0);

  const draw = useCallback(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = groupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();
    markersRef.current.clear();
    let skipped = 0;
    const bounds = [];

    for (const facility of facilities) {
      const coords = toCoords(facility.latitude, facility.longitude);
      if (!coords) {
        skipped += 1;
        continue;
      }
      const marker = L.marker([coords.latitude, coords.longitude], {
        icon: createStatusIcon(L, facility.status, {
          highlighted: facility.id === selectedId || facility.id === hoverId,
        }),
      });
      bindFacilityPopup(marker, facility, onView ? { onView } : {});
      marker.on("click", () => {
        onSelect?.(facility);
        map.flyTo([coords.latitude, coords.longitude], FOCUS_ZOOM, {
          duration: 0.8,
        });
      });
      group.addLayer(marker);
      markersRef.current.set(facility.id, marker);
      bounds.push([coords.latitude, coords.longitude]);
    }

    setSkippedCount(skipped);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [facilities, onView, onSelect, selectedId, hoverId]);

  const handleReady = useCallback(
    (map, L) => {
      leafletRef.current = L;
      mapInstanceRef.current = map;
      groupRef.current = L.layerGroup().addTo(map);
      draw();
    },
    [draw],
  );

  const { status } = useLeafletMap(containerRef, { onReady: handleReady });

  // Redraw markers when the data changes (filtering, refetch, edits).
  useEffect(() => {
    if (status === "ready") draw();
  }, [status, draw]);

  // Hover/selection: swap icons in place (no layer rebuild → no popup loss).
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || status !== "ready") return;
    for (const [id, marker] of markersRef.current.entries()) {
      const facility = facilities.find((row) => row.id === id);
      if (!facility) continue;
      marker.setIcon(
        createStatusIcon(L, facility.status, {
          highlighted: id === selectedId || id === hoverId,
        }),
      );
    }
  }, [hoverId, selectedId, facilities, status]);

  // A row-side selection flies the camera and opens the marker popup.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId || status !== "ready") return;
    const marker = markersRef.current.get(selectedId);
    const facility = facilities.find((row) => row.id === selectedId);
    if (!marker || !facility) return;
    const coords = toCoords(facility.latitude, facility.longitude);
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], FOCUS_ZOOM, {
        duration: 0.6,
      });
    }
    marker.openPopup();
  }, [selectedId, facilities, status]);

  return (
    <div className="w-full">
      <div
        className="relative isolate w-full overflow-hidden rounded-md"
        style={{ height }}
      >
        <div ref={containerRef} className="map-chrome absolute inset-0" />
        {status === "loading" && (
          <div className="absolute inset-0">
            <MapSkeleton height="100%" label="Loading facilities map" />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0">
            <MapErrorState height="100%" />
          </div>
        )}
        {status === "ready" && showLegend && <MapLegend />}
      </div>
      {skippedCount > 0 && (
        <p className="mt-1.5 text-[10px] text-muted">
          {skippedCount} facilit{skippedCount === 1 ? "y has" : "ies have"} no
          usable map coordinates and {skippedCount === 1 ? "is" : "are"} not shown.
        </p>
      )}
    </div>
  );
};

export default FacilityOverviewMap;
