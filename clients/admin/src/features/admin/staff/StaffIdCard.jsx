import { useState } from "react";
import {
  Pencil,
  Building2,
  KeyRound,
  Power,
  Trash2,
  RotateCw,
} from "../../../components/icons/evaIcons";
import { motion, useReducedMotion } from "motion/react";
import CopyId from "../../../components/ui/CopyId";

/**
 * Staff ID credential — a CR80-style landscape card with a real front/back:
 * the FRONT carries the staff details (lanyard tab, broken-frame accents,
 * offset photo frame, two-tone name, colon-aligned data rows) and the BACK
 * carries the action buttons plus a small authorized-details strip. Click
 * the card (or the corner chip) to flip it — 3D rotateY, spring-free ease,
 * instant under reduced motion.
 *
 * Actions live on the back only; each keeps its 44px labelled target and
 * stops propagation so pressing it never flips the card. Danger stays
 * isolated (delete is the only danger-tinted action).
 */
const StaffIdCard = ({ staff, isSelf, onEdit, onAssign, onAction }) => {
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();

  const fullName =
    staff.firstName || staff.lastName
      ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
      : "Unnamed staff";
  const nameParts = fullName.split(" ");
  const nameTail = nameParts.length > 1 ? nameParts.pop() : "";
  const initials =
    `${staff.firstName ?? ""} ${staff.lastName ?? ""}`
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || (staff.email ?? "?")[0].toUpperCase();
  const joined = new Date(staff.createdAt);
  const joinedLabel = Number.isNaN(joined.getTime())
    ? "—"
    : joined.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const memberId = `ID-${String(staff.id ?? "").slice(0, 8).toUpperCase()}`;

  return (
    <article
      aria-label={`Staff ID card for ${fullName}`}
      className="relative pt-2.5"
    >
      {/* Lanyard tab + punch hole (reference motif), static above the flip. */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 flex h-5 w-16 -translate-x-1/2 items-start justify-center rounded-t-full border border-b-0 border-line bg-surface-2 pt-1"
      >
        <span className="h-2.5 w-2.5 rounded-full border border-line bg-surface" />
      </div>

      <div style={{ perspective: 1200 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative aspect-[3/2] w-full cursor-pointer"
          onClick={() => setFlipped((value) => !value)}
        >
          {/* ───────────── FRONT — staff details ───────────── */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-primary bg-surface"
          >
            <CardPattern variant="front" />

            {/* Broken-frame accents (square corners, per the reference). */}
            <span aria-hidden="true" className="absolute left-0 top-0 h-1.5 w-[38%] bg-primary" />
            <span aria-hidden="true" className="absolute right-0 top-0 h-1.5 w-[14%] bg-primary" />
            <span aria-hidden="true" className="absolute left-0 top-0 h-[38%] w-1.5 bg-primary" />
            <span aria-hidden="true" className="absolute bottom-0 right-0 h-1.5 w-[28%] bg-primary" />

            <div className="relative flex h-full flex-col px-5 pb-4 pt-4">
              {/* Header: org + document type, validity pill. */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold leading-none tracking-[1.5px] text-ink">
                    EVAROUTE
                  </p>
                  <p className="mt-1 text-[7.5px] font-semibold leading-none tracking-[1.2px] text-muted">
                    STAFF IDENTIFICATION
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-bold text-ink-soft">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${staff.isActive ? "bg-success" : "bg-danger"}`}
                  />
                  {staff.isActive ? "Valid" : "Revoked"}
                </span>
              </div>

              {/* Photo (offset frame) + name/position + data rows. */}
              <div className="mt-3 flex min-h-0 flex-1 gap-4">
                <div className="relative shrink-0 self-start">
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 -left-1.5 h-[72px] w-[72px] border-2 border-primary"
                  />
                  <span className="relative flex h-[72px] w-[72px] items-center justify-center border border-line bg-primary-soft text-[20px] font-bold text-primary-ink">
                    {initials}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[15px] font-bold uppercase leading-tight tracking-[0.5px] text-ink">
                    {nameParts.join(" ")}{" "}
                    {nameTail && (
                      <span className="text-primary-ink">{nameTail}</span>
                    )}
                    {isSelf && (
                      <span className="ml-1.5 align-middle text-[9px] font-semibold normal-case tracking-normal text-muted-dim">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-ink-soft">
                    Facility Staff
                  </p>

                  <dl className="mt-3 space-y-[7px]">
                    {[
                      ["EMP NO", memberId, true],
                      ["Facility", staff.facility ? staff.facility.name : "Unassigned", false],
                      ["Joined", joinedLabel, false],
                      ["Mail", staff.email ?? "—", false],
                    ].map(([label, value, mono]) => (
                      <div key={label} className="flex items-baseline gap-1.5">
                        <dt className="w-[46px] shrink-0 text-[8.5px] font-bold uppercase tracking-[0.5px] text-ink-soft">
                          {label}
                        </dt>
                        <span aria-hidden="true" className="text-[9px] text-muted-dim">
                          :
                        </span>
                        <dd
                          className={`min-w-0 flex-1 truncate text-[9.5px] text-ink-soft ${mono ? "font-mono tracking-[0.8px]" : ""}`}
                          title={typeof value === "string" ? value : undefined}
                        >
                          {mono ? (
                            <CopyId value={value} label={label} className="text-[9.5px]" />
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <FlipChip
              label={`Show actions for ${fullName}`}
              title="Show actions"
              onClick={() => setFlipped(true)}
            />
          </div>

          {/* ───────────── BACK — actions + small details ───────────── */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-primary bg-surface"
          >
            <CardPattern variant="back" />

            {/* Accent frame (mirrored arrangement, per the reference). */}
            <span aria-hidden="true" className="absolute right-0 top-0 h-1.5 w-[38%] bg-primary" />
            <span aria-hidden="true" className="absolute left-0 top-0 h-1.5 w-[14%] bg-primary" />
            <span aria-hidden="true" className="absolute bottom-0 left-0 h-1.5 w-[35%] bg-primary" />
            <span aria-hidden="true" className="absolute bottom-0 right-0 h-[30%] w-1.5 bg-primary" />

            <div className="relative flex h-full flex-col px-5 pb-4 pt-4">
              {/* Teal section bar (reference's "TERMS AND CONDITIONS"). */}
              <p className="mx-auto rounded-none bg-primary-strong px-4 py-1.5 text-center text-[9px] font-bold uppercase tracking-[1.5px] text-white">
                Staff Actions
              </p>

              {/* Action buttons — the card's whole reason to flip. */}
              <div className="mt-3.5 grid grid-cols-5 gap-1.5">
                <ActionButton
                  label={`Edit name of ${fullName}`}
                  title="Edit name"
                  onClick={() => onEdit(staff)}
                  text="Edit"
                  hover="hover:bg-primary-soft hover:text-primary-ink"
                >
                  <Pencil size={15} strokeWidth={1.9} />
                </ActionButton>
                <ActionButton
                  label={`${staff.facility ? "Reassign" : "Assign"} ${fullName} to a facility`}
                  title={staff.facility ? "Reassign facility" : "Assign to facility"}
                  onClick={() => onAssign(staff)}
                  text="Facility"
                  hover="hover:bg-primary-soft hover:text-primary-ink"
                >
                  <Building2 size={15} strokeWidth={1.9} />
                </ActionButton>
                <ActionButton
                  label={`Reset password for ${fullName}`}
                  title="Reset password"
                  onClick={() => onAction("reset", staff)}
                  text="Reset"
                  hover="hover:bg-primary-soft hover:text-primary-ink"
                >
                  <KeyRound size={15} strokeWidth={1.9} />
                </ActionButton>
                {staff.isActive ? (
                  !isSelf && (
                    <ActionButton
                      label={`Deactivate ${fullName}`}
                      title="Deactivate"
                      onClick={() => onAction("deactivate", staff)}
                      text="Disable"
                      hover="hover:bg-warning-soft hover:text-warning"
                    >
                      <Power size={15} strokeWidth={1.9} />
                    </ActionButton>
                  )
                ) : (
                  <ActionButton
                    label={`Activate ${fullName}`}
                    title="Activate"
                    onClick={() => onAction("activate", staff)}
                    text="Enable"
                    hover="hover:bg-success-soft hover:text-success"
                  >
                    <Power size={15} strokeWidth={1.9} />
                  </ActionButton>
                )}
                {!isSelf && (
                  <ActionButton
                    label={`Delete ${fullName}`}
                    title="Delete"
                    onClick={() => onAction("delete", staff)}
                    text="Delete"
                    hover="hover:bg-danger hover:text-white"
                    className="border-danger/15 bg-danger-soft text-danger"
                  >
                    <Trash2 size={15} strokeWidth={1.9} />
                  </ActionButton>
                )}
              </div>

              {/* Small authorized-details strip + signature footer. */}
              <dl className="mt-3.5 space-y-[6px] border-t border-line pt-3">
                {[
                  ["Member ID", memberId],
                  ["Facility", staff.facility ? staff.facility.name : "Unassigned"],
                  ["Joined", joinedLabel],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <dt className="w-[58px] shrink-0 text-[8.5px] font-bold uppercase tracking-[0.5px] text-primary-ink">
                      {label}
                    </dt>
                    <span aria-hidden="true" className="text-[9px] text-muted-dim">
                      :
                    </span>
                    <dd
                      className="min-w-0 flex-1 truncate text-[9.5px] text-ink-soft"
                      title={typeof value === "string" ? value : undefined}
                    >
                      {label === "Member ID" ? (
                        <CopyId value={value} label={label} className="text-[9.5px]" />
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto flex items-end justify-between gap-3 pt-2.5">
                <div className="min-w-0">
                  <div aria-hidden="true" className="h-px w-24 bg-line-strong" />
                  <p className="mt-1 text-[8.5px] text-muted">
                    Authorized by · EvaRoute Operations
                  </p>
                </div>
                {/* Decorative data-matrix accent (not a scannable code). */}
                <span
                  aria-hidden="true"
                  className="h-9 w-9 shrink-0 border-2 border-primary/40 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--color-primary)_2px,var(--color-primary)_3px),repeating-linear-gradient(90deg,transparent,transparent_2px,var(--color-primary)_2px,var(--color-primary)_3px)] bg-surface opacity-70"
                />
              </div>
            </div>

            <FlipChip
              label={`Show details for ${fullName}`}
              title="Show details"
              onClick={() => setFlipped(false)}
            />
          </div>
        </motion.div>
      </div>
    </article>
  );
};

/**
 * Gray-whitish security-pattern backdrop (guilloché-style flowing lines,
 * drawn in the theme's own hairline tokens so it stays inside the palette).
 * Purely decorative; each face gets a mirrored arrangement, like a real
 * credential's front/back engraving.
 */
const CardPattern = ({ variant }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 300 200"
    preserveAspectRatio="xMidYMid slice"
    className="pointer-events-none absolute inset-0 h-full w-full"
  >
    <g
      fill="none"
      stroke="var(--color-line)"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      {variant === "front" ? (
        <>
          <path d="M-10 150 C 50 120, 110 182, 170 152 S 280 112, 320 142" opacity="0.75" />
          <path d="M-10 166 C 50 136, 110 198, 170 168 S 280 128, 320 158" opacity="0.55" />
          <path d="M-10 182 C 50 152, 110 214, 170 184 S 280 144, 320 174" opacity="0.38" />
          <path d="M46 -10 C 76 28, 36 60, 66 100 S 124 152, 104 210" opacity="0.32" />
          <path d="M62 -10 C 92 28, 52 60, 82 100 S 140 152, 120 210" opacity="0.2" />
        </>
      ) : (
        <>
          <path d="M320 50 C 260 20, 200 82, 140 52 S 30 12, -20 42" opacity="0.75" />
          <path d="M320 66 C 260 36, 200 98, 140 68 S 30 28, -20 58" opacity="0.55" />
          <path d="M320 82 C 260 52, 200 114, 140 84 S 30 44, -20 74" opacity="0.38" />
          <path d="M254 210 C 224 172, 264 140, 234 100 S 176 48, 196 -10" opacity="0.32" />
          <path d="M270 210 C 240 172, 280 140, 250 100 S 192 48, 212 -10" opacity="0.2" />
        </>
      )}
    </g>
  </svg>
);

/** Corner flip affordance (real button — the keyboard path onto the back). */
const FlipChip = ({ label, title, onClick }) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="absolute bottom-2 right-2 z-10 flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2 text-[8.5px] font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
  >
    <RotateCw size={11} strokeWidth={2} aria-hidden="true" />
    {title}
  </button>
);

/** Labelled action button on the card back (44px target, never flips). */
const ActionButton = ({
  label,
  title,
  onClick,
  text,
  hover,
  className = "",
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-md border border-line bg-surface px-1 py-2 text-muted transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${hover} ${className}`}
  >
    {children}
    <span className="text-[7.5px] font-semibold uppercase tracking-[0.4px]">
      {text}
    </span>
  </button>
);

export default StaffIdCard;
