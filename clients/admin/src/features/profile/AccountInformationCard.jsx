import Card from "../../components/ui/Card";
import ReadOnlyField from "../../components/ui/ReadOnlyField";
import { displayPlaceName } from "../../lib/utils";

/**
 * Account information panel: read-only fields (details kept by your
 * administrator). Email and role appear in the summary card above — one
 * source per fact.
 */
const AccountInformationCard = ({ user, facility }) => {
  const profileFields = [
    { label: "First Name", value: user?.firstName || "—" },
    { label: "Last Name", value: user?.lastName || "—" },
    {
      label: "Assigned Facility",
      value: facility
        ? `${displayPlaceName(facility.name)} · ${displayPlaceName(facility.address)}`
        : "Not assigned",
    },
  ];

  return (
    <Card className="min-h-[455px]">
      <div className="space-y-2">
        {profileFields.map(({ label, value }) => (
          <ReadOnlyField key={label} label={label} value={value} />
        ))}
      </div>
      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        These details are maintained by your administrator. Contact your
        coordinator if anything here needs to change.
      </p>
    </Card>
  );
};

export default AccountInformationCard;
