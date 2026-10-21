/** Shared class strings for the admin overview (flat Operations Console:
 *  hairline-bordered panels on the warm canvas, no lift, no molded depth). */

export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink";

export const CARD = "rounded-lg border border-line bg-surface p-4";

/** Icon-chip tints — CATEGORY meaning, never decoration (same mapping as
 *  components/ui/StatTile): primary = occupancy/capacity, secondary = people,
 *  neutral = records/admin. (The warm category tint was retired from the
 *  overview at the user's request — teal covers places here.) */
export const ICON_TONES = {
  primary: "bg-primary-soft text-primary-ink",
  secondary: "bg-secondary-soft text-secondary-ink",
  neutral: "bg-surface-2 text-muted",
};
