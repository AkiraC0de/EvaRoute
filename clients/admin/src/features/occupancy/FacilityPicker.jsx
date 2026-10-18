import { SelectField } from "../../components/ui/Field";

/**
 * Facility picker for the Occupancy dashboard (ADMIN-only) — which facility
 * the operator is working on. Controlled: the page owns the selection.
 */
const FacilityPicker = ({ facilities, value, onChange }) => (
  <div className="mb-4 w-full max-w-[320px]">
    <SelectField
      label="Facility"
      value={value ?? ""}
      onChange={onChange}
    >
      {facilities.map((facility) => (
        <option key={facility.id} value={facility.id}>
          {facility.name}
        </option>
      ))}
    </SelectField>
  </div>
);

export default FacilityPicker;
