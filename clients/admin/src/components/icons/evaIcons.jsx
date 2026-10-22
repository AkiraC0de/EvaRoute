/**
 * EvaRoute icon system — SOLID-FILL icons, our own visual identity (replaces
 * lucide-react everywhere OUTSIDE the shared UI kit; components/ui keeps lucide
 * by directive). This is deliberately NOT an outline set:
 *
 *   - filled silhouettes with carved negative-space counters (windows, doors,
 *     list lines, keyholes punched out via evenodd paths) — solid masses, not
 *     strokes or borders
 *   - generous corner radii echoing the app's rounded-md / rounded-full
 *     language; uniform optical mass on a 24x24 grid
 *   - marks (plus/check/x/arrows) are solid ribbons with round terminals
 *   - the MapPin's circular hole is the "route dot" motif — the set's
 *     signature, borrowed from the EvaRoute pin-and-route logo
 *
 * API is a drop-in for the lucide surface used in this app: `size` (px),
 * `className`, `aria-hidden` and other svg props spread through. `strokeWidth`
 * is accepted for compatibility but inert — the geometry owns its weight so
 * every glyph keeps its shape at any call site. Export names match the lucide
 * names 1:1, so call sites only import from here (aliases keep working).
 */

const EvaIcon = ({ size = 16, strokeWidth, children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    focusable="false"
    strokeWidth={strokeWidth}
    {...props}
  >
    {children}
  </svg>
);


export const Activity = (props) => (
  <EvaIcon {...props}>
    <path d="M2.8 12h3.8l2.6-7 3.8 14 2.6-7h5.6" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </EvaIcon>
);

export const AlertTriangle = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M10.7 3.9 2.4 18.2c-.7 1.2.2 2.8 1.6 2.8h16c1.4 0 2.3-1.6 1.6-2.8L13.3 3.9c-.7-1.2-2-1.2-2.6 0ZM12 8.6c.6 0 1.1.5 1.1 1.1v3.6c0 .6-.5 1.1-1.1 1.1s-1.1-.5-1.1-1.1V9.7c0-.6.5-1.1 1.1-1.1Zm0 6.8c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1.5-1.1 1.1-1.1Z" />
  </EvaIcon>
);

export const Armchair = (props) => (
  <EvaIcon {...props}>
    <rect x="7.2" y="3.6" width="9.6" height="9.4" rx="2.8" />
    <rect x="2.6" y="10.2" width="4.4" height="8.4" rx="2.2" />
    <rect x="17" y="10.2" width="4.4" height="8.4" rx="2.2" />
    <rect x="6.2" y="13.4" width="11.6" height="4" rx="2" />
    <rect x="5.4" y="18.4" width="3.2" height="2.4" rx="1.2" />
    <rect x="15.4" y="18.4" width="3.2" height="2.4" rx="1.2" />
  </EvaIcon>
);

export const ArrowLeft = (props) => (
  <EvaIcon {...props}>
    <rect x="8.6" y="9.6" width="12" height="4.8" rx="2.4" />
    <path d="M11.4 4.4 4.2 12l7.2 7.6c.8.9 2.2.2 2.2-.9V5.3c0-1.1-1.4-1.8-2.2-.9Z" />
  </EvaIcon>
);

export const ArrowLeftRight = (props) => (
  <EvaIcon {...props}>
    <path d="M8.6 2.6 2.2 8l6.4 5.4c.7.6 1.9 0 1.9-.9V9.4h7.2c.8 0 1.4-.6 1.4-1.4v-1.2c0-.8-.6-1.4-1.4-1.4H10.5V3.5c0-.9-1.2-1.5-1.9-.9Z" />
    <path d="M15.4 21.4 21.8 16l-6.4-5.4c-.7-.6-1.9 0-1.9.9v3.1H6.3c-.8 0-1.4.6-1.4 1.4v1.2c0 .8.6 1.4 1.4 1.4h7.2v2.9c0 .9 1.2 1.5 1.9.9Z" />
  </EvaIcon>
);

