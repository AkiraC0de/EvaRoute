import { useId } from "react";

/**
 * FacilityHeroArt — decorative background scene for the "My Facility"
 * command hero: an evacuation-center building (gable roof, arched entrance,
 * windows) with a family group arriving in front of it and a tree on the
 * left. It is the hero's thesis as an image — families routed to safety at
 * THIS place — and it reuses the adult/child figure vocabulary of
 * `occupancy/FamilySilhouette` so the card art and the hero speak one
 * language (Overview hero = the country map, this hero = this shelter).
 *
 * Purely decorative: aria-hidden + focusable=false + pointer-events-none,
 * white keyword fill under a top-fade mask (a soft ground-level watermark
 * that dissolves before it reaches the hero's text). Sized by the caller.
 */

/** One adult figure: head + dome-topped torso standing on y=238. */
const AdultFigure = ({ x, fillOpacity }) => (
  <g fillOpacity={fillOpacity}>
    <circle cx={x} cy={190} r={7} />
    <path d={`M${x - 13} 238 v-26 c0-8 6-13.6 13-13.6 s13 5.6 13 13.6 v26 z`} />
  </g>
);

/** One child figure: the same anatomy at ~65% height. */
const ChildFigure = ({ x, fillOpacity }) => (
  <g fillOpacity={fillOpacity}>
    <circle cx={x} cy={211.5} r={4.6} />
    <path d={`M${x - 8.5} 238 v-12 c0-5.2 3.8-9 8.5-9 s8.5 3.8 8.5 9 v12 z`} />
  </g>
);

const FacilityHeroArt = ({ className = "" }) => {
  const uid = useId();
  const fadeId = `facility-hero-fade-${uid}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 640 260"
      preserveAspectRatio="xMinYMax meet"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id={`${fadeId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g fill="white" mask={`url(#${fadeId}-mask)`}>
        {/* Ground line */}
        <rect x="8" y="238" width="624" height="7" rx="3.5" />

        {/* Tree (left-center) */}
        <circle cx="196" cy="148" r="28" />
        <circle cx="222" cy="162" r="18" />
        <rect x="188" y="176" width="15" height="62" rx="4" />

        {/* The shelter: gable roof + eave slab + body with arched entrance
            and two window cutouts (evenodd) — every part centered on x=490
            (roof overhangs the body by 18px on BOTH sides) */}
        <path d="M350 104 L490 32 L630 104 Z" />
        <rect x="348" y="100" width="284" height="11" rx="4" />
        <path
          fillRule="evenodd"
          d="M368 111 H612 V238 H368 Z M466 238 V206 a24 24 0 0 1 48 0 V238 Z M400 150 h30 v26 h-30 Z M550 150 h30 v26 h-30 Z"
        />

        {/* Family arriving in front of the shelter (adults left, children
            right — the household-card vocabulary, hero-sized) */}
        <AdultFigure x={266} />
        <AdultFigure x={302} />
        <ChildFigure x={332} fillOpacity="0.72" />
        <ChildFigure x={354} fillOpacity="0.72" />
      </g>
    </svg>
  );
};

export default FacilityHeroArt;
