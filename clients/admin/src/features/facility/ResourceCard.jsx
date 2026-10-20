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
 * Compact operational tile: identity row (icon, name, essential chip), one
 * state line (status pill for availability resources, count + meter for
 * counted stock), then the controls. No fixed minimum height — the tile is
 * exactly as tall as its content.
 *
 * Every mutation goes to the API and the card re-renders only from the record
 * the API returns — there is no optimistic local update and no local fallback,
 * so a failed PATCH can never look like a successful one.
 *
 *   QUANTITY -> PATCH { availableValue }
 *   BOOLEAN  -> PATCH { isAvailable }
 *   remove   -> DELETE, behind an inline confirmation step
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
    <Card
      as="article"
      pad="p-3"
      className="flex flex-col gap-2 transition-colors hover:border-line-strong"
    >
      {/* Identity */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warm-soft text-warm-ink">
          <ResourceIcon name={resource.name} essentialType={resource.essentialType} size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-bold leading-tight text-ink-soft" title={resource.name}>
            {resource.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
            {quantity && <span className="truncate">{displaySubtitle(resource)}</span>}
            {resource.essentialType && (
              <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.5px] text-ink-soft">
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

      {/* State — for counted stock. Availability resources show their state on
          the control itself (the active segment is the label), so there is no
          redundant status row. */}
      {quantity && (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[17px] font-bold leading-none text-ink-soft">
              {displayValue(resource)}
              {unit && <span className="ml-1 text-[11px] font-medium text-muted">{unit}</span>}
            </p>
            {percentage !== null && (
              <span className="shrink-0 text-[10px] text-muted">{percentage}% stock</span>
            )}
          </div>
          {percentage !== null && (
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </>
      )}

      {error && (
        <Banner tone="error" className="px-2.5 py-1.5 text-[11px]">
          {error}
        </Banner>
      )}

      {/* Controls */}
      <div className="flex justify-center">
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
