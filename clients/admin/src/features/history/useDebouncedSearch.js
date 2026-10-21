import { useEffect, useState } from "react";

/**
 * Input value with a debounced mirror: the API is queried with `debounced`
 * once typing settles, while the input stays instant. Values are trimmed
 * when the debounce fires.
 */
export default function useDebouncedSearch(delay = 350, initial = "") {
  const [value, setValue] = useState(initial);
  const [debounced, setDebounced] = useState(initial.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return { value, debounced, setValue };
}
