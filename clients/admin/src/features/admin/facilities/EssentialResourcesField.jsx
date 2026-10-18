import { LABEL_CLASS } from "../../../components/ui/fieldStyles";
import ResourceIcon from "../../facility/ResourceIcon";
import ResourceStatusToggle from "../../facility/ResourceStatusToggle";
import { ESSENTIAL_RESOURCES } from "../../facility/essentialResources";

/**
 * Essential-resources availability toggles for the register-facility form.
 * `value` is the draft's per-key boolean map; `onChange(next)` replaces it.
 */
const EssentialResourcesField = ({ value, onChange }) => (
  <div>
    <p className={LABEL_CLASS}>Essential resources</p>
    <div className="space-y-2 rounded-clay-sm bg-sunken p-2.5 shadow-clay-inset">
      {ESSENTIAL_RESOURCES.map((entry) => (
        <div key={entry.key} className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-clay-sm bg-surface text-accent shadow-clay-xs"
            >
              <ResourceIcon essentialType={entry.key} size={14} />
            </span>
            <span className="truncate text-[12px] font-semibold text-ink-soft">
              {entry.label}
            </span>
          </span>
          <ResourceStatusToggle
            name={entry.label}
            value={value[entry.key]}
            onChange={(next) => onChange({ ...value, [entry.key]: next })}
          />
        </div>
      ))}
    </div>
  </div>
);

export default EssentialResourcesField;