export const ArrowRight = (props) => (
  <EvaIcon {...props}>
    <rect x="3.4" y="9.6" width="12" height="4.8" rx="2.4" />
    <path d="M12.6 4.4 19.8 12l-7.2 7.6c-.8.9-2.2.2-2.2-.9V5.3c0-1.1 1.4-1.8 2.2-.9Z" />
  </EvaIcon>
);

export const Baby = (props) => (
  <EvaIcon {...props}>
    <circle cx="12" cy="5.8" r="4.3" />
    <path fillRule="evenodd" d="M5 21c0-4.1 3.1-7 7-7s7 2.9 7 7H5Zm2.4-1.6c2.2-1.2 4.6-1.2 6.8 0 1 .5 2.2-.3 2.2-1.4 0-.7-.4-1.3-1-1.6-2.9-1.4-6.3-1.4-9.2 0-.6.3-1 .9-1 1.6 0 1.1 1.2 1.9 2.2 1.4Z" />
  </EvaIcon>
);

export const Bed = (props) => (
  <EvaIcon {...props}>
    <rect x="2.8" y="4.4" width="3.6" height="10.8" rx="1.8" />
    <rect x="5.6" y="11.2" width="15.4" height="4.4" rx="2.2" />
    <rect x="7.8" y="7.6" width="5.8" height="3.6" rx="1.8" />
    <rect x="3" y="15.6" width="3.2" height="3.2" rx="1.3" />
    <rect x="17.6" y="15.6" width="3.2" height="3.2" rx="1.3" />
  </EvaIcon>
);

export const Boxes = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M4.2 12.4h7c.6 0 1 .4 1 1v6.6c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1V13.4c0-.6.4-1 1-1Zm1.2 2v1.8h4.6v-1.8H5.4Z" />
    <path fillRule="evenodd" d="M12.8 12.4h7c.6 0 1 .4 1 1v6.6c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1V13.4c0-.6.4-1 1-1Zm1.2 2v1.8h4.6v-1.8h-4.6Z" />
    <path fillRule="evenodd" d="M8.5 2.4h7c.6 0 1 .4 1 1v6.6c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1V3.4c0-.6.4-1 1-1Zm1.2 2v1.8h4.6V4.4H9.7Z" />
  </EvaIcon>
);

export const Building2 = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M3.6 20.6V6.4c0-1.2 1-2.2 2.2-2.2h5.2c1.2 0 2.2 1 2.2 2.2v14.2h2.4v-8.4c0-1.2 1-2.2 2.2-2.2h2.4c1.2 0 2.2 1 2.2 2.2v8.4H23V22H2v-1.4h1.6ZM6.6 7.6h2.4v2.2H6.6V7.6Zm0 4.4h2.4v2.2H6.6v-2.2Zm0 4.4h2.4v2.2H6.6v-2.2Zm5.4-8.8h1.2v2.2H12V7.6Zm4.6 4.4H18v2.2h-1.4v-2.2Zm0 4.4H18v2.2h-1.4v-2.2Z" />
  </EvaIcon>
);

export const Check = (props) => (
  <EvaIcon {...props}>
    <path d="M20.6 4.8a1.7 1.7 0 0 0-2.5-.1l-8 8.2-3.4-3.3a1.7 1.7 0 1 0-2.3 2.4l4.6 4.6a1.7 1.7 0 0 0 2.5-.1l9.2-9.3a1.7 1.7 0 0 0-.1-2.4Z" />
  </EvaIcon>
);

export const CheckCircle2 = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8Zm5.2 6-6 6.1-2.9-2.8-2 2.1 5 4.8 7.9-8.3-2-1.9Z" />
  </EvaIcon>
);

export const ChevronDown = (props) => (
  <EvaIcon {...props}>
    <path d="M4.6 8.4 12 15.6l7.4-7.2c.9-.9 2.3 0 2.3 1.2v2.2c0 .6-.3 1.1-.8 1.5L12.3 21c-.9.8-2.2.8-3.1 0l-8.6-7.7c-.5-.4-.8-.9-.8-1.5V9.6c0-1.2 1.4-2.1 2.3-1.2Z" transform="translate(0 -1.5)" />
  </EvaIcon>
);

