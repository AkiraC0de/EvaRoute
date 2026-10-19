import {
  Pencil,
  Building2,
  KeyRound,
  Power,
  Trash2,
} from "lucide-react";

/**
 * Helpers that give the card its printed-credential details:
 * mrzFill / joinedYear build the passport-style machine-readable zone;
 * verificationCells renders a deterministic pseudo-QR mark (same staff →
 * same matrix) with QR-style finder rings at three corners.
 */
const mrzFill = (text, len = 30) =>
  text
    .toUpperCase()
    .replace(/\s+/g, "<")
    .padEnd(len, "<")
    .slice(0, len);

const joinedYear = (date) =>
  Number.isNaN(date.getTime()) ? "----" : date.getFullYear();

function verificationCells(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells = [];
  for (let i = 0; i < 49; i += 1) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    cells.push(((h >>> 9) & 7) > 3);
  }
  const finderRing = (r, c) => {
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || cc < 0 || rr > 6 || cc > 6) continue;
        const isEdge = Math.abs(dr) === 1 || Math.abs(dc) === 1;
        cells[rr * 7 + cc] = isEdge || (dr === 0 && dc === 0);
      }
    }
  };
  finderRing(0, 0);
  finderRing(0, 6);
  finderRing(6, 0);
  return cells;
}


