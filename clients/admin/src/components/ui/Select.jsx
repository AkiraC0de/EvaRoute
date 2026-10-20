import { Children } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

/**
 * Radix Select behind the native <select> contract, so every existing call
 * site keeps working unchanged: pass <option value> children, receive
 * onChange({ target: { value } }) with a STRING value (like a native select).
 *
 * Empty-string option values ("All statuses") are mapped to an internal
 * sentinel because Radix reserves "" for the placeholder.
 */
const EMPTY_SENTINEL = "__select_empty__";

function optionsFromChildren(children) {
  const items = [];
  Children.forEach(children, (child) => {
    if (!child || typeof child !== "object") return;
    const { value, disabled, children: label } = child.props ?? {};
    if (value === undefined) return;
    items.push({
      // Radix reserves "" for placeholders — empty native values map to the
      // sentinel here too so the root value and item value always match.
      value: value === "" ? EMPTY_SENTINEL : String(value),
      label: String(label ?? value),
      disabled: Boolean(disabled),
    });
  });
  return items;
}

const SelectInput = ({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  ariaLabel,
  className = "",
  children,
}) => {
  const items = optionsFromChildren(children);
  const internalValue =
    value === "" || value === undefined || value === null
      ? EMPTY_SENTINEL
      : String(value);

  return (
    <span className="relative block">
      <SelectPrimitive.Root
        value={internalValue}
        disabled={disabled}
        onValueChange={(next) =>
          onChange?.({
            target: { value: next === EMPTY_SENTINEL ? "" : next },
          })
        }
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-label={ariaLabel}
          onBlur={onBlur}
          disabled={disabled}
          className={`truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink ${className}`}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="popper-in z-[70] max-h-64 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lg"
          >
            <SelectPrimitive.Viewport>
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-ink-soft outline-none transition hover:bg-surface-2 data-[highlighted]:bg-surface-2 data-[state=checked]:text-primary-ink data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={11} strokeWidth={2.5} className="text-primary-ink" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </span>
  );
};

export default SelectInput;
