import TextField, { SelectField } from "../../../components/ui/Field";
import { LABEL_CLASS } from "../../../components/ui/fieldStyles";
import { formatCoords } from "../../map/coordinateUtils";
import EssentialResourcesField from "./EssentialResourcesField";

/**
 * Left column of the register-facility form — identity/capacity fields, the
 * essential-resources toggles and the read-only selected-location readout.
 * Controlled: `update(patch)` merges into the modal's draft.
 */
const FacilityFormFields = ({ draft, update }) => (
  <div className="space-y-3">
    <TextField
      label="Name"
      value={draft.name}
      onChange={(event) => update({ name: event.target.value })}
      placeholder="e.g. Paco Park School"
    />
    <TextField
      label="Address"
      value={draft.address}
      onChange={(event) => update({ address: event.target.value })}
    />
    <TextField
      label="Note (optional)"
      value={draft.note}
      onChange={(event) => update({ note: event.target.value })}
    />
    <TextField
      label="Max capacity"
      type="number"
      min="1"
      step="1"
      value={draft.maxCapacity}
      onChange={(event) => update({ maxCapacity: event.target.value })}
      placeholder="e.g. 400"
    />
    <SelectField
      label="Status"
      value={draft.status}
      onChange={(event) => update({ status: event.target.value })}
    >
      <option value="AVAILABLE">Available</option>
      <option value="UNAVAILABLE">Unavailable</option>
    </SelectField>
    <EssentialResourcesField
      value={draft.resources}
      onChange={(resources) => update({ resources })}
    />
    <div>
      <p className={LABEL_CLASS}>Selected location</p>
      <p className="rounded-clay-sm bg-sunken px-3 py-2 text-[12px] font-medium text-ink-soft shadow-clay-inset">
        {formatCoords(draft.latitude, draft.longitude) ||
          "Not set — pick it on the map"}
      </p>
    </div>
  </div>
);

export default FacilityFormFields;
