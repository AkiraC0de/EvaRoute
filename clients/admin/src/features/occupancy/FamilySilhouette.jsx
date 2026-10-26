/**
 * FamilySilhouette — decorative member-composition art for the household
 * check-in cards: one figure per member, baseline-aligned in the card's
 * lower-right background, so the family's category mix (adults vs children)
 * reads at a glance. ADULT figures are the tall ones, CHILD figures the
 * small ones — the same meaning as the member chips, without reading words.
 *
 * Purely decorative: aria-hidden + pointer-events-none, `currentColor` fill
 * so the tint tracks the theme (caller picks the text-* token). Figures are
 * sorted adults-first for a stable, calm row; the SVG keeps its natural size
 * for small families and shrinks uniformly via `max-w-*` + `meet` for large
 * ones. Returns null for an empty household.
 */
const ADULT_SLOT = 26;
const CHILD_SLOT = 19;
const PAD = 3;
const HEIGHT = 40;

/** One adult pictogram: head + dome-topped torso standing on the baseline. */
const AdultFigure = ({ x }) => (
  <g>
    <circle cx={x} cy={8} r={5.4} />
    <path
      d={`M${x - 11} ${HEIGHT} V 26 C ${x - 11} 19.5, ${x - 5.5} 15.5, ${x} 15.5 C ${x + 5.5} 15.5, ${x + 11} 19.5, ${x + 11} 26 V ${HEIGHT} Z`}
    />
  </g>
);

/** One child pictogram: the same anatomy at ~62% height. */
const ChildFigure = ({ x }) => (
  <g fillOpacity="0.62">
    <circle cx={x} cy={26.4} r={3.6} />
    <path
      d={`M${x - 7} ${HEIGHT} V 33 C ${x - 7} 29.3, ${x - 3.5} 27, ${x} 27 C ${x + 3.5} 27, ${x + 7} 29.3, ${x + 7} 33 V ${HEIGHT} Z`}
    />
  </g>
);

const FamilySilhouette = ({ adults = 0, children = 0, className = "" }) => {
  const a = Math.max(0, Math.floor(adults));
  const c = Math.max(0, Math.floor(children));
  if (a + c === 0) return null;

  const width = PAD * 2 + a * ADULT_SLOT + c * CHILD_SLOT;

  // Baseline-centered slots: adults left, children right.
  const figures = [];
  let x = PAD;
  for (let i = 0; i < a; i += 1) {
    x += ADULT_SLOT / 2;
    figures.push(<AdultFigure key={`a${i}`} x={x} />);
    x += ADULT_SLOT / 2;
  }
  for (let i = 0; i < c; i += 1) {
    x += CHILD_SLOT / 2;
    figures.push(<ChildFigure key={`c${i}`} x={x} />);
    x += CHILD_SLOT / 2;
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="xMaxYMid meet"
      className={`pointer-events-none ${className}`}
    >
      {figures}
    </svg>
  );
};

export default FamilySilhouette;
