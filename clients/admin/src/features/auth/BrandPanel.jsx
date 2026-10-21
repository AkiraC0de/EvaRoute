import { Boxes, Check, ClipboardList, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { authVariants } from "./authMotion";

/**
 * Brand panel of the sign-in screen (desktop only — small screens get the
 * compact header in LoginPage). Flat "Operations Console" brand panel: a
 * deep-navy field (the one sanctioned --hero-gradient) with white type, and
 * the EvaRoute map/route/pin motif redrawn in white/teal/warm accents.
 * Highlight icon tiles carry category tints (navy=occupancy, teal=people,
 * warm=places). Contents cascade in on first paint (authMotion stagger);
 * motion respects reduced-motion.
 */

const HIGHLIGHTS = [
  [Users, "Live occupancy", "Track families, adults, and children against capacity.", "bg-primary-soft text-primary-ink"],
  [ClipboardList, "Evacuee check-in", "Record every family member — no paperwork lost.", "bg-secondary-soft text-secondary-ink"],
  [Boxes, "Resource control", "Know exactly what your center has left.", "bg-warm-soft text-warm-ink"],
];

/** Flowing route lines (FloatingPaths pattern, adapted to curves that
 *  read as travel routes; reduced motion freezes them). Tinted
 *  white / teal / warm against the navy panel. */
const RouteFlows = () => {
  const reduce = useReducedMotion();
  const lines = [
    { d: "M-60 300 C 140 210, 260 360, 460 250 S 760 110, 900 180", width: 1.2, opacity: 0.25, duration: 22, strokeClass: "stroke-white" },
    { d: "M-60 380 C 160 300, 300 430, 500 320 S 780 190, 900 250", width: 1.6, opacity: 0.3, duration: 17, strokeClass: "stroke-secondary-soft" },
    { d: "M-60 220 C 120 150, 280 270, 470 170 S 760 40, 900 110", width: 0.9, opacity: 0.22, duration: 26, strokeClass: "stroke-warm-soft" },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 840 520" fill="none" preserveAspectRatio="xMidYMid slice">
        {lines.map((line) => (
          <motion.path
            key={line.d}
            d={line.d}
            className={line.strokeClass}
            strokeWidth={line.width}
            strokeLinecap="round"
            initial={{ pathLength: 0.35 }}
            animate={reduce ? undefined : { pathLength: 1, pathOffset: [0, 1, 0] }}
            transition={{ duration: line.duration, repeat: Infinity, ease: "linear" }}
            opacity={line.opacity}
          />
        ))}
      </svg>
    </div>
  );
};

const BrandPanel = () => {
  const reduce = useReducedMotion();
  const v = authVariants(reduce);

  return (
    <motion.aside
      variants={v.stagger}
      initial="hidden"
      animate="show"
      className="relative hidden max-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto bg-primary-strong p-8 lg:flex lg:p-10"
      style={{ backgroundImage: "var(--hero-gradient)" }}
    >
      <RouteFlows />

      {/* Brand lockup */}
      <motion.div variants={v.fadeUp} className="relative z-10 flex shrink-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ">
          <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-[26px] font-bold tracking-[0.3px] text-white">EvaRoute</p>
          <p className="text-[16px] font-semibold uppercase tracking-[2px] text-white/70">
            Staff Portal
          </p>
        </div>
      </motion.div>

      {/* Mission + highlights */}
      <motion.div variants={v.fadeUp} className="relative z-10">
        <h1 className="max-w-95 text-[38px] font-bold leading-[1.15] text-white">
          Every family,
          <br />
          routed to safety.
        </h1>
        <p className="mt-3 max-w-115 text-[18px] leading-relaxed text-white/75">
          Manage your evacuation center in one place — capacity, evacuee
          check-ins, supplies, and staff. Built for the people who keep
          families safe when it matters most.
        </p>

        <ul className="mt-6 space-y-3.5">
          {HIGHLIGHTS.map(([Icon, title, caption, tint]) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-md border border-white/15 bg-white/10 px-3.5 py-3"
            >
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tint}`}>
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white">{title}</p>
                <p className="text-[14px] leading-relaxed text-white/70">{caption}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Anchored route mark — the logo's navigation motif (dashed route
          between two map pins), kept as the brand signature, re-tinted to
          white on navy. Confined to the bottom-RIGHT so it never crosses the
          bottom-left caption. */}
      <motion.svg
        variants={v.fadeIn}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[130px] w-[52%] opacity-40"
        viewBox="0 0 520 190"
        fill="none"
      >
        <path
          d="M-10 160 C 80 150, 90 90, 170 92 S 280 130, 340 84 S 440 36, 530 46"
          className="stroke-white"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
        <g transform="translate(30,132)">
          <circle cx="12" cy="12" r="11" className="fill-white" opacity="0.25" />
          <circle cx="12" cy="12" r="5.5" className="fill-white" />
        </g>
        <g transform="translate(478,22)">
          <path
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z"
            className="fill-white"
          />
          <circle cx="12" cy="12" r="5" className="fill-primary" />
        </g>
      </motion.svg>

      <motion.p
        variants={v.fadeUp}
        className="relative z-10 flex shrink-0 items-center gap-2 pb-1 pt-4 text-[10px] font-medium uppercase tracking-[1.5px] text-white/70"
      >
        <Check size={10} strokeWidth={3} aria-hidden="true" />
        Evacuation center operations
      </motion.p>
    </motion.aside>
  );
};

export default BrandPanel;
