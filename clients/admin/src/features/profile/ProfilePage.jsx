import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusPanel from "../../components/ui/StatusPanel";
import { useAuth } from "../../context/AuthContext";
import useAssignedFacility from "../../hooks/useAssignedFacility";
import SectionHeader from "../occupancy/SectionHeader";
import AccountInformationCard from "./AccountInformationCard";
import AccountSummaryCard from "./AccountSummaryCard";
import SecuritySection from "./SecuritySection";

/**
 * Profile — real identity, real sign-out.
 *
 * Settings-page grammar: one identity band across the top, then two section
 * columns (account information | security) under the app's shared section
 * headers. Identity comes from the login/refresh payload
 * ({ email, firstName, lastName, role, isSetupDone }); the assigned facility
 * comes from GET /api/v1/facility (useAssignedFacility). Both are genuine
 * API values. One source per fact: name/email/role live in the identity
 * band, the name fields and facility live in the information card.
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

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section aria-label="Account information" className="min-w-0">
          <div className="mb-3">
            <SectionHeader
              title="Account information"
              caption="details kept by your administrator"
            />
          </div>
          <AccountInformationCard user={user} facility={facility} />
        </section>

        <section aria-label="Security" className="min-w-0">
          <div className="mb-3">
            <SectionHeader
              title="Security"
              caption="password, sessions and sign-out"
            />
          </div>
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
