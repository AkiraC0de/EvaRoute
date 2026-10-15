import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

/**
 * Radix Checkbox behind the native checkbox contract: `checked` +
 * onChange({ target: { checked } }) — same as the <input type="checkbox">
 * call sites used before.
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
    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-line bg-white transition outline-none data-[state=checked]:border-accent data-[state=checked]:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    <CheckboxPrimitive.Indicator>
      <Check size={9} strokeWidth={3.5} className="text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export default Checkbox;
