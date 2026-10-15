import { useMemo, useState } from "react";
import Banner from "../../components/ui/Banner";
import useAsyncAction from "../../hooks/useAsyncAction";
import {
  displaySubtitle,
  displayUnit,
  displayValue,
  isQuantity,
  stockPercentage,
} from "../../lib/resource";
import AvailabilityToggle from "./AvailabilityToggle";
import ConfirmDeleteBar from "./ConfirmDeleteBar";
import DeleteResourceButton from "./DeleteResourceButton";
import QuantityStepper from "./QuantityStepper";
import ResourceIcon from "./ResourceIcon";

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
 *
 * Delete flow matches the original card: the header trash button hides while
 * confirming, and the footer controls are REPLACED by the confirm strip.
 */
const ResourceCard = ({ resource, onSave, onDelete }) => {
  const { busy, error, setError, run } = useAsyncAction();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const quantity = isQuantity(resource);
  const percentage = useMemo(() => stockPercentage(resource), [resource]);
  const unit = displayUnit(resource);

  const step = (delta) =>
    run(() =>
      onSave({ availableValue: Math.max(0, (resource.availableValue ?? 0) + delta) }),
    );

  return (
    <article className="flex min-h-60 flex-col rounded-[18px] bg-white p-4 shadow-[0_8px_20px_rgba(40,60,100,0.07)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#5370f5]">
          <ResourceIcon name={resource.name} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[12px] font-bold text-[#35405e]">{resource.name}</h3>
          <p className="mt-0.5 text-[9px] text-[#7180a0]">{displaySubtitle(resource)}</p>
        </div>
        {!confirmingDelete && (
          <DeleteResourceButton
            name={resource.name}
            busy={busy}
            onAsk={() => {
              setError("");
              setConfirmingDelete(true);
            }}
          />
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
        <div className="mt-2">
          <Banner tone="error" className="px-2.5 py-1.5 text-[9px]">
            {error}
          </Banner>
        </div>
      )}

      <div className="mt-auto flex justify-center pt-3">
        {confirmingDelete ? (
          <ConfirmDeleteBar
            busy={busy}
            onConfirm={() =>
              run(async () => {
                await onDelete();
                setConfirmingDelete(false);
              })
            }
            onCancel={() => setConfirmingDelete(false)}
          />
        ) : quantity ? (
          <QuantityStepper
            name={resource.name}
            value={resource.availableValue ?? 0}
            busy={busy}
            onStep={step}
          />
        ) : (
          <AvailabilityToggle
            value={resource.isAvailable}
            busy={busy}
            onToggle={(next) => run(() => onSave({ isAvailable: next }))}
          />
        )}
      </div>
    </article>
  );
};

export default ResourceCard;
