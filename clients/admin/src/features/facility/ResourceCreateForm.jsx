import { useState } from "react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import TextField, { SelectField } from "../../components/ui/Field";

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
        <Button
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          size="sm"
        >
          + Add resource
        </Button>
      </div>
    );
  }

  return (
    <Card as="form" onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[12px] font-bold text-ink-soft">New resource</h2>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft());
            setError("");
            setOpen(false);
          }}
          className="text-[9px] font-semibold text-muted transition hover:text-ink-soft"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Name"
          value={draft.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder="e.g. Beds"
        />

        <SelectField
          label="Type"
          value={draft.type}
          onChange={(event) => update({ type: event.target.value })}
        >
          <option value="QUANTITY">Quantity (counted)</option>
          <option value="BOOLEAN">Availability (yes / no)</option>
        </SelectField>

        {draft.type === "QUANTITY" ? (
          <>
            <TextField
              label="Available"
              type="number"
              min="0"
              step="1"
              value={draft.availableValue}
              onChange={(event) => update({ availableValue: event.target.value })}
            />
            <TextField
              label="Maximum"
              type="number"
              min="1"
              step="1"
              value={draft.maxValue}
              onChange={(event) => update({ maxValue: event.target.value })}
              placeholder="e.g. 400"
            />
          </>
        ) : (
          <SelectField
            label="Availability"
            value={draft.isAvailable ? "yes" : "no"}
            onChange={(event) => update({ isAvailable: event.target.value === "yes" })}
            className="sm:col-span-2"
          >
            <option value="yes">Available</option>
            <option value="no">Unavailable</option>
          </SelectField>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <Button type="submit" disabled={busy} size="sm" className="mt-4 w-full">
        {busy ? "Saving…" : "Create resource"}
      </Button>
    </Card>
  );
};

export default ResourceCreateForm;
