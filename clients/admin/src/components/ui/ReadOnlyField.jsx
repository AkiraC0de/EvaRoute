import { FIELD_CLASS, LABEL_CLASS } from "./fieldStyles";

/**
 * Read-only labelled field. Used for account data the API exposes no
 * self-edit endpoint for (see the profile page).
 */
const ReadOnlyField = ({ label, value }) => (
  <label className="block">
    <span className={LABEL_CLASS}>{label}</span>
    <input
      aria-label={label}
      className={`${FIELD_CLASS} h-8 font-semibold`}
      readOnly
      value={value}
    />
  </label>
);

export default ReadOnlyField;
