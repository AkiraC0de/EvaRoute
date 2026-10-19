import { useState } from "react";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import AccountSetupModal from "./AccountSetupModal";

/**
 * First-run setup gate: renders the blocking setup modal whenever the
 * signed-in identity has `isSetupDone: false` (staff accounts are created
 * with only email + password). Completing the form swaps the stored user for
 * the updated one from the API, which unmounts this gate.
 */
const AccountSetupGate = () => {
  const { user, updateUser, signOut } = useAuth();
  const [draft, setDraft] = useState({ firstName: "", lastName: "" });
  const { busy, error, run } = useAsyncAction();

  if (user?.isSetupDone !== false) return null;

  const submit = () =>
    run(async () => {
      const nextUser = await api.completeAccountSetup({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
      });
      updateUser(nextUser);
    });

  return (
    <AccountSetupModal
      draft={draft}
      onDraftChange={setDraft}
      onSubmit={submit}
      onSignOut={() => signOut()}
      busy={busy}
      error={error}
    />
  );
};

export default AccountSetupGate;
