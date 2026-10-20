import { useCallback, useEffect, useRef } from "react";
import useLeafletMap from "./useLeafletMap";
import { MapSkeleton, MapErrorState } from "./MapStates";
import { toCoords } from "./coordinateUtils";
import { DEFAULT_CENTER, DEFAULT_ZOOM, PICKER_ZOOM } from "./tileConfig";

/**
 * Interactive location picker: click the map to place the facility marker,
 * drag the marker to fine-tune. Reports { latitude, longitude } numbers
 * through `onChange` and keeps the marker in sync with `value`.
 *
 * `disabled` renders a plain read-only map. The map lazily loads through
 * useLeafletMap — this component mounts only where a picker is shown.
 */
const LocationPickerMap = ({ value, onChange, height = 260, disabled = false }) => {
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const place = useCallback((map, latlng) => {
    const L = leafletRef.current;
    if (!L) return;
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, {
        icon: L.divIcon({
          className: "",
          html: '<span class="map-marker map-marker--selected" aria-hidden="true"></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        draggable: !disabled,
      }).addTo(map);
      if (!disabled) {
        markerRef.current.on("dragend", () => {
          const point = markerRef.current.getLatLng();
          onChangeRef.current?.({ latitude: point.lat, longitude: point.lng });
        });
      }
    }
    onChangeRef.current?.({ latitude: latlng.lat, longitude: latlng.lng });
  }, [disabled]);

  const handleReady = useCallback(
    (map, L) => {
      leafletRef.current = L;
      const initial = toCoords(value?.latitude, value?.longitude);
      if (initial) {
        map.setView([initial.latitude, initial.longitude], PICKER_ZOOM);
        place(map, { lat: initial.latitude, lng: initial.longitude });
      } else {
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      }
      if (!disabled) {
        map.on("click", (event) => place(map, event.latlng));
      }
    },
    // Initial placement only — later value changes are synced by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [place, disabled],
  );

  const { status, mapRef } = useLeafletMap(containerRef, { onReady: handleReady });

  // Keep the marker aligned when the form value changes externally (reset).
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || status !== "ready") return;
    const coords = toCoords(value?.latitude, value?.longitude);
    const marker = markerRef.current;

    if (coords && marker) {
      const point = marker.getLatLng();
      if (
        Math.abs(point.lat - coords.latitude) > 1e-9 ||
        Math.abs(point.lng - coords.longitude) > 1e-9
      ) {
        marker.setLatLng([coords.latitude, coords.longitude]);
      }
    } else if (coords && !marker) {
      place(map, { lat: coords.latitude, lng: coords.longitude });
    } else if (!coords && marker) {
      marker.remove();
      markerRef.current = null;
    }
  }, [value?.latitude, value?.longitude, status, mapRef, place]);

  return (
    <div
      className="relative isolate w-full overflow-hidden rounded-md"
      style={{ height }}
    >
      <div ref={containerRef} className="map-chrome absolute inset-0" />
      {status === "loading" && (
        <div className="absolute inset-0">
          <MapSkeleton height="100%" label="Loading location map" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0">
          <MapErrorState height="100%" />
        </div>
      )}
      {status === "ready" && !disabled && (
        <p className="map-chrome-hint">
          {value ? "Drag the marker to adjust · click to move it" : "Click the map to set the location"}
        </p>
      )}
    </div>
  );
};

export default LocationPickerMap;
