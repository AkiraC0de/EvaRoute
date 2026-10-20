/**
 * Shared button. `variant` picks the tone; `size` the footprint.
 *
 * Flat and restrained: fill contrast and hairline borders instead of molded
 * depth. Accent ring on keyboard focus, faded + not-allowed when disabled.
 */
const variants = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary: "bg-secondary text-white hover:bg-secondary-strong",
  warm: "bg-warm text-white hover:bg-warm-strong",
  warning: "bg-warning-soft text-warning hover:bg-surface-2",
  neutral: "border border-line-strong bg-surface text-ink-soft hover:bg-surface-2 hover:text-ink",
  soft: "bg-primary-soft text-primary hover:bg-primary-soft-hover",
  softSecondary: "bg-secondary-soft text-secondary hover:bg-secondary-soft-hover",
  softWarm: "bg-warm-soft text-warm hover:bg-warm-soft-hover",
  danger: "bg-danger-soft text-danger hover:bg-danger-soft-hover",
  // For colored (primary) surfaces — e.g. the dashboard hero:
  onPrimary: "bg-white text-primary-strong hover:bg-primary-soft",
  onPrimaryGhost: "border border-white/40 bg-white/15 text-white hover:bg-white/25",
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
    className={`inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
