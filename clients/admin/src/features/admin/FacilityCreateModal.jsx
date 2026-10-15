import { useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
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
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Name
          </span>
          <input
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="e.g. Paco Park School"
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Address
          </span>
          <input
            value={draft.address}
            onChange={(event) => update({ address: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Note (optional)
          </span>
          <input
            value={draft.note}
            onChange={(event) => update({ note: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
              Max capacity
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={draft.maxCapacity}
              onChange={(event) => update({ maxCapacity: event.target.value })}
              placeholder="e.g. 400"
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
              Latitude
            </span>
            <input
              type="number"
              step="any"
              value={draft.latitude}
              onChange={(event) => update({ latitude: event.target.value })}
              placeholder="14.5995"
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
              Longitude
            </span>
            <input
              type="number"
              step="any"
              value={draft.longitude}
              onChange={(event) => update({ longitude: event.target.value })}
              placeholder="120.9842"
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
            />
          </label>
        </div>

        {error && <Banner tone="error">{error}</Banner>}

        <div className="flex justify-end gap-2">
          <Button variant="neutral" onClick={onClose} className="px-3 py-1.5 text-[9px]">
            Cancel
          </Button>
          <Button type="submit" disabled={busy} className="px-3 py-1.5 text-[9px]">
            {busy ? "Registering…" : "Register facility"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FacilityCreateModal;