export const ChevronLeft = (props) => (
  <EvaIcon {...props}>
    <path d="M15.6 4.6 8.4 12l7.2 7.4c.9.9 0 2.3-1.2 2.3h-2.2c-.6 0-1.1-.3-1.5-.8L3 12.3c-.8-.9-.8-2.2 0-3.1l7.7-8.6c.4-.5.9-.8 1.5-.8h2.2c1.2 0 2.1 1.4 1.2 2.3Z" transform="translate(1.5 0)" />
  </EvaIcon>
);

export const ChevronRight = (props) => (
  <EvaIcon {...props}>
    <path d="M8.4 4.6 15.6 12l-7.2 7.4c-.9.9 0 2.3 1.2 2.3h2.2c.6 0 1.1-.3 1.5-.8L21 12.3c.8-.9.8-2.2 0-3.1l-7.7-8.6c-.4-.5-.9-.8-1.5-.8h-2.2c-1.2 0-2.1 1.4-1.2 2.3Z" transform="translate(-1.5 0)" />
  </EvaIcon>
);

export const ClipboardList = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M8.4 4.4c0-1.1.9-2 2-2h3.2c1.1 0 2 .9 2 2v.8h1.8c1.2 0 2.2 1 2.2 2.2V20c0 1.2-1 2.2-2.2 2.2H6.4c-1.2 0-2.2-1-2.2-2.2V7.4c0-1.2 1-2.2 2.2-2.2h2V4.4Zm2 2.8h3.2V4.6h-3.2v2.6ZM8 11h6.6v2.1H8V11Zm0 4h6.6v2.1H8V15Zm0 4h4.2v2.1H8V19Z" />
  </EvaIcon>
);

export const Copy = (props) => (
  <EvaIcon {...props}>
    <rect x="3.4" y="3.4" width="10" height="10" rx="2.4" />
    <rect x="10.6" y="10.6" width="10" height="10" rx="2.4" />
  </EvaIcon>
);

export const Cross = (props) => (
  <EvaIcon {...props}>
    <rect x="8.4" y="2.6" width="7.2" height="18.8" rx="3" />
    <rect x="2.6" y="8.4" width="18.8" height="7.2" rx="3" />
  </EvaIcon>
);

export const Download = (props) => (
  <EvaIcon {...props}>
    <rect x="3.6" y="17.4" width="16.8" height="3.6" rx="1.8" />
    <path d="M12 15.8 6.2 9.4h3.2V3.4h5.2v6h3.2L12 15.8Z" />
  </EvaIcon>
);

export const Droplets = (props) => (
  <EvaIcon {...props}>
    <path d="M7.6 3.4c3 3.2 4.5 5.5 4.5 7.3a4.5 4.5 0 1 1-9 0c0-1.8 1.5-4.1 4.5-7.3Z" />
    <path d="M16.4 8.6c1.9 2.1 2.9 3.6 2.9 4.8a2.9 2.9 0 1 1-5.8 0c0-1.2 1-2.7 2.9-4.8Z" />
  </EvaIcon>
);

export const FileSpreadsheet = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M13.4 2.6H7c-1.2 0-2.2 1-2.2 2.2v14.4c0 1.2 1 2.2 2.2 2.2h10c1.2 0 2.2-1 2.2-2.2V8.2l-5.8-5.6ZM8.8 12h6.4v4.6H8.8V12Z" />
  </EvaIcon>
);

export const FileText = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M13.4 2.6H7c-1.2 0-2.2 1-2.2 2.2v14.4c0 1.2 1 2.2 2.2 2.2h10c1.2 0 2.2-1 2.2-2.2V8.2l-5.8-5.6ZM8.8 12.4h6.4v2H8.8v-2Zm0 3.4h6.4v2H8.8v-2Zm0 3.4h3.8v2H8.8v-2Z" />
  </EvaIcon>
);

