import { FIELD_CLASS, LABEL_CLASS } from "./fieldStyles";

/**
 * Clay form fields — the login screen's input language, centralized.
 *
 * Field = recessed (inset shadow) slot carved into a surface, with a small
 * uppercase label above. States:
 *   default   — inset well, muted placeholder
 *   hover     — slightly darker well
 *   focus     — accent ring
 *   error     — danger ring + message (role=alert)
 *   disabled  — faded, not interactive
 *   readOnly  — inset kept, no ring (values stay readable)
 *
 * TextField renders <input>; SelectField renders <select> with the same
 * chrome. Both forward props so callers keep full control of behaviour.
 */

const ERROR_RING = "ring-danger focus:ring-2";

const FieldShell = ({ id, label, error, hint, className = "", children }) => (
  <label className={`block ${className}`}>
    {label && (
      <span className={LABEL_CLASS} {...(id ? { htmlFor: id } : {})}>
        {label}
      </span>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-[9px] text-muted">{hint}</p>}
    {error && (
      <p role="alert" className="mt-1 text-[9px] font-medium text-danger">
        {error}
      </p>
    )}
  </label>
);

const TextField = ({
  id,
  label,
  error,
  hint,
  className = "",
  fieldClassName = "",
  ...props
}) => (
  <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
    <input
      id={id}
      className={`${FIELD_CLASS} ${error ? ERROR_RING : ""} ${fieldClassName}`}
      {...props}
    />
  </FieldShell>
);

const SelectField = ({
  id,
  label,
  error,
  hint,
  className = "",
  fieldClassName = "",
  children,
  ...props
}) => (
  <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
    <select
      id={id}
      className={`${FIELD_CLASS} appearance-none pr-8 ${error ? ERROR_RING : ""} ${fieldClassName}`}
      {...props}
    >
      {children}
    </select>
  </FieldShell>
);

export { FieldShell };
export default TextField;
export { SelectField };
