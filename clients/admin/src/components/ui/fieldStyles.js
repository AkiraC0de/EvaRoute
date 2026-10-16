/**
 * Shared clay field class strings. Split from Field.jsx so that file exports
 * components only (react-refresh/only-export-components) while PasswordInput
 * and custom inputs (OTP etc.) can still reuse the exact same chrome.
 */
export const LABEL_CLASS =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]";

export const FIELD_CLASS = [
  "h-10 w-full rounded-clay-sm bg-sunken px-3 text-[13px] font-medium text-[#2f3d5f]",
  "shadow-clay-inset outline-none transition",
  "placeholder:text-muted-dim",
  "hover:bg-[#f2f5fb]",
  "ring-accent focus:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-sunken",
].join(" ");