export const Fingerprint = (props) => (
  <EvaIcon {...props}>
    <path d="M4.4 11.2a7.6 7.6 0 0 1 15.2 0" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M8 12.8a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M12 13.2v5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M16 15c0 2.2-.3 3.8-.9 5.2" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
  </EvaIcon>
);

export const History = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M13.2 2.6a9.4 9.4 0 1 1-9.4 9.4h.3c1 0 1.7-.8 1.7-1.7 0-.9-.7-1.7-1.7-1.7h-.3l2.8-2.9c.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1l-1.1 1.2A7 7 0 1 0 13.2 2.6Zm-1.2 5.2v4.2l3 2.1-1.2 1.8-4.2-2.9V7.8h2.4Z" />
  </EvaIcon>
);

export const Home = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.8a1.6 1.6 0 0 1 1.1.45l8.2 7.4c.7.6.3 1.8-.7 1.8H19.5v7.2a1.6 1.6 0 0 1-1.6 1.6h-2.9v-5.6c0-.9-.7-1.6-1.6-1.6h-2.8c-.9 0-1.6.7-1.6 1.6V21H6.1c-.9 0-1.6-.7-1.6-1.6v-7.2H3.4c-1 0-1.4-1.2-.7-1.8l8.2-7.4c.3-.3.7-.45 1.1-.45Z" />
  </EvaIcon>
);

export const KeyRound = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M8 11.2a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 3.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z" />
    <path d="m11.8 11.8 7.4-7.4c1-1 2.8-.3 2.8 1.1v1.1a1.4 1.4 0 0 1-1.4 1.4h-1.2v2.4a1.4 1.4 0 0 1-1.4 1.4h-1.2v1.6a1.2 1.2 0 0 1-1.2 1.2h-1.4c-1 0-1.6-1.1-1-1.9l.6-.7Z" />
  </EvaIcon>
);

export const LayoutDashboard = (props) => (
  <EvaIcon {...props}>
    <rect x="3.2" y="3.2" width="7.4" height="9.2" rx="1.8" />
    <rect x="13.4" y="3.2" width="7.4" height="5.4" rx="1.8" />
    <rect x="13.4" y="11.6" width="7.4" height="9.2" rx="1.8" />
    <rect x="3.2" y="15.4" width="7.4" height="5.4" rx="1.8" />
  </EvaIcon>
);

export const Lock = (props) => (
  <EvaIcon {...props}>
    <path d="M8 9.4V7.6a4 4 0 0 1 8 0v1.8" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" d="M5 10.6h14c1.1 0 2 .9 2 2v7.2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-7.2c0-1.1.9-2 2-2Zm7 3.4c-.8 0-1.4.6-1.4 1.4v1.6h2.8v-1.6c0-.8-.6-1.4-1.4-1.4Z" />
  </EvaIcon>
);

export const LogIn = (props) => (
  <EvaIcon {...props}>
    <g transform="rotate(45 12 12)">
      <rect x="3.4" y="9.6" width="12" height="4.8" rx="2.4" />
      <path d="M12.6 4.4 19.8 12l-7.2 7.6c-.8.9-2.2.2-2.2-.9V5.3c0-1.1 1.4-1.8 2.2-.9Z" />
    </g>
  </EvaIcon>
);

export const LogOut = (props) => (
  <EvaIcon {...props}>
    <g transform="rotate(-45 12 12)">
      <rect x="3.4" y="9.6" width="12" height="4.8" rx="2.4" />
      <path d="M12.6 4.4 19.8 12l-7.2 7.6c-.8.9-2.2.2-2.2-.9V5.3c0-1.1 1.4-1.8 2.2-.9Z" />
    </g>
  </EvaIcon>
);

