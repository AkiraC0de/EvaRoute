/** Shared class strings for the admin overview (flat Operations Console:
 *  hairline-bordered panels on the warm canvas, no lift, no molded depth). */

export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink";

export const GRID = "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4";
export const CARD = "rounded-lg border border-line bg-surface p-5";

/** Icon-chip tints — CATEGORY meaning, never decoration (same mapping as
 *  components/ui/StatTile): primary = occupancy/capacity, secondary = people,
 *  warm = places, neutral = records/admin. */
export const ICON_TONES = {
  primary: "bg-primary-soft text-primary-ink",
  secondary: "bg-secondary-soft text-secondary-ink",
  warm: "bg-warm-soft text-warm-ink",
  neutral: "bg-surface-2 text-muted",
};
