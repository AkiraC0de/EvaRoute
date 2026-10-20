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
 * ({ email, firstName, lastName, role, isSetupDone }); the assigned facility
 * comes from GET /api/v1/facility (useAssignedFacility). Both are genuine
 * API values.
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

      <AccountSummaryCard user={user} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="account-information-heading">
          <h2
            id="account-information-heading"
            className="mb-3 text-[10px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
          >
            Account Information
          </h2>
          <AccountInformationCard user={user} facility={facility} />
        </section>

        <section aria-labelledby="security-heading">
          <h2
            id="security-heading"
            className="mb-3 text-[10px] font-semibold uppercase tracking-[1px] text-[#9aa8c5]"
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
