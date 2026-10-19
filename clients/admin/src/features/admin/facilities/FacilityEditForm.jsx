import { useState } from "react";
import { Pencil } from "lucide-react";
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
 * Facility details card (PATCH /facility/:facilityId). Mirrors
 * `patchFacilitySchema` — name, address, note, maxCapacity, status, lat/lng.
 *
 * VIEW / EDIT modes: the card opens read-only (fields inert, map inert) and
 * only becomes editable after the operator clicks "Edit" — so a stray map
 * click or drag can never silently change the stored location. While
 * editing, "Cancel" discards the draft and "Save changes" persists and
 * returns to view mode.
 *
 * Field widths are proportional to what the field holds, not equal thirds:
 * name and note are long text (8/12), address is the longest (12/12), while
 * max capacity (a number) and status (a short enum) stay compact (4/12).
 */
const makeDraft = (facility) => ({
  name: facility.name,
  address: facility.address,
  note: facility.note ?? "",
  maxCapacity: String(facility.maxCapacity),
  status: facility.status,
  latitude: String(facility.latitude),
  longitude: String(facility.longitude),
});

const FacilityEditForm = ({ facility, onSaved }) => {
  const { busy, error, run } = useAsyncAction();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => makeDraft(facility));

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const cancelEdit = () => {
    setDraft(makeDraft(facility));
    setEditing(false);
  };

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
      setEditing(false);
    });

  return (
    <Card as="form" onSubmit={(event) => { event.preventDefault(); if (editing) submit(); }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-ink-soft">Facility details</h2>
        {!editing && (
          <Button type="button" variant="neutral" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={12} strokeWidth={2} className="mr-1" /> Edit
          </Button>
        )}
      </div>

      {/* Row 1 — identity: two long-text fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <TextField
            label="Name"
            value={draft.name}
            readOnly={!editing}
            onChange={(event) => update({ name: event.target.value })}
          />
        </div>

        <div>
          <TextField
            label="Address"
            value={draft.address}
            readOnly={!editing}
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
            readOnly={!editing}
            onChange={(event) => update({ maxCapacity: event.target.value })}
          />
        </div>

        <div>
          <SelectField
            label="Status"
            value={draft.status}
            disabled={!editing}
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
            readOnly={!editing}
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
          disabled={!editing}
        />
        <p className="mt-1 text-[11px] text-muted">
          {formatCoords(draft.latitude, draft.longitude) ||
            "No location set — click the map to place the marker."}
          {!editing && " · Click Edit above to move the marker."}
        </p>
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {editing ? (
        <div className="mt-4 flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={cancelEdit}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy} size="sm">
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-[11px] text-muted">
          View only — click Edit to change the details or the map location.
        </p>
      )}
    </Card>
  );
};

export default FacilityEditForm;
