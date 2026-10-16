import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField, { SelectField } from "../../../components/ui/Field";
import { LABEL_CLASS } from "../../../components/ui/fieldStyles";
import LocationPickerMap from "../../map/LocationPickerMap";
import { formatCoords, isValidCoords, toCoords } from "../../map/coordinateUtils";
import * as api from "../../../lib/api";

/**
 * Register a new facility. Mirrors `registerFacilitySchema`
 * (server/src/validations/facility.validations.ts) client-side; the server
 * remains the authority (e.g. its duplicate-location 400 is shown as-is).
 */
const emptyDraft = () => ({
  name: "",
  address: "",
  note: "",
  maxCapacity: "",
  status: "AVAILABLE",
  latitude: "",
  longitude: "",
});

const FacilityCreateModal = ({ onCreated, onClose }) => {
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const maxCapacity = Number(draft.maxCapacity);

    if (!draft.name.trim() || !draft.address.trim()) {
      setError("Name and address are required.");
      return;
    }
    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
      setError("Maximum capacity must be a whole number greater than 0.");
      return;
    }
    // Validate the RAW draft values: Number("") coerces to 0, which would pass
    // as a real (0, 0) location after coercion.
    if (!isValidCoords(draft.latitude, draft.longitude)) {
      setError("Select the facility's location on the map.");
      return;
    }
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    setBusy(true);
    try {
      await api.createFacility({
        name: draft.name.trim(),
        address: draft.address.trim(),
        note: draft.note.trim() || undefined,
        maxCapacity,
        status: draft.status,
        latitude,
        longitude,
      });
      onCreated();
    } catch (err) {
      setError(err.message || "The facility could not be registered.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Register facility" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <p className={LABEL_CLASS}>Selected location</p>
              <p className="rounded-clay-sm bg-sunken px-3 py-2 text-[10px] font-medium text-ink-soft shadow-clay-inset">
                {formatCoords(draft.latitude, draft.longitude) ||
                  "Not set — pick it on the map"}
              </p>
            </div>
          </div>
          <div>
            <p className={LABEL_CLASS}>Location on map</p>
            <LocationPickerMap
              value={toCoords(draft.latitude, draft.longitude)}
              onChange={({ latitude, longitude }) => update({ latitude, longitude })}
              height={280}
            />
          </div>
        </div>

        {error && <Banner tone="error">{error}</Banner>}

        <div className="flex justify-end gap-2">
          <Button variant="neutral" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Registering…" : "Register facility"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FacilityCreateModal;
