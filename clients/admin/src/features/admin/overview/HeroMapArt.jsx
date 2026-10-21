import { useId } from "react";
import PHILIPPINES_MAP_PATH, { PH_MAP_VIEWBOX } from "./philippinesMapPath";

/**
 * HeroMapArt — the decorative Philippines archipelago vector for the hero
 * band's bright right side (the hero gradient runs dark top-left → bright
 * bottom-right, so a light silhouette reads where the band is brightest).
 *
 * Purely decorative: aria-hidden + pointer-events-none, and it lives INSIDE
 * the hero's color layer so the paper-wipe reveal sweeps it in with the
 * gradient. The mask is a gentle horizontal fade (quiet on the left where it
 * meets the copy, fully lit on the right) — a radial fade was tried first and
 * swallowed the western half of the archipelago, so the silhouette read as an
 * unrecognizable blob: the WHOLE map must stay legible at all times. Fill is
 * the `white` keyword — no raw hex (decorative art rule).
 */
const HeroMapArt = ({ className = "" }) => {
  const uid = useId();
  const fadeId = `hero-map-fade-${uid}`;

  return (
    <svg
      aria-hidden="true"
      viewBox={PH_MAP_VIEWBOX}
      preserveAspectRatio="xMaxYMid meet"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="55%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id={`${fadeId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          {/* mask content coords are USER SPACE (viewBox units), not the
              objectBoundingBox box — a 0..1 rect here masks the map away
              entirely; percentages resolve against the viewBox. */}
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${fadeId})`} />
        </mask>
      </defs>
      <path
        d={PHILIPPINES_MAP_PATH}
        fill="white"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeLinejoin="round"
        mask={`url(#${fadeId}-mask)`}
      />
    </svg>
  );
};

export default HeroMapArt;
