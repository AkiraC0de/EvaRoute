import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import TextField, { SelectField } from "../../../components/ui/Field";
import { LABEL_CLASS } from "../../../components/ui/fieldStyles";
import LocationPickerMap from "../../map/LocationPickerMap";
import { formatCoords, toCoords } from "../../map/coordinateUtils";
import useAsyncAction from "../../../hooks/useAsyncAction";
import * as api from "../../../lib/api";

/**
 * Facility edit form (PATCH /facility/:facilityId). Mirrors
 * `patchFacilitySchema` — name, address, note, maxCapacity, status, lat/lng.
 * On success the parent gets the persisted record back and re-renders.
 *
 * Field widths are proportional to what the field holds, not equal thirds:
 * name and note are long text (8/12), address is the longest (12/12), while
 * max capacity (a number) and status (a short enum) stay compact (4/12).
 */
const FacilityEditForm = ({ facility, onSaved }) => {
  const { busy, error, run } = useAsyncAction();
  const [draft, setDraft] = useState({
    name: facility.name,
    address: facility.address,
    note: facility.note ?? "",
    maxCapacity: String(facility.maxCapacity),
    status: facility.status,
    latitude: String(facility.latitude),
    longitude: String(facility.longitude),
  });

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const submit = () =>
    run(async () => {
      const saved = await api.patchFacility(facility.id, {
        name: draft.name.trim(),
        address: draft.address.trim(),
        note: draft.note.trim(),
        maxCapacity: Number(draft.maxCapacity),
        status: draft.status,
        latitude: Number(draft.latitude),
        longitude: Number(draft.longitude),
      });
      onSaved(saved);
    });

  return (
    <Card as="form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <h2 className="mb-3 text-[13px] font-bold text-ink-soft">Facility details</h2>

      {/* Row 1 — identity: two long-text fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <TextField
            label="Name"
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </div>

        <div>
          <TextField
            label="Address"
            value={draft.address}
            onChange={(event) => update({ address: event.target.value })}
          />
        </div>
      </div>

      {/* Row 2 — settings: widths are affordances for the data (a number, a
          short enum, then free text that takes the rest). */}
      <div className="mt-3 grid gap-3 sm:grid-cols-[7.5rem_10.5rem_minmax(0,1fr)]">
        <div>
          <TextField
            label="Max capacity"
            type="number"
            min="1"
            step="1"
            value={draft.maxCapacity}
            onChange={(event) => update({ maxCapacity: event.target.value })}
          />
        </div>

        <div>
          <SelectField
            label="Status"
            value={draft.status}
            onChange={(event) => update({ status: event.target.value })}
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </SelectField>
        </div>

        <div>
          <TextField
            label="Note"
            value={draft.note}
            onChange={(event) => update({ note: event.target.value })}
            placeholder="e.g. Access instructions, operating hours…"
          />
        </div>
      </div>

      <div className="mt-3">
        <p className={LABEL_CLASS}>Location on map</p>
        <LocationPickerMap
          value={toCoords(draft.latitude, draft.longitude)}
          onChange={({ latitude, longitude }) => update({ latitude, longitude })}
          height={240}
        />
        <p className="mt-1 text-[11px] text-muted">
          {formatCoords(draft.latitude, draft.longitude) ||
            "No location set — click the map to place the marker."}
        </p>
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <div className="w-full text-end">
        <Button type="submit" disabled={busy} size="sm" className="mt-4">
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
};

export default FacilityEditForm;
