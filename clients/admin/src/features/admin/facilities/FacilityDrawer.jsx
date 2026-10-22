import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import Drawer from "../../../components/ui/Drawer";
import { useToast } from "../../../components/ui/toastContext";
import FacilityFormFields from "./FacilityFormFields";
import FacilityMapPicker from "./FacilityMapPicker";
import { isValidCoords } from "../../map/coordinateUtils";
import { ESSENTIAL_RESOURCES, defaultEssentialDraft } from "../../facility/essentialResources";
import * as api from "../../../lib/api";

/**
 * Facility drawer — ONE form pattern for registering and editing facilities
 * (the audit's create-modal/edit-page split is gone). Edit mode prefills from
 * the facility and patches; create mode also carries the map pin picker and
 * the initial essentials. Mirrors registerFacilitySchema client-side; the
 * server stays the authority (its duplicate-location 400 shows as-is).
 */
const draftFor = (facility) =>
  facility
    ? {
        name: facility.name ?? "",
        address: facility.address ?? "",
        note: facility.note ?? "",
        maxCapacity: String(facility.maxCapacity ?? ""),
        status: facility.status ?? "AVAILABLE",
        latitude: facility.latitude ?? "",
        longitude: facility.longitude ?? "",
        resources: defaultEssentialDraft(),
      }
    : {
        name: "",
        address: "",
        note: "",
        maxCapacity: "",
        status: "AVAILABLE",
        latitude: "",
        longitude: "",
        resources: defaultEssentialDraft(),
      };

const FacilityDrawer = ({ mode = "create", facility = null, onDone, onClose }) => {
  const toast = useToast();
  const isEdit = mode === "edit";
  const [draft, setDraft] = useState(() => draftFor(facility));
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

    setBusy(true);
    try {
      if (isEdit) {
        const saved = await api.patchFacility(facility.id, {
          name: draft.name.trim(),
          address: draft.address.trim(),
          note: draft.note.trim(),
          maxCapacity,
          status: draft.status,
        });
        toast.success("Facility updated.");
        onDone(saved);
      } else {
        // Validate the RAW draft values: Number("") coerces to 0, which would
        // pass as a real (0, 0) location after coercion.
        if (!isValidCoords(draft.latitude, draft.longitude)) {
          setError("Select the facility's location on the map.");
          setBusy(false);
          return;
        }
        await api.createFacility({
          name: draft.name.trim(),
          address: draft.address.trim(),
          note: draft.note.trim() || undefined,
          maxCapacity,
          status: draft.status,
          latitude: Number(draft.latitude),
          longitude: Number(draft.longitude),
          resources: ESSENTIAL_RESOURCES.map((entry) => ({
            essentialType: entry.key,
            isAvailable: draft.resources[entry.key] === true,
          })),
        });
        toast.success("Facility registered.");
        onDone();
      }
    } catch (err) {
      setError(err.message || `The facility could not be ${isEdit ? "updated" : "registered"}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? "Edit facility" : "Register facility"}
      description={
        isEdit
          ? "Update the facility record — location and essentials stay as registered."
          : "Add an evacuation center to the registry."
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FacilityFormFields draft={draft} update={update} />

        {!isEdit && (
          <FacilityMapPicker
            latitude={draft.latitude}
            longitude={draft.longitude}
            onChange={({ latitude, longitude }) => update({ latitude, longitude })}
          />
        )}

        {error && <Banner tone="error">{error}</Banner>}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="neutral" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy
              ? isEdit
                ? "Saving…"
                : "Registering…"
              : isEdit
                ? "Save changes"
                : "Register facility"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default FacilityDrawer;
