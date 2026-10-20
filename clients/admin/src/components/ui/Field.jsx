import { FIELD_CLASS, LABEL_CLASS } from "./fieldStyles";
import SelectInput from "./Select";

/**
 * Shared form fields — the flat input language, centralized.
 *
 * Field = white bordered slot with a small uppercase label above. States:
 *   default   — hairline border, muted placeholder
 *   hover     — slightly darker well
 *   focus     — primary ring
 *   error     — danger ring + message (role=alert)
 *   disabled  — faded, not interactive
 *   readOnly  — muted fill, no ring (values stay readable)
 *
 * TextField renders <input>; SelectField renders <select> with the same
 * chrome. Both forward props so callers keep full control of behaviour.
 */

const ERROR_RING = "border-danger focus-visible:outline-danger";

const FieldShell = ({ id, label, error, hint, className = "", children }) => (
  <label className={`block ${className}`}>
    {label && (
      <span className={LABEL_CLASS} {...(id ? { htmlFor: id } : {})}>
        {label}
      </span>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    {error && (
      <p role="alert" className="mt-1 text-[11px] font-medium text-danger">
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
  leadingIcon: LeadingIcon,
  ...props
}) => (
  <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
    {LeadingIcon ? (
      <span className="relative block">
        <LeadingIcon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id={id}
          className={`${FIELD_CLASS} pl-9 ${error ? ERROR_RING : ""} ${fieldClassName}`}
          {...props}
        />
      </span>
    ) : (
      <input
        id={id}
        className={`${FIELD_CLASS} ${error ? ERROR_RING : ""} ${fieldClassName}`}
        {...props}
      />
    )}
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
    {/* Radix Select behind the native <select> contract — see Select.jsx. */}
    <SelectInput
      id={id}
      className={`${FIELD_CLASS} appearance-none pr-8 ${error ? ERROR_RING : ""} ${fieldClassName}`}
      {...props}
    >
      {children}
    </SelectInput>
  </FieldShell>
);

export { FieldShell };
export default TextField;
export { SelectField };
