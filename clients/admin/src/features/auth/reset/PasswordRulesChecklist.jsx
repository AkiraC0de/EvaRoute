/**
 * Live checklist for `passwordRules.js` (mirrors `newPasswordField` in
 * server/src/validations/auth.validations.ts).
 */
import { RULES } from "./passwordRules";

const PasswordRulesChecklist = ({ password }) => (
  <ul className="grid grid-cols-2 gap-x-2 gap-y-1 rounded-xl bg-[#f6f8fc] px-3 py-2">
    {RULES.map((rule) => {
      const met = rule.test(password);
      return (
        <li
          key={rule.label}
          className={`flex items-center gap-1.5 text-[10px] font-medium ${
            met ? "text-[#1f7a3d]" : "text-[#8290aa]"
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-3 w-3 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: met ? "#3fa35f" : "#c2cada" }}
          >
            {met ? "✓" : ""}
          </span>
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRulesChecklist;
