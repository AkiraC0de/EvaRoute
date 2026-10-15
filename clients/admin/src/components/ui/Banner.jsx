/**
 * Message banner used for errors, warnings, info and success notices.
 *
 * Centralises the tone palette + accessibility role so every screen surfaces
 * feedback identically. Callers pass their own sizing classes to preserve
 * their exact look; the default matches the most common variant.
 */
const TONES = {
  error: { wrap: "bg-danger-soft font-semibold text-danger", role: "alert" },
  warning: { wrap: "bg-warning-soft font-medium text-warning", role: "status" },
  info: { wrap: "bg-sunken text-[#65718c]", role: "status" },
  success: { wrap: "bg-success-soft font-medium text-success", role: "status" },
};

const Banner = ({ tone = "info", className = "px-3 py-2 text-[10px]", children }) => {
  const palette = TONES[tone] ?? TONES.info;

  return (
    <div
      role={palette.role}
      className={`rounded-clay-sm shadow-clay-inset ${palette.wrap} ${className}`}
    >
      {children}
    </div>
  );
};

export default Banner;
