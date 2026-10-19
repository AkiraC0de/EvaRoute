/**
 * Shared clay button. `variant` picks the tone; `size` the footprint.
 *
 * Tactile feedback without gimmicks: raised clay by default (top sheen),
 * subtle lift on hover, pressed-inset look on active, accent ring on
 * keyboard focus, faded + not-allowed when disabled.
 */
const variants = {
  primary:
    "bg-accent text-white shadow-clay-accent hover:bg-accent-strong active:shadow-clay-inset-strong",
  neutral:
    "bg-surface text-muted shadow-clay-xs hover:text-accent hover:shadow-clay active:shadow-clay-inset",
  soft: "bg-accent-soft text-accent hover:bg-accent-soft-hover active:shadow-clay-inset",
  danger:
    "bg-danger-soft text-danger shadow-clay-xs hover:bg-danger-soft-hover active:shadow-clay-inset",
  // For colored (accent) surfaces — e.g. the dashboard hero:
  onAccent:
    "bg-white text-accent-strong shadow-clay-xs hover:bg-accent-soft active:shadow-clay-inset",
  onAccentGhost:
    "border border-white/40 bg-white/15 text-white hover:bg-white/25 active:shadow-clay-inset",
};

const sizes = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-4 py-2.5 text-[13px]",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center rounded-clay-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
