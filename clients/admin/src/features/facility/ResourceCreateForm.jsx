import { useState } from "react";
import Banner from "../../components/ui/Banner";

/**
 * Create a resource on the staff member's own facility.
 *
 * Contract: POST /api/v1/facility/:facilityId/resource (auth + EDIT_RESOURCE,
 * which FACILITY_STAFF holds). The validation below mirrors
 * server/src/validations/facilityResource.validations.ts so the server's own
 * rules are not re-invented; the server remains the authority and its error
 * message is what gets displayed on failure.
 *
 *   QUANTITY -> availableValue + maxValue required, isAvailable forbidden
 *   BOOLEAN  -> isAvailable required, availableValue/maxValue forbidden
 */
const emptyDraft = () => ({
  name: "",
  type: "QUANTITY",
  availableValue: "0",
  maxValue: "",
  isAvailable: true,
});

const ResourceCreateForm = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const validate = () => {
    const name = draft.name.trim();
    if (!name) return { message: "Enter a resource name." };

    if (draft.type === "QUANTITY") {
      const available = Number(draft.availableValue);
      const max = Number(draft.maxValue);
      if (!Number.isInteger(available) || available < 0) {
        return { message: "Available must be a whole number of 0 or more." };
      }
      if (!Number.isInteger(max) || max <= 0) {
        return { message: "Maximum must be a whole number greater than 0." };
      }
      if (available > max) {
        return { message: "Available cannot exceed the maximum." };
      }
      return { body: { name, type: "QUANTITY", availableValue: available, maxValue: max } };
    }

    return { body: { name, type: "BOOLEAN", isAvailable: draft.isAvailable } };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = validate();
    if (result.message) {
      setError(result.message);
      return;
    }

    setBusy(true);
    try {
      await onCreate(result.body);
      setDraft(emptyDraft());
      setOpen(false);
    } catch (err) {
      setError(err.message || "The resource could not be created.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          className="rounded-xl bg-[#5269ef] px-5 py-2.5 text-[9px] font-semibold text-white shadow-sm transition hover:bg-[#4058df]"
        >
          + Add resource
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.08)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[12px] font-bold text-[#35405e]">New resource</h2>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft());
            setError("");
            setOpen(false);
          }}
          className="text-[9px] font-semibold text-[#8290aa] transition hover:text-[#35405e]"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Name
          </span>
          <input
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="e.g. Beds"
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
            Type
          </span>
          <select
            value={draft.type}
            onChange={(event) => update({ type: event.target.value })}
            className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
          >
            <option value="QUANTITY">Quantity (counted)</option>
            <option value="BOOLEAN">Availability (yes / no)</option>
          </select>
        </label>

        {draft.type === "QUANTITY" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                Available
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.availableValue}
                onChange={(event) => update({ availableValue: event.target.value })}
                className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
                Maximum
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.maxValue}
                onChange={(event) => update({ maxValue: event.target.value })}
                placeholder="e.g. 400"
                className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] placeholder:text-[#9aa4b8] focus:ring-2"
              />
            </label>
          </>
        ) : (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.6px] text-[#8290aa]">
              Availability
            </span>
            <select
              value={draft.isAvailable ? "yes" : "no"}
              onChange={(event) => update({ isAvailable: event.target.value === "yes" })}
              className="h-9 w-full rounded-xl bg-[#f3f5fa] px-3 text-[10px] font-medium text-[#35405e] outline-none ring-[#5269ef] focus:ring-2"
            >
              <option value="yes">Available</option>
              <option value="no">Unavailable</option>
            </select>
          </label>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 min-h-9 w-full rounded-xl bg-[#5269ef] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#4058df] disabled:cursor-not-allowed disabled:bg-[#aeb9ee]"
      >
        {busy ? "Saving…" : "Create resource"}
      </button>
    </form>
  );
};

export default ResourceCreateForm;
