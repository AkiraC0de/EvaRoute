/**
 * Message banner used for errors, warnings, info and success notices.
 *
 * Centralises the tone palette + accessibility role so every screen surfaces
 * feedback identically. Callers pass their own sizing classes to preserve
 * their exact look; the default matches the most common variant.
 */
const TONES = {
  error: { wrap: "bg-[#fbe4e3] font-semibold text-[#d8322d]", role: "alert" },
  warning: { wrap: "bg-[#fff3d9] font-medium text-[#a96a00]", role: "status" },
  info: { wrap: "bg-[#f6f8fc] text-[#65718c]", role: "status" },
  success: { wrap: "bg-[#e2f4e8] font-medium text-[#1f7a3d]", role: "status" },
};

const Banner = ({ tone = "info", className = "px-3 py-2 text-[10px]", children }) => {
  const palette = TONES[tone] ?? TONES.info;

  return (
    <div role={palette.role} className={`rounded-xl ${palette.wrap} ${className}`}>
      {children}
    </div>
  );
};

export default Banner;
