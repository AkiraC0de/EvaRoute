/**
 * Live checklist for `passwordRules.js` (mirrors `newPasswordField` in
 * server/src/validations/auth.validations.ts). Flat language: a muted band
 * with hairline border; rule state is carried by the ✓ mark AND the token
 * text color (never color alone).
 */
import { RULES } from "./passwordRules";

const PasswordRulesChecklist = ({ password }) => (
  <ul className="grid grid-cols-2 gap-x-2 gap-y-1 rounded-md border border-line bg-surface-2 px-3 py-2">
    {RULES.map((rule) => {
      const met = rule.test(password);
      return (
        <li
          key={rule.label}
          className={`flex items-center gap-1.5 text-[10px] font-medium ${
            met ? "text-success" : "text-muted"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-3 w-3 items-center justify-center rounded-full text-[9px] font-bold ${
              met ? "bg-success text-white" : "border border-line-strong text-muted-dim"
            }`}
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
