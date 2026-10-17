import { motion } from "motion/react";
import CapacityProgress from "./CapacityProgress";
import CenterStatusBadge from "./CenterStatusBadge";
import { staggerContainer, staggerItem } from "../../lib/motion";

/**
 * FacilityDetailSidebar — the selected center's detail sheet (frame 05).
 *
 * Built around the data that actually matters to an evacuee: is it open,
 * how far, how much room is left, and what supplies/services does it have
 * RIGHT NOW (the `resources[]` from GET /api/v1/public/facility — boolean
 * availability and counted stock both shown as first-class states).
 */

/* ── Amenity icons: one stroke language, keyed by resource name/essentialType ── */
const ICON_PATHS = {
  electricity: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 2L3 13h8l-1 8 9-10h-8l1-8z"
    />
  ),
  water: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.5a7 7 0 0 0-7 7c0 3.5 2.5 6.5 7 10 4.5-3.5 7-6.5 7-10a7 7 0 0 0-7-7z"
      />
      <path strokeLinecap="round" d="M12 14v6M8 17h8" />
    </>
  ),
  restroom: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6M10 3v6.5a4.5 4.5 0 0 1 0 9h-2a4.5 4.5 0 0 1 0-9V3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 3v6.5a4.5 4.5 0 0 0 0 9h2a4.5 4.5 0 0 0 0-9V3"
      />
    </>
  ),
  food: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 3c-1.5 2-2 4-2 6.5 0 1.5.5 2.5 2 2.5v9"
      />
    </>
  ),
  medical: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path
        strokeLinecap="round"
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M12 11v5M9.5 13.5h5"
      />
    </>
  ),
  shelter: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M5 21V8l7-4 7 4v13M8 21v-6h8v6"
    />
  ),
  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.22 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.74 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.09 6.09l.81-.81a2 2 0 0 1 2.11-.45c.91.37 1.85.61 2.81.74a2 2 0 0 1 1.72 2z"
    />
  ),
  parking: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V7h4a3 3 0 0 1 0 6H9"
      />
    </>
  ),
  wheelchair: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12h6l2 3h2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4h2l2-3H6z"
      />
    </>
  ),
  box: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"
      />
    </>
  ),
};

/** essentialType wins (stable identifiers); otherwise alias-match the name. */
function amenityIcon(resource) {
  const essential = resource.essentialType;
  if (essential === "ELECTRICITY") return ICON_PATHS.electricity;
  if (essential === "WATER") return ICON_PATHS.water;
  if (essential === "COMFORT_ROOM") return ICON_PATHS.restroom;
  const n = (resource.name || "").toLowerCase();
  if (/water|drink|hydrant/.test(n)) return ICON_PATHS.water;
  if (/electric|generator|power/.test(n)) return ICON_PATHS.electricity;
  if (/comfort|restroom|toilet|cr\b/.test(n)) return ICON_PATHS.restroom;
  if (/meal|food|feed|kitchen/.test(n)) return ICON_PATHS.food;
  if (/medic|clinic|health|first.?aid/.test(n)) return ICON_PATHS.medical;
  if (/shelter|tent|blanket|bed/.test(n)) return ICON_PATHS.shelter;
  if (/phone|charg|comm/.test(n)) return ICON_PATHS.phone;
  if (/parking|vehicle/.test(n)) return ICON_PATHS.parking;
  if (/wheel|accessib|pwd/.test(n)) return ICON_PATHS.wheelchair;
  return ICON_PATHS.box;
}

const ESSENTIAL_ORDER = { ELECTRICITY: 0, WATER: 1, COMFORT_ROOM: 2 };

/** Essentials first (stable order), then everything else by name. */
function sortAmenities(resources) {
  return [...resources].sort((a, b) => {
    const ea = a.essentialType != null ? 0 : 1;
    const eb = b.essentialType != null ? 0 : 1;
    if (ea !== eb) return ea - eb;
    if (ea === 0)
      return (
        (ESSENTIAL_ORDER[a.essentialType] ?? 9) -
        (ESSENTIAL_ORDER[b.essentialType] ?? 9)
      );
    return (a.name || "").localeCompare(b.name || "");
  });
}

/** One amenity row: icon chip + name + honest state (never colour alone). */
function AmenityRow({ resource }) {
  const isQuantity = resource.type === "QUANTITY";
  const hasMax =
    isQuantity && resource.maxValue != null && resource.maxValue > 0;
  const pct = hasMax
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((resource.availableValue ?? 0) / resource.maxValue) * 100,
          ),
        ),
      )
    : null;

  let state;
  if (isQuantity) {
    state = (
      <div className="flex flex-col gap-1 min-w-[96px] shrink-0 justify-items-end">
        <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums text-ink">
          {resource.availableValue ?? 0}
          {hasMax ? ` / ${resource.maxValue}` : ""} left
        </span>
        {pct != null && (
          <span
            className="block h-[5px] w-24 overflow-hidden rounded-full bg-sunken shadow-clay-inset"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-success transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </span>
        )}
      </div>
    );
  } else if (resource.isAvailable === true) {
    state = (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-success"
        />
        Available
      </span>
    );
  } else if (resource.isAvailable === false) {
    state = (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-semibold text-danger">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-danger"
        />
        Unavailable
      </span>
    );
  } else {
    state = (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-sunken px-2.5 py-1 text-[11px] font-semibold text-muted">
        Status unknown
      </span>
    );
  }

  return (
    <motion.li
      variants={staggerItem}
      className="flex min-w-0 items-center gap-2.5"
    >
      <span
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent shadow-clay-xs"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          className="h-[18px] w-[18px]"
        >
          {amenityIcon(resource)}
        </svg>
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
        {resource.name}
      </span>
      {state}
    </motion.li>
  );
}

