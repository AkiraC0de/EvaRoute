import { useState } from "react";
import { changePassword } from "../../../lib/api";

/** State + submit for the profile change-password form. */
export default function useChangePassword() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const setField = (name, value) =>
    setValues((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (values.newPassword !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const data = await changePassword(values.currentPassword, values.newPassword);
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice(data.message || "Password changed.");
    } catch (err) {
      // 400 from changePasswordSchema carries field-level rule violations.
      const fieldErrors = err.details?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        setError(fieldErrors.map((entry) => entry.message).join(" "));
      } else {
        setError(err.message || "Could not change the password.");
      }
    } finally {
      setBusy(false);
    }
  };

  return {
    values,
    setField,
    submit,
    error,
    notice,
    busy,
    open,
    setOpen,
    clearError: () => setError(""),
  };
}