export const MapPin = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.4c-4.4 0-8 3.5-8 7.9 0 4.3 5.1 9.1 7 11a1.4 1.4 0 0 0 2 0c1.9-1.9 7-6.7 7-11 0-4.4-3.6-7.9-8-7.9Zm0 5a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z" />
  </EvaIcon>
);

export const Minus = (props) => (
  <EvaIcon {...props}>
    <rect x="3.8" y="9.8" width="16.4" height="4.4" rx="2.2" />
  </EvaIcon>
);

export const MonitorOff = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M4 4.6h16c1.2 0 2.2 1 2.2 2.2v8.6c0 1.2-1 2.2-2.2 2.2H4c-1.2 0-2.2-1-2.2-2.2V6.8C1.8 5.6 2.8 4.6 4 4.6Zm1.2 2.4v7.6h13.6V7H5.2ZM8.4 19.2h7.2v1.6H8.4v-1.6Z" />
    <rect x="10.7" y="16.4" width="2.6" height="4.4" rx="1.3" />
    <rect x="2.4" y="10.7" width="19.2" height="2.6" rx="1.3" transform="rotate(-43 12 12)" />
  </EvaIcon>
);

export const Navigation = (props) => (
  <EvaIcon {...props}>
    <path d="M21.2 2.8c.8-.4 1.6.4 1.2 1.2l-7.4 17.2c-.4.8-1.5.7-1.7-.2l-2-7-7-2c-.9-.2-1-1.3-.2-1.7L21.2 2.8Z" />
  </EvaIcon>
);

export const Package = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.4c-.5 0-1 .13-1.4.4L3.6 6.2c-.9.5-1.4 1.4-1.4 2.4v7.2c0 1 .5 1.9 1.4 2.4l7 3.6c.9.5 2 .5 2.8 0l7-3.6c.9-.5 1.4-1.4 1.4-2.4V8.6c0-1-.5-1.9-1.4-2.4l-7-3.4c-.4-.27-.9-.4-1.4-.4Zm-1.2 4.3v2.4L13 10.4l2.2-1.2L12 7.3l-.8.5-.4-.1Z" />
    <path d="M4 8.2 12 12l8-3.8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </EvaIcon>
);

export const Pencil = (props) => (
  <EvaIcon {...props}>
    <path d="m15.2 3.6 5.2 5.2-9.9 9.9-5.2 1 1-5.2 9.9-9.9Z" />
  </EvaIcon>
);

export const Plus = (props) => (
  <EvaIcon {...props}>
    <rect x="9.8" y="3.8" width="4.4" height="16.4" rx="2.2" />
    <rect x="3.8" y="9.8" width="16.4" height="4.4" rx="2.2" />
  </EvaIcon>
);

export const Power = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.6c-5.2 0-9.4 4.2-9.4 9.4s4.2 9.4 9.4 9.4 9.4-4.2 9.4-9.4c0-2.3-.8-4.4-2.2-6.1-.6-.8-1.8-.6-2.3.2-.4.7-.1 1.5.6 1.9 1 1 1.6 2.3 1.6 3.8a7.1 7.1 0 1 1-14.2 0c0-1.5.6-2.9 1.6-3.8.7-.5 1-1.3.6-2-.5-.8-1.7-1-2.3-.3A9.3 9.3 0 0 0 12 2.6Z" />
    <rect x="10" y="1.8" width="4" height="10" rx="2" />
  </EvaIcon>
);

export const Printer = (props) => (
  <EvaIcon {...props}>
    <rect x="6.6" y="2.8" width="10.8" height="5.2" rx="1.4" />
    <path fillRule="evenodd" d="M4 8.6h16c1.2 0 2.2 1 2.2 2.2v5.4c0 1.2-1 2.2-2.2 2.2h-1.6v-2.4H5.6V18.4H4c-1.2 0-2.2-1-2.2-2.2v-5.4c0-1.2 1-2.2 2.2-2.2Z" />
    <rect x="5.6" y="13.8" width="12.8" height="6.6" rx="1.4" />
  </EvaIcon>
);

