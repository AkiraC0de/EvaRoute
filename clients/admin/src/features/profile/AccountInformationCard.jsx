import { displayPlaceName } from "../../lib/utils";

/**
 * Account information: label/value RECORD rows (details kept by your
 * administrator) — deliberately not input-style boxes, so read-only data
 * never implies editability. Values truncate to one line with a title
 * tooltip (the shared row anatomy), and email/role live in the identity
 * band above — one source per fact.
 */
const AccountInformationCard = ({ user, facility }) => {
  const rows = [
    { label: "First name", value: user?.firstName || "—" },
    { label: "Last name", value: user?.lastName || "—" },
    {
      label: "Assigned facility",
      value: facility
        ? `${displayPlaceName(facility.name)} · ${displayPlaceName(facility.address)}`
        : "Not assigned",
    },
  ];

  return (
    <div className="rounded-lg border border-line bg-surface">
      <dl className="px-4 py-1">
        {rows.map(({ label, value }, index) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 py-2.5 ${
              index ? "border-t border-line" : ""
            }`}
          >
            <dt className="shrink-0 text-[11px] font-medium text-muted">
              {label}
            </dt>
            <dd
              className="min-w-0 max-w-[65%] truncate text-right text-[12px] font-semibold text-ink-soft"
              title={value}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default AccountInformationCard;
