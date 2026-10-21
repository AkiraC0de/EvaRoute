import { useCallback, useEffect, useRef, useState } from "react";
import useLeafletMap from "./useLeafletMap";
import { MapSkeleton, MapErrorState } from "./MapStates";
import MapLegend from "./MapLegend";
import { bindFacilityPopup, createStatusIcon } from "./FacilityMarkers";
import { toCoords } from "./coordinateUtils";
import { DEFAULT_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM } from "./tileConfig";

/**
 * Read-only facility map: one status-colored marker per facility with a
 * name/address/status popup and an optional "View details" action. Markers
 * redraw when `facilities` changes (same map instance — no re-initialization);
 * facilities without usable coordinates are skipped and counted under the map.
 */
const FacilityOverviewMap = ({
  facilities = [],
  height = 320,
  showLegend = true,
  onView,
}) => {
  const containerRef = useRef(null);
  const leafletRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const groupRef = useRef(null);
  const [skippedCount, setSkippedCount] = useState(0);

  const draw = useCallback(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = groupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();
    let skipped = 0;
    const bounds = [];

    for (const facility of facilities) {
      const coords = toCoords(facility.latitude, facility.longitude);
      if (!coords) {
        skipped += 1;
        continue;
      }
      const marker = L.marker([coords.latitude, coords.longitude], {
        icon: createStatusIcon(L, facility.status),
      });
      bindFacilityPopup(marker, facility, onView ? { onView } : {});
      // Clicking a marker flies the camera to that facility — animated
      // pan + zoom toward it, then the popup opens on the focused view.
      marker.on("click", () => {
        map.flyTo([coords.latitude, coords.longitude], FOCUS_ZOOM, {
          duration: 0.8,
        });
      });
      group.addLayer(marker);
      bounds.push([coords.latitude, coords.longitude]);
    }

    setSkippedCount(skipped);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [facilities, onView]);

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
        <p className="mt-1.5 text-[11px] text-muted">
          {skippedCount} {skippedCount === 1 ? "facility is" : "facilities are"} not shown —
          missing or invalid location.
        </p>
      )}
    </div>
  );
};

export default FacilityOverviewMap;