export const RefreshCw = (props) => (
  <EvaIcon {...props}>
    <path d="M12 3.6a8.4 8.4 0 0 1 8 5.7c.2.7-.3 1.4-1 1.4h-3.3c-.6 0-1.1-.5-1-1.1.3-1.2-.4-2.4-1.6-2.7a2 2 0 0 0-2.3 1.3l-.2.6c-.2.7-1 1-1.6.7-.7-.2-1-1-.7-1.6l.2-.6A8.4 8.4 0 0 1 12 3.6Z" />
    <path d="M12 20.4a8.4 8.4 0 0 1-8-5.7c-.2-.7.3-1.4 1-1.4h3.3c.6 0 1.1.5 1 1.1-.3 1.2.4 2.4 1.6 2.7a2 2 0 0 0 2.3-1.3l.2-.6c.2-.7 1-1 1.6-.7.7.2 1 1 .7 1.6l-.2.6a8.4 8.4 0 0 1-3.5 3.7Z" />
  </EvaIcon>
);

export const RotateCcw = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 3.2a8.8 8.8 0 1 1-8.3 6c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8h-2c-.8 0-1.3-.8-1-1.5A11 11 0 1 0 12 3.2Z" />
    <rect x="1.6" y="4.4" width="4" height="8.4" rx="2" transform="rotate(-45 3.6 8.6)" />
  </EvaIcon>
);

export const RotateCw = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 3.2a8.8 8.8 0 1 0 8.3 6c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8h2c.8 0 1.3-.8 1-1.5A11 11 0 1 1 12 3.2Z" />
    <rect x="18.4" y="4.4" width="4" height="8.4" rx="2" transform="rotate(45 20.4 8.6)" />
  </EvaIcon>
);

export const Search = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M10.6 2.8a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm0 3.2a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Z" />
    <rect x="14.2" y="13.6" width="8.4" height="4.4" rx="2.2" transform="rotate(45 18.4 15.8)" />
  </EvaIcon>
);

export const ShieldCheck = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M12 2.2c-.5 0-1 .2-1.4.5l-6.6 3.8c-.5.3-.8.9-.8 1.5v4.4c0 4.9 3.1 8.6 6.9 10.5.5.2 1.1.2 1.6 0 3.8-1.9 6.9-5.6 6.9-10.5V8c0-.6-.3-1.2-.8-1.5l-6.6-3.8c-.3-.3-.8-.5-1.4-.5Zm4.9 8-5.8 5.8-2.9-2.7-1.9 2 4.8 4.6 7.7-7.9-1.9-1.8Z" />
  </EvaIcon>
);

export const Signpost = (props) => (
  <EvaIcon {...props}>
    <rect x="10.4" y="3" width="3.4" height="18" rx="1.7" />
    <path d="M12.8 4.2h5.8c1 0 1.8.4 2.4 1.2.4.6.3 1.4-.2 1.9-.5.5-.6 1.2-.2 1.8.5.7 1.4 1.1 2.3 1.1H12.8V4.2Z" />
    <path d="M11.2 12.2H5.4c-1 0-1.8.4-2.4 1.2-.4.6-.3 1.4.2 1.9.5.5.6 1.2.2 1.8-.5.7-1.4 1.1-2.3 1.1h10.1v-6Z" />
  </EvaIcon>
);

export const SquareUser = (props) => (
  <EvaIcon {...props}>
    <path fillRule="evenodd" d="M7.4 2.8h9.2c2.6 0 4.6 2 4.6 4.6v9.2c0 2.6-2 4.6-4.6 4.6H7.4c-2.6 0-4.6-2-4.6-4.6V7.4c0-2.6 2-4.6 4.6-4.6ZM12 7.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm-4.6 9.8c.5-2.2 2.3-3.6 4.6-3.6s4.1 1.4 4.6 3.6H7.4Z" />
  </EvaIcon>
);

