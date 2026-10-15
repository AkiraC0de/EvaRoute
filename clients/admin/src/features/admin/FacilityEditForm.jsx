import { useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import useAsyncAction from "../../hooks/useAsyncAction";
import * as api from "../../lib/api";

/**
 * Facility edit form (PATCH /facility/:facilityId). Mirrors
 * `patchFacilitySchema` — name, address, note, maxCapacity, status, lat/lng.
 * On success the parent gets the persisted record back and re-renders.
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
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]"
    >
      <h2 className="mb-3 text-[12px] font-bold text-[#35405e]">Facility details</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Name
          </span>
          <input
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
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
            Note
          </span>
          <input
            value={draft.note}
            onChange={(event) => update({ note: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          />
        </label>
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
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Status
          </span>
          <select
            value={draft.status}
            onChange={(event) => update({ status: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
              Latitude
            </span>
            <input
              type="number"
              step="any"
              value={draft.latitude}
              onChange={(event) => update({ latitude: event.target.value })}
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
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
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <Button type="submit" disabled={busy} className="mt-4 px-4 py-1.5 text-[9px]">
        {busy ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
};

export default FacilityEditForm;
