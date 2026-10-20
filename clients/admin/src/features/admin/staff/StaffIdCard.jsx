import {
  Pencil,
  Building2,
  KeyRound,
  Power,
  Trash2,
} from "lucide-react";

/**
 * Staff ID credential card — flat: navy credential header band, white
 * hairline-bordered body (mono short-ID + label/value rows), icon action
 * footer. People identity uses the teal category tint; the facility chip is
 * a place, so it carries the warm tint. No sheen, no guilloché, no lift.
 */
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

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      {/* Credential header band — flat navy: org + document type + validity. */}
      <div className="bg-primary px-4 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold leading-none tracking-[1.5px] text-white">
              EVAROUTE
            </p>
            <p className="mt-1 text-[8px] font-semibold leading-none tracking-[1.2px] text-white/80">
              STAFF IDENTIFICATION
            </p>
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

      {/* Credential body — identity block + label/value rows. */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-md border border-line bg-secondary-soft text-[18px] font-bold text-secondary-ink"
          >
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
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-secondary-ink">
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
                    ? "inline-block max-w-full truncate rounded-full bg-warm-soft px-2 py-0.5 text-[10px] font-semibold text-warm-ink align-middle"
                    : "inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted align-middle"
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
      </div>

      {/* Action footer — icon buttons only (44px targets, each labelled).
          Non-destructive actions left, delete isolated right with a danger
          tint so it can never be mistaken for a benign action. */}
      <div className="flex items-center gap-1.5 border-t border-line bg-surface-2 px-4 py-2.5">
        <ActionButton
          label={`Edit name of ${fullName}`}
          title="Edit name"
          onClick={() => onEdit(staff)}
          hover="hover:bg-primary-soft hover:text-primary"
        >
          <Pencil size={15} strokeWidth={1.9} />
        </ActionButton>
        <ActionButton
          label={`${staff.facility ? "Reassign" : "Assign"} ${fullName} to a facility`}
          title={staff.facility ? "Reassign facility" : "Assign to facility"}
          onClick={() => onAssign(staff)}
          hover="hover:bg-primary-soft hover:text-primary"
        >
          <Building2 size={15} strokeWidth={1.9} />
        </ActionButton>
        <ActionButton
          label={`Reset password for ${fullName}`}
          title="Reset password"
          onClick={() => onAction("reset", staff)}
          hover="hover:bg-primary-soft hover:text-primary"
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
            className="ml-auto bg-danger-soft text-danger"
          >
            <Trash2 size={15} strokeWidth={1.9} />
          </ActionButton>
        )}
      </div>
    </article>
  );
};

/** 44px flat icon button in the card footer (hairline chip, tone on hover). */
const ActionButton = ({ label, title, onClick, hover, className = "", children }) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    onClick={onClick}
    className={`flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface text-muted transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${hover} ${className}`}
  >
    {children}
  </button>
);

export default StaffIdCard;
