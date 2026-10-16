import { useMemo, useState } from "react";
import Banner from "../../components/ui/Banner";
import Card from "../../components/ui/Card";
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
    <Card as="article" pad="p-4" className="flex min-h-60 flex-col">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-clay-sm bg-accent-soft text-accent shadow-clay-inset">
          <ResourceIcon name={resource.name} essentialType={resource.essentialType} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[12px] font-bold text-ink-soft">{resource.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-muted">
            {displaySubtitle(resource)}
            {resource.essentialType && (
              <span className="rounded-full bg-accent-soft px-1.5 py-px text-[7px] font-bold uppercase tracking-[0.5px] text-accent">
                Essential
              </span>
            )}
          </p>
        </div>
        {!confirmingDelete && !resource.essentialType && (
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
          <span className="text-[18px] font-bold text-ink-soft">{displayValue(resource)}</span>
          {unit && <span className="ml-1 text-[9px] text-muted">{unit}</span>}
        </div>
        {quantity && percentage !== null && (
          <span className="shrink-0 text-[8px] text-muted">{percentage}% stock</span>
        )}
      </div>

      {quantity && percentage !== null && (
        <div className="mt-2">
          <div className="h-2 overflow-hidden rounded-full bg-sunken shadow-clay-inset">
            <div
              className="h-full rounded-full bg-success"
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
    </Card>
  );
};

export default ResourceCard;
