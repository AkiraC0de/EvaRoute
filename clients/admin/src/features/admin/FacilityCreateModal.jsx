import { useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextField from "../../components/ui/Field";
import * as api from "../../lib/api";

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
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    if (!draft.name.trim() || !draft.address.trim()) {
      setError("Name and address are required.");
      return;
    }
    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
      setError("Maximum capacity must be a whole number greater than 0.");
      return;
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError("Latitude must be a number between -90 and 90.");
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Longitude must be a number between -180 and 180.");
      return;
    }

    setBusy(true);
    try {
      await api.createFacility({
        name: draft.name.trim(),
        address: draft.address.trim(),
        note: draft.note.trim() || undefined,
        maxCapacity,
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
    <Modal title="Register facility" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
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
        <div className="grid grid-cols-3 gap-2">
          <TextField
            label="Max capacity"
            type="number"
            min="1"
            step="1"
            value={draft.maxCapacity}
            onChange={(event) => update({ maxCapacity: event.target.value })}
            placeholder="e.g. 400"
          />
          <TextField
            label="Latitude"
            type="number"
            step="any"
            value={draft.latitude}
            onChange={(event) => update({ latitude: event.target.value })}
            placeholder="14.5995"
          />
          <TextField
            label="Longitude"
            type="number"
            step="any"
            value={draft.longitude}
            onChange={(event) => update({ longitude: event.target.value })}
            placeholder="120.9842"
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
