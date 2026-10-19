import { Boxes, Check, ClipboardList, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { authVariants } from "./authMotion";

/**
 * Brand panel of the sign-in screen (desktop only — small screens get the
 * compact header in LoginPage). Redesigned around the 21st "Split Login"
 * anatomy: brand mark top, a short mission statement, and decorative
 * flowing paths behind everything — themed here as ROUTES (the app's map
 * motif), with the dashed route + pins kept as the anchored brand mark.
 * The logo asset is designed for light backgrounds, so the panel stays in
 * the portal's pale-blue family. Contents cascade in on first paint
 * (authMotion stagger); motion respects reduced-motion.
 */

const HIGHLIGHTS = [
  [Users, "Live occupancy", "Track families, adults, and children against capacity."],
  [ClipboardList, "Evacuee check-in", "Record every family member — no paperwork lost."],
  [Boxes, "Resource control", "Know exactly what your center has left."],
];

/** Flowing route lines (21st FloatingPaths pattern, adapted to curves that
 *  read as travel routes; reduced motion freezes them). */
const RouteFlows = () => {
  const reduce = useReducedMotion();
  const lines = [
    { d: "M-60 300 C 140 210, 260 360, 460 250 S 760 110, 900 180", width: 1.2, opacity: 0.16, duration: 22 },
    { d: "M-60 380 C 160 300, 300 430, 500 320 S 780 190, 900 250", width: 1.6, opacity: 0.22, duration: 17 },
    { d: "M-60 220 C 120 150, 280 270, 470 170 S 760 40, 900 110", width: 0.9, opacity: 0.12, duration: 26 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 840 520" fill="none" preserveAspectRatio="xMidYMid slice">
        {lines.map((line) => (
          <motion.path
            key={line.d}
            d={line.d}
            stroke="#5269ef"
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
      className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#dfe7fa] via-canvas to-[#cfd9f4] p-10 lg:flex"
    >
      <RouteFlows />

      {/* Brand lockup */}
      <motion.div variants={v.fadeUp} className="relative z-10 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface shadow-clay">
          <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-[26px] font-bold tracking-[0.3px] text-ink">EvaRoute</p>
          <p className="text-[16px] font-semibold uppercase tracking-[2px] text-muted">
            Staff Portal
          </p>
        </div>
      </motion.div>

      {/* Mission + highlights */}
      <motion.div variants={v.fadeUp} className="relative z-10">
        <h1 className="max-w-95 text-[38px] font-bold leading-[1.15] text-ink">
          Every family,
          <br />
          routed to safety.
        </h1>
        <p className="mt-3 max-w-115 text-[18px] leading-relaxed text-[#65718c]">
          Manage your evacuation center in one place — capacity, evacuee
          check-ins, supplies, and staff. Built for the people who keep
          families safe when it matters most.
        </p>

        <ul className="mt-6 space-y-3.5">
          {HIGHLIGHTS.map(([Icon, title, caption]) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-clay-sm bg-surface/70 px-3.5 py-3 shadow-clay-xs backdrop-blur-xs"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent">
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-ink-soft">{title}</p>
                <p className="text-[14px] leading-relaxed text-muted">{caption}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Anchored route mark — the logo's navigation motif (dashed route
          between two map pins), kept as the brand signature. Confined to the
          bottom-RIGHT so it never crosses the bottom-left caption. */}
      <motion.svg
        variants={v.fadeIn}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[130px] w-[52%] opacity-25"
        viewBox="0 0 520 190"
        fill="none"
      >
        <path
          d="M-10 160 C 80 150, 90 90, 170 92 S 280 130, 340 84 S 440 36, 530 46"
          stroke="#5269ef"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
        <g transform="translate(30,132)">
          <circle cx="12" cy="12" r="11" fill="#5269ef" opacity="0.25" />
          <circle cx="12" cy="12" r="5.5" fill="#5269ef" />
        </g>
        <g transform="translate(478,22)">
          <path
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z"
            fill="#5269ef"
          />
          <circle cx="12" cy="12" r="5" fill="#e9edf7" />
        </g>
      </motion.svg>

      <motion.p
        variants={v.fadeUp}
        className="relative z-10 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dim"
      >
        <Check size={10} strokeWidth={3} aria-hidden="true" />
        Evacuation center operations
      </motion.p>
    </motion.aside>
  );
};

export default BrandPanel;
