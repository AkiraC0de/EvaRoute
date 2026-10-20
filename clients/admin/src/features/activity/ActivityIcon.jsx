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
 * Tone values map to the flat token palette:
 *   neutral = surface chip, primary = navy, success = green, warning = amber
 *   (semantic tones mean the event's status, never decoration).
 */
const ACTION_META = {
  AUTH_LOGIN: { icon: LogIn, tone: "neutral" },
  AUTH_SIGN_OUT: { icon: LogOut, tone: "neutral" },
  AUTH_SIGN_OUT_ALL: { icon: LogOut, tone: "neutral" },
  AUTH_PASSWORD_RESET_REQUESTED: { icon: KeyRound, tone: "warning" },
  AUTH_PASSWORD_RESET: { icon: KeyRound, tone: "warning" },
  FACILITY_CREATED: { icon: Building2, tone: "primary" },
  FACILITY_UPDATED: { icon: Building2, tone: "primary" },
  FACILITY_DELETED: { icon: Building2, tone: "warning" },
  FACILITY_RESTORED: { icon: Building2, tone: "success" },
  STAFF_ACCOUNT_CREATED: { icon: SquareUser, tone: "primary" },
  STAFF_ACCOUNT_UPDATED: { icon: SquareUser, tone: "primary" },
  STAFF_ACTIVATED: { icon: UserRoundCheck, tone: "success" },
  STAFF_DEACTIVATED: { icon: SquareUser, tone: "warning" },
  STAFF_PASSWORD_RESET: { icon: KeyRound, tone: "warning" },
  STAFF_DELETED: { icon: SquareUser, tone: "warning" },
  STAFF_ASSIGNED: { icon: UserRoundCheck, tone: "success" },
  STAFF_DISMISSED: { icon: SquareUser, tone: "warning" },
  RESOURCE_CREATED: { icon: Package, tone: "success" },
  RESOURCE_UPDATED: { icon: Package, tone: "primary" },
  RESOURCE_DELETED: { icon: Package, tone: "warning" },
  STAY_CHECKED_IN: { icon: LogIn, tone: "primary" },
  STAY_CHECKED_OUT: { icon: LogOut, tone: "neutral" },
};

const TONE_CHIP = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
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
