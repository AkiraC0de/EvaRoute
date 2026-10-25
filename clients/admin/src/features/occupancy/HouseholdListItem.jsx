import Checkbox from "../../components/ui/Checkbox";
import CopyId from "../../components/ui/CopyId";
import FamilySilhouette from "./FamilySilhouette";
import { checkInCode, formatCheckedInAt, splitMembers } from "./occupancyUtils";

/**
 * One checked-in household (a `FacilityStay` with its members): selection
 * checkbox, initials, family name, Check-In ID ("0001", the per-facility
 * ticket number), check-in time, member chips and the family silhouette.
 *
 * Selectable for bulk check-out: the whole card toggles the selection and
 * carries the app's selected-state language (primary border + soft primary
 * tint, checked box). Nested controls (the checkbox, the CopyId chip, the
 * Check out button) stop propagation so they never double-toggle the card.
 *
 * Single check-out: when the caller passes `onCheckOut(stay)` a "Check out"
 * button appears on the row and the caller owns the mutation — hidden
 * entirely (never a dead control) when the prop is absent.
 *
 * Flat rows: hairline border + surface fill, no elevation. People chips
 * carry the people (teal) category tint — filled for children, outlined for
 * adults — and every chip spells its meaning in words, never color alone.
 */
const HouseholdListItem = ({ stay, selected, busy, onToggle}) => {
  const initials = stay.familyName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const { total, children, adults } = splitMembers(stay.members);
  const code = checkInCode(stay);

  return (
    <li
      onClick={() => {
        if (!busy) onToggle?.(stay.id);
      }}
      className={`relative cursor-pointer overflow-hidden rounded-md border px-3 py-2.5 transition-colors ${
        selected
          ? "border-primary-strong bg-primary-soft/60"
          : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      {/* Member-composition art — one figure per member, gray, behind the
          content in the lower-right so the category mix reads at a glance. */}
      <FamilySilhouette
        adults={adults}
        children={children}
        className="absolute bottom-0 right-2 h-[40px] w-auto max-w-[46%] text-muted opacity-15"
      />
      <div className="relative z-10 flex items-start gap-3">
        {/* Selection box — the keyboard/AT control mirroring the card
            toggle; its clicks stop here so the card never double-toggles. */}
        <span
          className="flex h-9 shrink-0 items-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            disabled={busy}
            ariaLabel={`Select household ${stay.familyName}`}
            onChange={() => onToggle?.(stay.id)}
          />
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-[11px] font-bold text-secondary-ink"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[13px] font-bold text-ink">{stay.familyName}</p>
            <span
              className="inline-flex shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              <CopyId
                value={code}
                label="Check-in ID"
                className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold tracking-[1px] text-ink-soft"
              />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {total} {total === 1 ? "member" : "members"} ({adults} adult{adults === 1 ? "" : "s"},{" "}
            {children} {children === 1 ? "child" : "children"}) · checked in{" "}
            {formatCheckedInAt(stay.checkedInAt)}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {stay.members.map((member) => (
              <li
                key={member.id}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  member.ageGroup === "CHILD"
                    ? "bg-secondary-soft text-secondary-ink"
                    : "border border-secondary/20 text-secondary-ink"
                }`}
              >
                {member.fullName} · {member.ageGroup === "CHILD" ? "Child" : "Adult"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
};

export default HouseholdListItem;
