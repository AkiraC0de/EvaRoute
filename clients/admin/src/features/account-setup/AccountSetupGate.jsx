import { useState } from "react";
import * as api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import AccountSetupModal from "./AccountSetupModal";

/**
 * First-run setup gate: renders the blocking setup modal whenever the
 * signed-in identity has `isSetupDone: false` (staff accounts are created
 * with only email + a system-generated password). Completing the form
 * replaces that password, swaps the stored user for the updated one from
 * the API, and unmounts this gate.
 */
const AccountSetupGate = () => {
  const { user, updateUser, signOut } = useAuth();
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { busy, error, run } = useAsyncAction();

  if (user?.isSetupDone !== false) return null;

  const submit = () => {
    if (draft.newPassword !== draft.confirmPassword) return;
    return run(async () => {
      const nextUser = await api.completeAccountSetup({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        newPassword: draft.newPassword,
      });
      updateUser(nextUser);
    });
  };

  return (
    <AccountSetupModal
      draft={draft}
      onDraftChange={setDraft}
      onSubmit={submit}
      onSignOut={() => run(() => signOut())}
      busy={busy}
      error={error}
    />
  );
};

export default AccountSetupGate;
