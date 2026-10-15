import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import { useAuth } from "../../context/AuthContext";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import AccountInformationCard from "./AccountInformationCard";
import AccountSummaryCard from "./AccountSummaryCard";
import SecuritySection from "./SecuritySection";

/**
 * Profile — real identity, real sign-out.
 *
 * Identity comes from the login/refresh payload
 * ({ email, firstname, lastName, role, isSetupDone }); the assigned facility
 * comes from GET /api/v1/facility (useAssignedFacility). Both are genuine
 * API values.
 *
 * Removed because the API has no such field anywhere in the schema:
 *   - "Mobile No."  (no phone column on User)
 *   - "Staff ID EM-0241" (login does not return the user id)
 *   - "Joined Mar 2025" (createdAt is not returned by login or refresh)
 * Those rows were hardcoded demo data, not real records.
 */
const ProfilePage = () => {
  const { user } = useAuth();
  const { facility } = useAssignedFacility();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account and security"
      />

      <AccountSummaryCard user={user} facility={facility} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="account-information-heading">
          <h2
            id="account-information-heading"
            className="mb-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
          >
            Account Information
          </h2>
          <AccountInformationCard user={user} facility={facility} />
        </section>

        <section aria-labelledby="security-heading">
          <h2
            id="security-heading"
            className="mb-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
          >
            Security
          </h2>
          <SecuritySection onBusyChange={setSigningOut} />
        </section>
      </div>

      {signingOut && (
        <div className="mt-4">
          <StatusPanel title="Signing out…">
            Ending your session with the EvaRoute API.
          </StatusPanel>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
