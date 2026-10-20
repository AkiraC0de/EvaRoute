/**
 * Shared button. `variant` picks the tone; `size` the footprint.
 *
 * Flat and restrained: fill contrast and hairline borders instead of molded
 * depth. Accent ring on keyboard focus, faded + not-allowed when disabled.
 */
const variants = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary: "bg-secondary text-white hover:bg-secondary-strong",
  warm: "bg-warm text-ink hover:bg-warm-strong",
  warning: "bg-warning-soft text-warning hover:bg-surface-2",
  neutral: "border border-line-strong bg-surface text-ink-soft hover:bg-surface-2 hover:text-ink",
  soft: "bg-primary-soft text-primary-ink hover:bg-primary-soft-hover",
  softSecondary: "bg-secondary-soft text-secondary-ink hover:bg-secondary-soft-hover",
  softWarm: "bg-warm-soft text-warm-ink hover:bg-warm-soft-hover",
  danger: "bg-danger-soft text-danger hover:bg-danger-soft-hover",
  // For colored (primary) surfaces — e.g. the dashboard hero:
  onPrimary: "bg-white text-primary-strong hover:bg-primary-soft",
  onPrimaryGhost: "border border-white/55 bg-transparent text-white hover:border-white/75 hover:bg-white/15",
};

const sizes = {
  sm: "px-3 py-1.5 text-micro",
  md: "px-4 py-2.5 text-[13px]",
  lg: "px-5 py-3 text-body",
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
    className={`inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
