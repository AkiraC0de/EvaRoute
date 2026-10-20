import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FIELD_CLASS, LABEL_CLASS } from "./fieldStyles";

/**
 * Password field with a show/hide toggle.
 *
 * Shared by the sign-in form, the reset-password flow and the profile's
 * password confirmation so the eye control, input chrome (bordered field, focus
 * ring) and label style stay identical everywhere.
 */
const PasswordInput = ({
  id,
  name = "password",
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "",
  required = true,
  minLength,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${FIELD_CLASS} pr-10`}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition after:absolute after:-inset-1.5 after:rounded-md after:content-[''] hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {visible ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
        </button>
      </span>
    </label>
  );
};

export default PasswordInput;