export default function FacilityDetailSidebar({
  facility,
  distance,
  onBack,
  onGetRoute,
  currentOccupancy,
  resources,
  locationPrompt,
  onEnableLocation,
}) {
  // Walking-speed ETA estimate (~12 km/h = 0.2 km/min) — an approximation;
  // real routing data only exists after Get Route.
  const etaMin =
    distance != null && distance > 0 ? Math.round(distance / 0.2) : null;
  const amenities = sortAmenities(resources ?? []);

  return (
    <div className="no-scrollbar flex min-h-0 h-full flex-col gap-4 overflow-y-auto">
      {/* Identity */}
      <header className="flex min-w-0 items-start justify-between gap-4 ">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight text-ink">
            {facility.name}
          </h2>
          <p className="mt-1 break-words text-[13px] capitalize leading-snug text-muted">
            {facility.address}
          </p>
        </div>
        <button
          type="button"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunken text-muted shadow-clay-inset transition hover:bg-surface hover:text-accent"
          onClick={onBack}
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </header>

      {/* Status + distance chips */}
      <div className="flex flex-wrap items-center gap-2">
        <CenterStatusBadge status={facility.status} fullLabel />
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface px-[11px] py-[5px] text-[11px] font-semibold text-muted shadow-clay-xs">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="8" />
            <path strokeLinecap="round" d="M12 8v4l2.5 2" />
          </svg>
          {distance != null
            ? `${distance.toFixed(1)} km${etaMin != null ? ` · ${etaMin} min away` : " away"}`
            : "Distance unavailable"}
        </span>
      </div>

      {/* Capacity */}
      <section
        className="block w-full min-w-0 rounded-clay bg-surface p-4 shadow-clay-xs"
        aria-labelledby="fd-capacity-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            id="fd-capacity-heading"
            className="text-[15px] font-semibold tracking-tight text-ink"
          >
            Capacity
          </h3>
          <span className="text-[11px] font-medium text-muted-dim">
            {facility.maxCapacity.toLocaleString()} spaces max
          </span>
        </div>
        <CapacityProgress
          current={currentOccupancy}
          max={facility.maxCapacity}
          showSlotsLeft
          showPercentage
          className="mt-3 w-full"
        />
        {currentOccupancy == null && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-dim">
            Current occupancy is reported once families check in.
          </p>
        )}
      </section>

      {/* Amenities & supplies — the resources[] from the public API */}
      <section
        className="block w-full min-w-0 rounded-clay bg-surface p-4 shadow-clay-xs"
        aria-labelledby="fd-amenities-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            id="fd-amenities-heading"
            className="text-[15px] font-semibold tracking-tight text-ink"
          >
            Amenities &amp; supplies
          </h3>
          {amenities.length > 0 && (
            <span className="text-[11px] font-medium text-muted-dim">
              {amenities.length} listed
            </span>
          )}
        </div>
        {amenities.length > 0 ? (
          <motion.ul
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-4 grid list-none gap-2.5 p-0"
          >
            {amenities.map((resource) => (
              <AmenityRow key={resource.id} resource={resource} />
            ))}
          </motion.ul>
        ) : (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-dim">
            This center has not listed any amenities yet.
          </p>
        )}
      </section>

      {/* About */}
      {facility.note && (
        <section
          className="block w-full min-w-0 rounded-clay bg-surface p-4 shadow-clay-xs"
          aria-labelledby="fd-about-heading"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3
              id="fd-about-heading"
              className="text-[15px] font-semibold tracking-tight text-ink"
            >
              About this center
            </h3>
          </div>
          <p className="mt-2 break-words text-[13px] leading-relaxed text-muted hyphens-auto">
            {facility.note}
          </p>
        </section>
      )}

      <div className="flex-1 flex flex-col justify-end">
        {/* Inline location recovery — appears only after Get Route needs a real
          location. Kept above the actions so the retry sits next to the
          button that triggered it. */}
        {locationPrompt && (
          <div
            className={`mt-2 flex flex-wrap items-center gap-2 rounded-clay-sm bg-sunken px-4 py-2 shadow-clay-inset ${locationPrompt.blocked ? "is-blocked" : ""}`}
            role="status"
          >
            <p className="min-w-0 flex-1 basis-[200px] text-[11px] leading-snug text-muted">
              {locationPrompt.blocked
                ? "Location is blocked for this site. To get directions from your position, allow location access in your browser\u2019s site settings, then try again."
                : "Location is needed to get directions from your current position."}
            </p>
            <button
              type="button"
              className="focus-ring motion-safe-transform min-h-9 shrink-0 rounded-full bg-surface px-4 py-1 text-[11px] font-semibold text-accent shadow-clay-xs transition active:shadow-clay-inset disabled:opacity-60"
              onClick={onEnableLocation}
              disabled={locationPrompt.requesting}
            >
              {locationPrompt.requesting ? "Locating\u2026" : "Enable Location"}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-row gap-2 pt-2 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            className="focus-ring w-full rounded-full bg-surface px-6 py-2.5 text-[15px] font-semibold text-ink shadow-clay-xs transition hover:bg-sunken active:shadow-clay-inset"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="focus-ring motion-safe-transform inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-2.5 text-[15px] font-semibold text-white shadow-clay-xs transition hover:-translate-y-px hover:bg-accent-strong hover:shadow-clay active:translate-y-0"
            onClick={onGetRoute}
          >
            Get Route
            <svg
              className="ml-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