const StaffIdCard = ({ staff, isSelf, onEdit, onAssign, onAction }) => {
  const fullName =
    staff.firstName || staff.lastName
      ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()
      : "Unnamed staff";
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
    : joined.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const memberId = `ID-${String(staff.id ?? "").slice(0, 8).toUpperCase()}`;
  const mrzLine1 = mrzFill(
    `ID<EVROUTE<STAFF<<${staff.lastName || "UNNAMED"}<<${staff.firstName || ""}`,
  );
  const mrzLine2 = mrzFill(
    `${String(staff.id ?? "").slice(0, 8)}<${staff.isActive ? "ACTIVE" : "INACTIVE"}<${joinedYear(joined)}<${staff.facility ? staff.facility.name : "UNASSIGNED"}`,
  );
  const verifyCells = verificationCells(`${staff.id ?? ""}${staff.email ?? ""}`);

  return (
    <article className="flex flex-col overflow-hidden rounded-clay bg-surface shadow-clay">
      {/* Credential header — org crest + document type + validity status,
          with a hologram sheen across the band (the digital-ID signature). */}
      <div className="relative overflow-hidden bg-linear-to-r from-accent to-[#3d55d8] px-4 pt-2.5 pb-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.55)_36%,transparent_50%,rgba(255,255,255,0.35)_66%,transparent_84%)] opacity-25"
        />
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[11px] font-bold leading-none tracking-[1.5px] text-white">
                EVAROUTE
              </p>
              <p className="mt-1 text-[8px] font-semibold leading-none tracking-[1.2px] text-white/80">
                STAFF IDENTIFICATION
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-ink-soft">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${staff.isActive ? "bg-success" : "bg-danger"}`}
            />
            {staff.isActive ? "Valid" : "Revoked"}
          </span>
        </div>
      </div>

      {/* Credential body — fine guilloché line pattern behind the data,
          ghost wordmark watermark, like a printed security document. */}
      <div
        className="relative flex-1 overflow-hidden p-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(82,105,239,0.05) 0 1px, transparent 1px 7px), repeating-linear-gradient(45deg, rgba(82,105,239,0.04) 0 1px, transparent 1px 9px)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 bottom-8 -rotate-12 select-none text-[44px] font-bold tracking-[2px] text-accent/5"
        >
          EVAROUTE
        </span>

        {/* Photo block — portrait-style framed photo area + identity lines */}
        <div className="relative z-10 flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="relative flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-clay-sm bg-linear-to-br from-accent-soft to-white text-[18px] font-bold text-accent shadow-clay-xs ring-1 ring-accent/20"
          >
            <span className="absolute inset-1 rounded-[4px] border border-white/70" />
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-ink">
              {fullName}
              {isSelf && (
                <span className="ml-1.5 align-middle text-[10px] font-semibold text-muted-dim">
                  (you)
                </span>
              )}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-accent">
              Facility Staff
            </p>
            <p className="mt-1 truncate text-[11px] text-muted" title={staff.email}>
              {staff.email}
            </p>
          </div>
        </div>

        {/* ID detail rows */}
        <dl className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2.5">
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-[0.7px] text-muted-dim">
              Facility
            </dt>
            <dd className="mt-1">
              <span
                className={
                  staff.facility
                    ? "inline-block max-w-full truncate rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent align-middle"
                    : "inline-block rounded-full bg-sunken px-2 py-0.5 text-[10px] font-semibold text-muted shadow-clay-inset align-middle"
                }
                title={staff.facility ? staff.facility.name : "Unassigned"}
              >
                {staff.facility ? staff.facility.name : "Unassigned"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-[0.7px] text-muted-dim">
              Joined
            </dt>
            <dd className="mt-1 text-[11px] font-semibold text-ink-soft">{joinedLabel}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[9px] font-semibold uppercase tracking-[0.7px] text-muted-dim">
              Member ID
            </dt>
            <dd className="mt-1 font-mono text-[11px] font-semibold tracking-[1px] text-ink-soft">
              {memberId}
            </dd>
          </div>
        </dl>

        {/* Verification strip — deterministic pseudo-QR mark + authorized
            signature line, the two details that sell a printed credential. */}
        <div className="relative z-10 mt-3.5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="grid h-[52px] w-[52px] grid-cols-7 grid-rows-7 gap-px rounded-[3px] bg-ink p-[3px]"
            >
              {verifyCells.map((on, index) => (
                <span key={index} className={on ? "bg-white" : "bg-transparent"} />
              ))}
            </div>
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[1px] text-muted-dim">
                Verified staff
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.5px] text-muted">{memberId}</p>
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-serif text-[13px] italic text-ink-soft">EvaRoute Operations</p>
            <p className="mt-1 border-t border-line pt-1 text-[8px] font-semibold uppercase tracking-[1px] text-muted-dim">
              Authorized signature
            </p>
          </div>
        </div>

        {/* Machine-readable zone — passport-style monospace strip; the
            line is derived from the real record (id, status, year, facility). */}
        <div className="relative z-10 mt-3.5 overflow-hidden rounded-clay-xs bg-sunken px-3 py-2 shadow-clay-inset">
          <p className="truncate font-mono text-[8.5px] leading-[1.6] tracking-[1.2px] text-ink-soft/80">
            {mrzLine1}
          </p>
          <p className="truncate font-mono text-[8.5px] leading-[1.6] tracking-[1.2px] text-ink-soft/80">
            {mrzLine2}
          </p>
        </div>
      </div>

      {/* Action footer — icon buttons only (44px targets, each labelled).
          Non-destructive actions left, delete isolated right with a danger
          tint so it can never be mistaken for a benign action. */}
      <div className="flex items-center gap-1.5 border-t border-line bg-sunken/60 px-4 py-2.5">
        <ActionButton
          label={`Edit name of ${fullName}`}
          title="Edit name"
          onClick={() => onEdit(staff)}
          hover="hover:bg-accent-soft hover:text-accent"
        >
          <Pencil size={15} strokeWidth={1.9} />
        </ActionButton>
        <ActionButton
          label={`${staff.facility ? "Reassign" : "Assign"} ${fullName} to a facility`}
          title={staff.facility ? "Reassign facility" : "Assign to facility"}
          onClick={() => onAssign(staff)}
          hover="hover:bg-accent-soft hover:text-accent"
        >
          <Building2 size={15} strokeWidth={1.9} />
        </ActionButton>
        <ActionButton
          label={`Reset password for ${fullName}`}
          title="Reset password"
          onClick={() => onAction("reset", staff)}
          hover="hover:bg-accent-soft hover:text-accent"
        >
          <KeyRound size={15} strokeWidth={1.9} />
        </ActionButton>
        {staff.isActive ? (
          !isSelf && (
            <ActionButton
              label={`Deactivate ${fullName}`}
              title="Deactivate"
              onClick={() => onAction("deactivate", staff)}
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
            hover="hover:bg-danger hover:text-white"
            className="ml-auto bg-danger-soft/60 text-danger"
          >
            <Trash2 size={15} strokeWidth={1.9} />
          </ActionButton>
        )}
      </div>
    </article>
  );
};

/** 44px round icon button in the card footer (clay chip, tone on hover). */
const ActionButton = ({ label, title, onClick, hover, className = "", children }) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    onClick={onClick}
    className={`flex h-11 w-11 items-center justify-center rounded-clay-sm bg-surface text-muted shadow-clay-xs transition ${hover} ${className}`}
  >
    {children}
  </button>
);

export default StaffIdCard;
