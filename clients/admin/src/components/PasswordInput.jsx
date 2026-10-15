import { useState } from "react";

/**
 * Password field with a show/hide toggle.
 *
 * Shared by the sign-in form and the reset-password flow so the eye control,
 * input chrome (inset shadow, focus ring) and label style stay identical to the
 * rest of the portal.
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
          {visible ? (
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
};

export default PasswordInput;
