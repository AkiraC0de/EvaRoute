import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

/**
 * Radix Checkbox behind the native checkbox contract: `checked` +
 * onChange({ target: { checked } }) — same as the <input type="checkbox">
 * call sites used before.
 *
 * Clay material: a molded squircle (sunken when off, accent emboss when on)
 * with an invisible hit-area expansion to a 44px touch target.
 */
const Checkbox = ({
  id,
  checked,
  onChange,
  disabled,
  ariaLabel,
  className = "",
}) => (
  <CheckboxPrimitive.Root
    id={id}
    aria-label={ariaLabel}
    checked={checked}
    disabled={disabled}
    onCheckedChange={(next) => onChange?.({ target: { checked: next === true } })}
    className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-clay-sm border border-line bg-sunken shadow-clay-inset transition after:absolute after:-inset-3 after:rounded-clay-sm after:content-[''] data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:shadow-clay-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    <CheckboxPrimitive.Indicator>
      <Check size={11} strokeWidth={3} className="text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export default Checkbox;
