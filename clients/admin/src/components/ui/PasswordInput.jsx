import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password field with a show/hide toggle.
 *
 * Shared by the sign-in form, the reset-password flow and the profile's
 * password confirmation so the eye control, input chrome (inset shadow, focus
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
      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.7px] text-[#7f8eae]">
        {label}
      </span>
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
          className="h-10 w-full rounded-xl bg-[#f6f8fc] px-3 pr-10 text-[11px] font-medium text-[#2f3d5f] shadow-[inset_0_2px_5px_rgba(40,55,90,0.12)] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8290aa] transition hover:bg-[#e8edff] hover:text-[#5269ef]"
        >
          {visible ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
        </button>
      </span>
    </label>
  );
};

export default PasswordInput;