export const Toilet = (props) => (
  <EvaIcon {...props}>
    <rect x="3.6" y="3" width="6.2" height="8.4" rx="1.8" />
    <path fillRule="evenodd" d="M9.8 7.2h2.6c3 0 5.4 2.4 5.4 5.4 0 3-2.4 5.4-5.4 5.4H7.8c-.7 0-1.3-.6-1.3-1.3V8.5c0-.7.6-1.3 1.3-1.3h2Zm-.6 2v6.8h2c1.5 0 2.8-1.3 2.8-2.8s-1.3-2.8-2.8-2.8h-2Z" />
    <rect x="10.6" y="17.4" width="2.8" height="2.6" rx="1.3" />
    <rect x="7.8" y="19.4" width="8.4" height="2.6" rx="1.3" />
  </EvaIcon>
);

export const Trash2 = (props) => (
  <EvaIcon {...props}>
    <rect x="3.4" y="3.8" width="17.2" height="3.6" rx="1.8" />
    <path fillRule="evenodd" d="M6.4 8.4h11.2c.5 0 .9.2 1.1.6l1 2.4c.3.7-.2 1.5-1 1.5H5.3c-.8 0-1.3-.8-1-1.5l1-2.4c.2-.4.6-.6 1.1-.6ZM6.8 14h1.8v6H6.8v-6Zm4.3 0h1.8v6h-1.8v-6Zm4.3 0h1.8v6h-1.8v-6Z" />
  </EvaIcon>
);

export const TrendingDown = (props) => (
  <EvaIcon {...props}>
    <path d="M2.8 8.4 8.6 14.2l3.4-3.4 4.4 4.4v-3.6c0-1.1-1.3-1.8-2.2-1l-2.6 2.6-3.4-3.4c-.9-.9-2.2-.2-2.2 1v2.2l-3.2-3.2Z" />
    <path d="M14.6 19.8h3.4v-3.6h2.2c1 0 1.6-1.1 1-1.9l-4.8-5.6c-.6-.7-1.6-.7-2.1 0l-4.8 5.6c-.6.8 0 1.9 1 1.9h2.2v3.6Z" transform="rotate(-45 16.4 15.4)" />
  </EvaIcon>
);

export const TrendingUp = (props) => (
  <EvaIcon {...props}>
    <path d="M2.8 15.6 8.6 9.8l3.4 3.4 4.4-4.4v3.6c0 1.1-1.3 1.8-2.2 1l-2.6-2.6-3.4 3.4c-.9.9-2.2.2-2.2-1v-2.2l-3.2 3.2Z" />
    <path d="M14.6 4.2h3.4v3.6h2.2c1 0 1.6 1.1 1 1.9l-4.8 5.6c-.6.7-1.6.7-2.1 0l-4.8-5.6c-.6-.8 0-1.9 1-1.9h2.2V4.2Z" transform="rotate(45 16.4 8.6)" />
  </EvaIcon>
);

export const UserCheck = (props) => (
  <EvaIcon {...props}>
    <circle cx="9.4" cy="7.8" r="4" />
    <path d="M2.8 20.8c0-3.7 2.9-6.2 6.6-6.2s6.6 2.5 6.6 6.2H2.8Z" />
    <path d="M21.8 11.6a1.4 1.4 0 0 0-2.2-.2l-2.8 2.8-1-1a1.4 1.4 0 1 0-2 2l2.1 2.1a1.4 1.4 0 0 0 2.1-.1l3.7-3.8c.4-.5.5-1.2.1-1.8Z" />
  </EvaIcon>
);

export const UserPlus = (props) => (
  <EvaIcon {...props}>
    <circle cx="9.4" cy="7.8" r="4" />
    <path d="M2.8 20.8c0-3.7 2.9-6.2 6.6-6.2s6.6 2.5 6.6 6.2H2.8Z" />
    <rect x="17.4" y="6.6" width="2.8" height="10" rx="1.4" />
    <rect x="13.8" y="10.2" width="10" height="2.8" rx="1.4" />
  </EvaIcon>
);

