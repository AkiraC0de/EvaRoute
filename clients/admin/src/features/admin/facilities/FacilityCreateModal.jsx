import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import FacilityFormFields from "./FacilityFormFields";
import FacilityMapPicker from "./FacilityMapPicker";
import { isValidCoords } from "../../map/coordinateUtils";
import { ESSENTIAL_RESOURCES, defaultEssentialDraft } from "../../facility/essentialResources";
import * as api from "../../../lib/api";

/**
 * Register a new facility. Mirrors `registerFacilitySchema`
 * (server/src/validations/facility.validations.ts) client-side; the server
 * remains the authority (e.g. its duplicate-location 400 is shown as-is).
 *
 * Owns the draft, validation and submit flow; the field column and the
 * essential-resources toggles live in their own modules.
 */
const emptyDraft = () => ({
  name: "",
  address: "",
  note: "",
  maxCapacity: "",
  status: "AVAILABLE",
  latitude: "",
  longitude: "",
  // Initial availability of the three mandatory essentials (server creates
  // them regardless — this only sets the starting status).
  resources: defaultEssentialDraft(),
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
        resources: ESSENTIAL_RESOURCES.map((entry) => ({
          essentialType: entry.key,
          isAvailable: draft.resources[entry.key] === true,
        })),
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
          <FacilityFormFields draft={draft} update={update} />
          <FacilityMapPicker
            latitude={draft.latitude}
            longitude={draft.longitude}
            onChange={({ latitude, longitude }) => update({ latitude, longitude })}
          />
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
