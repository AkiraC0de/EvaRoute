/**
 * React-free bridge between the API layer and the query cache. `lib/api`
 * must not import React or the query client — main.jsx registers the real
 * invalidator at boot.
 */
let invalidate = async () => {};

export const setCacheInvalidator = (fn) => {
  invalidate = fn;
};

export const invalidateTags = (tags) => {
  if (tags?.length) return invalidate(tags);
  return undefined;
};
