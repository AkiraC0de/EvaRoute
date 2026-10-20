import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class combiner: conditional classes + Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Display normalization for place names/addresses stored raw in the DB
 * ("camarin, caloocan city" → "Camarin, Caloocan City"). Capitalizes the
 * first letter of every word; words that carry their own casing keep it
 * (SM Fairview stays SM Fairview).
 */
export function displayPlaceName(value) {
  if (!value) return "";
  return String(value).replace(
    /(^|[\s,;:()\-–—/])([a-zà-ÿ])/g,
    (_, sep, ch) => sep + ch.toUpperCase(),
  );
}
