import { useState } from "react";
import { Package, Plus } from "lucide-react";
import Banner from "../../components/ui/Banner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextField, { SelectField } from "../../components/ui/Field";

/**
 * Create a resource on the staff member's own facility, in a dialog.
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

  const close = () => {
    setDraft(emptyDraft());
    setError("");
    setOpen(false);
  };

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
      close();
    } catch (err) {
      setError(err.message || "The resource could not be created.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5">
        <Plus size={12} strokeWidth={2.2} aria-hidden="true" /> Add resource
      </Button>

      {open && (
        <Modal
          title={
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
              >
                <Package size={14} strokeWidth={1.9} />
              </span>
              New resource
            </span>
          }
          onClose={close}
        >
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-[10px] leading-relaxed text-muted">
              Add a supply or amenity to this facility. Counted resources track
              how much is left; availability resources are simply in stock or not.
            </p>

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

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button type="button" variant="neutral" size="sm" onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy} size="sm" className="min-w-28">
                {busy ? "Saving…" : "Create resource"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ResourceCreateForm;
