import {
  Pencil,
  Building2,
  KeyRound,
  Power,
  Trash2,
} from "lucide-react";

/**
 * One staff account as an ID-style badge card (replaces the table row):
 *
 *   ┌ accent header strip: "EvaRoute · Staff ID" + status pill
 *   ├ photo block: initials avatar + name (+ "you" chip) + email
 *   ├ detail rows like a physical ID: FACILITY (chip + quick change) and
 *   │  JOINED (account date), plus the short MEMBER ID
 *   └ action footer: icon buttons (edit / assign / reset password /
 *      activate-deactivate / delete) — every icon carries aria-label +
 *      title per the icon-button accessibility rule. Self cards hide
 *      deactivate + delete (the server refuses them anyway).
 *
 * `onAction(type, staff)` covers activate/deactivate/reset/delete (the page
 * opens the confirm dialog); `onEdit(staff)` opens the name editor;
 * `onAssign(staff)` opens the facility picker.
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
    <article className="flex flex-col overflow-hidden rounded-clay bg-surface shadow-clay">
      {/* Badge header strip */}
      <div className="flex items-center justify-between gap-2 bg-accent px-4 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/85">
          EvaRoute · Staff ID
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-ink-soft">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${staff.isActive ? "bg-success" : "bg-danger"}`}
          />
          {staff.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex-1 p-4">
        {/* Photo block */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-[15px] font-bold text-accent"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold leading-tight text-ink">
              {fullName}
              {isSelf && (
                <span className="ml-1.5 align-middle text-[10px] font-semibold text-muted-dim">
                  (you)
                </span>
              )}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted" title={staff.email}>
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
