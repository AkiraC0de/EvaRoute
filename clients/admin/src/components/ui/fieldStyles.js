/**
 * Shared clay field class strings. Split from Field.jsx so that file exports
 * components only (react-refresh/only-export-components) while PasswordInput
 * and custom inputs (OTP etc.) can still reuse the exact same chrome.
 */
export const LABEL_CLASS = "mb-1 block label-micro text-muted";

export const FIELD_CLASS = [
  "h-11 sm:h-10 w-full rounded-clay-sm bg-sunken px-3 text-[13px] font-medium text-ink-soft",
  "shadow-clay-inset outline-none transition",
  "placeholder:text-muted-dim",
  "hover:bg-sunken-hover",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-sunken",
].join(" ");
