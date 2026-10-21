import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Lock } from "lucide-react";
import Banner from "../../../components/ui/Banner";
import SecurityAction from "../SecurityAction";
import ChangePasswordForm from "./ChangePasswordForm";
import useChangePassword from "./useChangePassword";

/** Security row that expands into the change-password form. Owns its feedback. */
const ChangePasswordAction = () => {
  const { values, setField, submit, error, notice, busy, open, setOpen, clearError } =
    useChangePassword();
  const reduceMotion = useReducedMotion();

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
      {/* Expands/collapses in place (height auto, exit faster than enter). */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="change-password-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: reduceMotion ? 0 : 0.14, ease: "easeIn" },
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <ChangePasswordForm values={values} onChange={setField} onSubmit={submit} busy={busy} />
          </motion.div>
        )}
      </AnimatePresence>
      {error && <Banner tone="error">{error}</Banner>}
      {notice && <Banner tone="success">{notice}</Banner>}
    </>
  );
};

export default ChangePasswordAction;
