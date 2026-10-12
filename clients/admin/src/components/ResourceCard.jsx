import { useState } from "react";
import {
  displaySubtitle,
  displayUnit,
  displayValue,
  isQuantity,
  stockPercentage,
} from "../lib/resource";

/**
 * A single facility resource, backed by a real `FacilityResource` record.
 *
 * Every mutation goes to the API and the card re-renders only from the record
 * the API returns — there is no optimistic local update and no local fallback,
 * so a failed PATCH can never look like a successful one.
 *
 *   QUANTITY -> PATCH { availableValue }
 *   BOOLEAN  -> PATCH { isAvailable }
 *   remove   -> DELETE, behind an inline confirmation step
 */

const ICON_PATHS = {
  Beds: (
    <>
      <path d="M3 18v-7h18v7" />
      <path d="M3 14h18" />
      <path d="M6 11V7h5a3 3 0 0 1 3 3v1" />
      <path d="M3 18v2M21 18v2" />
    </>
  ),
  Water: <path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />,
  Food: (
    <>
      <path d="M4 12h16" />
      <path d="M5 12a7 7 0 0 0 14 0" />
      <path d="M12 5v2M8 7l1 2M16 7l-1 2" />
    </>
  ),
  "Medical Kits": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  Toilets: (
    <>
      <path d="M7 4h10v6H7z" />
      <path d="M8 10h8v2a4 4 0 0 1-8 0v-2ZM10 16v4M14 16v4" />
    </>
  ),
  Generators: <path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" />,
  Default: (
    <>
      <path d="M4 7h16v13H4z" />
      <path d="M4 11h16M9 7V4h6v3" />
    </>
  ),
};

const ResourceCard = ({ resource, onSave, onDelete }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const quantity = isQuantity(resource);
  const percentage = stockPercentage(resource);
  const unit = displayUnit(resource);

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message || "The change could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const step = (delta) =>
    run(() =>
      onSave({ availableValue: Math.max(0, (resource.availableValue ?? 0) + delta) }),
    );

  const setAvailability = (next) => run(() => onSave({ isAvailable: next }));

  return (
    <article className="flex min-h-60 flex-col rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.07)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#5370f5]">
          <svg
            aria-hidden="true"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICON_PATHS[resource.name] || ICON_PATHS.Default}
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[12px] font-bold text-[#35405e]">{resource.name}</h3>
          <p className="mt-0.5 text-[9px] text-[#7180a0]">{displaySubtitle(resource)}</p>
        </div>
        {!confirmingDelete && (
          <button
            type="button"
            aria-label={`Remove ${resource.name}`}
            disabled={busy}
            onClick={() => {
              setError("");
              setConfirmingDelete(true);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9aa4b8] transition hover:bg-[#fbe4e3] hover:text-[#d8322d] disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6" />
              <path d="M6 7l1 13h10l1-13" />
              <path d="M9 7V4h6v3" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div>
          <span className="text-[18px] font-bold text-[#35405e]">{displayValue(resource)}</span>
          {unit && <span className="ml-1 text-[9px] text-[#7180a0]">{unit}</span>}
        </div>
        {quantity && percentage !== null && (
          <span className="shrink-0 text-[8px] text-[#8995ad]">{percentage}% stock</span>
        )}
      </div>

      {quantity && percentage !== null && (
        <div className="mt-2">
          <div className="h-2 overflow-hidden rounded-full bg-[#edf0f6]">
            <div
              className="h-full rounded-full bg-[#4bc996]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-[#fbe4e3] px-2.5 py-1.5 text-[9px] font-semibold text-[#d8322d]"
        >
          {error}
        </p>
      )}

      <div className="mt-auto flex justify-center pt-3">
        {confirmingDelete ? (
          <div className="flex w-full items-center gap-2 rounded-full bg-[#fbe4e3] p-1">
            <span className="pl-2 text-[9px] font-semibold text-[#d8322d]">Remove?</span>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await onDelete();
                  setConfirmingDelete(false);
                })
              }
              className="ml-auto rounded-full bg-[#d8322d] px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-[#b3261f] disabled:opacity-60"
            >
              {busy ? "Removing…" : "Remove"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-[#65718c] transition hover:bg-[#f0f2f7] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        ) : quantity ? (
          <div className="flex items-center gap-1 rounded-full bg-[#f0f2f7] p-1">
            {[-1, -10].map((delta) => (
              <button
                key={delta}
                type="button"
                aria-label={`${delta} ${resource.name}`}
                disabled={busy}
                onClick={() => step(delta)}
                className="min-w-9 rounded-full bg-white px-2 py-1.5 text-[10px] font-semibold text-[#5269ef] transition hover:bg-[#e8edff] focus-visible:outline-2 focus-visible:outline-[#5269ef] disabled:opacity-50"
              >
                {delta}
              </button>
            ))}
            <span className="min-w-9 text-center text-[9px] font-bold text-[#35405e]">
              {busy ? "…" : (resource.availableValue ?? 0)}
            </span>
            {[10, 1].map((delta) => (
              <button
                key={delta}
                type="button"
                aria-label={`+${delta} ${resource.name}`}
                disabled={busy}
                onClick={() => step(delta)}
                className="min-w-9 rounded-full bg-white px-2 py-1.5 text-[10px] font-semibold text-[#5269ef] transition hover:bg-[#e8edff] focus-visible:outline-2 focus-visible:outline-[#5269ef] disabled:opacity-50"
              >
                +{delta}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex w-full items-center rounded-full bg-[#f0f2f7] p-1">
            <button
              type="button"
              aria-pressed={resource.isAvailable === true}
              disabled={busy}
              onClick={() => setAvailability(true)}
              className={`flex-1 rounded-full px-3 py-1.5 text-[9px] font-semibold transition disabled:opacity-60 ${
                resource.isAvailable === true
                  ? "bg-[#188f61] text-white"
                  : "text-[#8995ad] hover:text-[#35405e]"
              }`}
            >
              Available
            </button>
            <button
              type="button"
              aria-pressed={resource.isAvailable === false}
              disabled={busy}
              onClick={() => setAvailability(false)}
              className={`flex-1 rounded-full px-3 py-1.5 text-[9px] font-semibold transition disabled:opacity-60 ${
                resource.isAvailable === false
                  ? "bg-[#dbe1ed] text-[#35405e]"
                  : "text-[#8995ad] hover:text-[#35405e]"
              }`}
            >
              Unavailable
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default ResourceCard;
