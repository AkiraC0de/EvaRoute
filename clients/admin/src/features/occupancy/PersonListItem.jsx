import { checkInCode, formatCheckedInAt } from "./occupancyUtils";

/**
 * One person in the Individual view of Check-ins: name + category pill
 * (child / adult) and the household they belong to (family name, Check-In
 * ID and check-in time). Informational card — check-out is per household
 * and lives in the Household view.
 */
const PersonListItem = ({ entry }) => {
  const { member, stay } = entry;
  const isChild = member.ageGroup === "CHILD";
  const initials =
    member.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";
  const code = checkInCode(stay);

  return (
    <li className="rounded-clay-sm bg-surface px-3 py-2.5 shadow-clay-xs transition hover:shadow-clay">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            isChild ? "bg-warning-soft text-warning" : "bg-accent-soft text-accent"
          }`}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[13px] font-bold text-ink">{member.fullName}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-clay-inset ${
                isChild ? "bg-warning-soft text-warning" : "bg-accent-soft text-accent"
              }`}
            >
              {isChild ? "Child" : "Adult"}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] text-muted">
            {stay.familyName} household · Check-in ID{" "}
            <span className="font-mono font-semibold text-ink-soft">{code}</span> · checked in{" "}
            {formatCheckedInAt(stay.checkedInAt)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default PersonListItem;
