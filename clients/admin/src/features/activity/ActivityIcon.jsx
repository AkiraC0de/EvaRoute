import {
  Building2,
  KeyRound,
  LogIn,
  LogOut,
  Package,
  ShieldCheck,
  SquareUser,
  UserRoundCheck,
} from "lucide-react";

/**
 * Action -> icon + tone mapping shared by every activity surface.
 * Tone values map to the clay palette:
 *   neutral = muted slate chip, accent = indigo, success = green, warning = amber.
 */
const ACTION_META = {
  AUTH_LOGIN: { icon: LogIn, tone: "neutral" },
  AUTH_SIGN_OUT: { icon: LogOut, tone: "neutral" },
  AUTH_SIGN_OUT_ALL: { icon: LogOut, tone: "neutral" },
  AUTH_PASSWORD_RESET_REQUESTED: { icon: KeyRound, tone: "warning" },
  AUTH_PASSWORD_RESET: { icon: KeyRound, tone: "warning" },
  FACILITY_CREATED: { icon: Building2, tone: "accent" },
  FACILITY_UPDATED: { icon: Building2, tone: "accent" },
  FACILITY_DELETED: { icon: Building2, tone: "warning" },
  FACILITY_RESTORED: { icon: Building2, tone: "success" },
  STAFF_ACCOUNT_CREATED: { icon: SquareUser, tone: "accent" },
  STAFF_ACCOUNT_UPDATED: { icon: SquareUser, tone: "accent" },
  STAFF_ACTIVATED: { icon: UserRoundCheck, tone: "success" },
  STAFF_DEACTIVATED: { icon: SquareUser, tone: "warning" },
  STAFF_PASSWORD_RESET: { icon: KeyRound, tone: "warning" },
  STAFF_DELETED: { icon: SquareUser, tone: "warning" },
  STAFF_ASSIGNED: { icon: UserRoundCheck, tone: "success" },
  STAFF_DISMISSED: { icon: SquareUser, tone: "warning" },
  RESOURCE_CREATED: { icon: Package, tone: "success" },
  RESOURCE_UPDATED: { icon: Package, tone: "accent" },
  RESOURCE_DELETED: { icon: Package, tone: "warning" },
  STAY_CHECKED_IN: { icon: LogIn, tone: "accent" },
  STAY_CHECKED_OUT: { icon: LogOut, tone: "neutral" },
};

const TONE_CHIP = {
  neutral: "bg-slate-300/80 text-slate-700",
  accent: "bg-accent/12 text-accent",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
};

/** Icon chip for one log row. */
export default function ActivityIcon({ log, className = "" }) {
  const meta = ACTION_META[log.action] ?? { icon: ShieldCheck, tone: "neutral" };
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CHIP[meta.tone]} ${className}`}
    >
      <Icon size={15} />
    </span>
  );
}
