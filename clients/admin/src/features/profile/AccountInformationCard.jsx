import Card from "../../components/ui/Card";
import ReadOnlyField from "../../components/ui/ReadOnlyField";
import { roleLabelOf } from "../../lib/user";

/**
 * Account information panel: read-only fields. The API exposes no staff
 * self-edit endpoint (PATCH /api/v1/staff/:userId requires the admin-only
 * EDIT_STAFF_ACC permission), and phone/staff-ID are not part of the account
 * model — hence read-only.
 */
const AccountInformationCard = ({ user, facility }) => {
  const profileFields = [
    { label: "First Name", value: user?.firstname || "—" },
    { label: "Last Name", value: user?.lastName || "—" },
    { label: "Work Email", value: user?.email || "—" },
    { label: "Role", value: roleLabelOf(user?.role) },
    {
      label: "Assigned Facility",
      value: facility ? `${facility.name} · ${facility.address}` : "Not assigned",
    },
  ];

  return (
    <Card className="min-h-[455px]">
      <div className="space-y-2">
        {profileFields.map(({ label, value }) => (
          <ReadOnlyField key={label} label={label} value={value} />
        ))}
      </div>
      <p className="mt-4 px-1 text-[9px] leading-relaxed text-muted-dim">
        These fields are read-only: the API exposes no staff self-edit
        endpoint (PATCH /api/v1/staff/:userId requires the admin-only
        EDIT_STAFF_ACC permission). Phone number and staff ID are not part
        of the account model.
      </p>
    </Card>
  );
};

export default AccountInformationCard;
