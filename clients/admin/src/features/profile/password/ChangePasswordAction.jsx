import { Lock } from "lucide-react";
import Banner from "../../../components/ui/Banner";
import SecurityAction from "../SecurityAction";
import ChangePasswordForm from "./ChangePasswordForm";
import useChangePassword from "./useChangePassword";

/** Security row that expands into the change-password form. Owns its feedback. */
const ChangePasswordAction = () => {
  const { values, setField, submit, error, notice, busy, open, setOpen, clearError } =
    useChangePassword();

  return (
    <>
      <SecurityAction
        icon={<Lock size={15} strokeWidth={1.8} />}
        title="Password"
        description="verified with your current password"
        actionLabel="Change"
        showArrow
        onClick={() => {
          clearError();
          setOpen((current) => !current);
        }}
      />
      {open && (
        <ChangePasswordForm values={values} onChange={setField} onSubmit={submit} busy={busy} />
      )}
      {error && <Banner tone="error">{error}</Banner>}
      {notice && <Banner tone="success">{notice}</Banner>}
    </>
  );
};

export default ChangePasswordAction;
