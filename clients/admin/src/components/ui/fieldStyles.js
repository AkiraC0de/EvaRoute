/**
 * Shared field class strings. Split from Field.jsx so that file exports
 * components only (react-refresh/only-export-components) while PasswordInput
 * and custom inputs (OTP etc.) can still reuse the exact same chrome.
 *
 * Flat field language: white surface, hairline border, primary focus ring —
 * no recessed wells, no inset shadows.
 */
export const LABEL_CLASS = "mb-1 block label-micro text-muted";

export const FIELD_CLASS = [
  "h-11 sm:h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-soft",
  "outline-none transition",
  "placeholder:text-muted-dim",
  "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line-strong",
  "read-only:bg-surface-2 read-only:hover:border-line-strong",
].join(" ");
