import { Check } from "lucide-react";

/**
 * Brand panel of the sign-in screen (desktop only — small screens get the
 * compact header in LoginPage). The logo asset is designed for light
 * backgrounds, so the panel stays in the portal's pale-blue family; the
 * dashed route line + pins echo the map motif in the logo.
 */

const HIGHLIGHTS = [
  ["Live occupancy", "Track families, adults, and children against capacity."],
  ["Evacuee check-in", "Record every family member — no paperwork lost."],
  ["Resource control", "Know exactly what your center has left."],
];

const BrandPanel = () => (
  <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-[#dfe7fa] via-canvas to-[#cfd9f4] p-10 lg:flex">
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface shadow-clay">
        <img src="./evaRouteLogo.png" alt="EvaRoute logo" className="h-full w-full object-contain" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-[0.3px] text-ink">EvaRoute</p>
        <p className="text-sm font-semibold uppercase tracking-[2px] text-muted">
          Staff Portal
        </p>
      </div>
    </div>

    <div className="relative z-10">
      <h1 className="max-w-95 text-4xl font-bold leading-[1.15] text-ink">
        Every family,
        <br />
        routed to safety.
      </h1>
      <p className="mt-3 max-w-85 text-md leading-relaxed text-[#65718c]">
        Manage your evacuation center in one place — capacity, evacuee
        check-ins, supplies, and staff. Built for the people who keep
        families safe when it matters most.
      </p>

      <ul className="mt-6 space-y-2.5">
        {HIGHLIGHTS.map(([title, caption]) => (
          <li key={title} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
              <Check size={11} strokeWidth={2.5} color="white" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-soft">{title}</p>
              <p className="text-sm leading-relaxed text-muted">{caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/*
      Decorative route: a winding dashed path between two map pins —
      "your route to safety", drawn to match the logo's navigation motif.
    */}
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-6 right-0 w-full opacity-25"
      height="190"
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
    </svg>

    <p className="relative z-10 text-[8px] font-medium uppercase tracking-[1.5px] text-muted-dim">
      Evacuation center operations
    </p>
  </aside>
);

export default BrandPanel;