export const UserRound = (props) => (
  <EvaIcon {...props}>
    <circle cx="12" cy="7.8" r="4.2" />
    <path d="M4.8 20.8c0-3.9 3.2-6.5 7.2-6.5s7.2 2.6 7.2 6.5H4.8Z" />
  </EvaIcon>
);

export const UserRoundCheck = (props) => (
  <EvaIcon {...props}>
    <circle cx="10.6" cy="7.8" r="4.2" />
    <path d="M3.6 20.8c0-3.4 2.6-5.8 5.8-6.3 1-.2 2-.1 2.9.2l-1 2c-2.5.3-4.5 2-4.5 4.1h-3.2Z" />
    <path d="M21.8 14.6a1.4 1.4 0 0 0-2.2-.2l-2.8 2.8-1-1a1.4 1.4 0 1 0-2 2l2.1 2.1a1.4 1.4 0 0 0 2.1-.1l3.7-3.8c.4-.5.5-1.2.1-1.8Z" />
  </EvaIcon>
);

export const Users = (props) => (
  <EvaIcon {...props}>
    <circle cx="8.8" cy="7.8" r="3.8" />
    <path d="M2.4 20.8c0-3.5 2.8-6 6.4-6s6.4 2.5 6.4 6H2.4Z" />
    <circle cx="16.6" cy="8.6" r="3" />
    <path d="M16.6 13.2c2.6 0 5 1.9 5 4.8h-4.4c0-1.9-.7-3.4-1.8-4.5.4-.2.8-.3 1.2-.3Z" />
  </EvaIcon>
);

export const UsersRound = (props) => (
  <EvaIcon {...props}>
    <circle cx="8.6" cy="8" r="3.9" />
    <path d="M2.2 20.8c0-3.5 2.8-6 6.4-6s6.4 2.5 6.4 6H2.2Z" />
    <circle cx="16.4" cy="9" r="3" />
    <path d="M16.4 13.5c2.6 0 4.9 1.9 4.9 4.8h-4.2c0-1.9-.7-3.4-1.8-4.4.4-.3.7-.4 1.1-.4Z" />
  </EvaIcon>
);

export const UtensilsCrossed = (props) => (
  <EvaIcon {...props}>
    <path d="M6.6 2.4c1.3 0 2.4 1.1 2.4 2.4v4.8a2.4 2.4 0 0 1-1.8 2.3V21.4a1.2 1.2 0 0 1-2.4 0V11.9a2.4 2.4 0 0 1-1.8-2.3V4.8c0-1.3 1.1-2.4 2.4-2.4h1.2Z" />
    <path d="m13.2 21.6 7.4-7.4c.7-.7.7-1.8 0-2.5l-1.9-1.9 1.5-1.5c1-1 .2-2.8-1.1-2.8-.5 0-1.1.2-1.4.7l-8.7 8.7c-.6.6-.6 1.5 0 2.1l2.1 2.1-2.3 2.3c-.7.7-.2 1.9.8 1.9h2.4c.7 0 1.3-.3 1.7-.8Z" />
  </EvaIcon>
);

export const X = (props) => (
  <EvaIcon {...props}>
    <path d="M12 10.2 5.6 3.8a1.5 1.5 0 0 0-2.1 2.1l6.4 6.4-6.4 6.4a1.5 1.5 0 1 0 2.1 2.1l6.4-6.4 6.4 6.4a1.5 1.5 0 0 0 2.1-2.1l-6.4-6.4 6.4-6.4a1.5 1.5 0 0 0-2.1-2.1l-6.4 6.4Z" />
  </EvaIcon>
);

export const Zap = (props) => (
  <EvaIcon {...props}>
    <path d="M13.2 2.2c.7-.3 1.5.3 1.3 1l-1.7 7.2h4.7c.9 0 1.3 1 .8 1.7l-8.7 9.7c-.5.6-1.5.2-1.4-.6l1.5-7.1H6c-.8 0-1.2-.9-.8-1.6l7.2-9.2c.2-.4.5-.6.8-.7Z" />
  </EvaIcon>
);
