import { statusMetaOf } from "./statusColors";

/**
 * Marker + popup helpers for facility maps (plain Leaflet, no React rendering
 * inside popups). Markers are token-colored clay dots (divIcon — no image
 * asset wiring); popups carry name, address, status and a "View details"
 * action wired to the caller's navigation callback.
 */

export const createStatusIcon = (L, status) => {
  const meta = statusMetaOf(status);
  return L.divIcon({
    className: "",
    html: `<span class="clay-marker ${meta.markerClass}" aria-hidden="true"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
};

export const bindFacilityPopup = (marker, facility, { onView } = {}) => {
  const meta = statusMetaOf(facility.status);

  const root = document.createElement("div");
  const name = document.createElement("div");
  name.className = "popup-name";
  name.textContent = facility.name;
  root.appendChild(name);

  if (facility.address) {
    const address = document.createElement("div");
    address.className = "popup-address";
    address.textContent = facility.address;
    root.appendChild(address);
  }

  const foot = document.createElement("div");
  foot.className = "popup-foot";

  const status = document.createElement("span");
  status.className = "popup-status";
  const dot = document.createElement("span");
  dot.className = `clay-marker ${meta.markerClass}`;
  const label = document.createElement("span");
  label.className = "popup-status-label";
  label.textContent = meta.label;
  status.append(dot, label);
  foot.appendChild(status);

  if (onView) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "popup-view";
    button.textContent = "View details →";
    button.addEventListener("click", () => onView(facility.id));
    foot.appendChild(button);
  }

  root.appendChild(foot);
  marker.bindPopup(root);
  return marker;
};
