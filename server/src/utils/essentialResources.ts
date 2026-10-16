import { EssentialResourceType } from "../../generated/prisma/index.js"

/**
 * Single source of truth for the three mandatory essential resources —
 * the DB rows are created from this list (names are stored on the rows so
 * the whole system displays one consistent label).
 *
 * The admin client mirrors this list in
 * clients/admin/src/features/facility/essentialResources.js — keep the two
 * in step when adding or renaming an essential.
 */
export const ESSENTIAL_RESOURCES: ReadonlyArray<{
  type: EssentialResourceType
  name: string
}> = [
  { type: "ELECTRICITY", name: "Electricity / Generator" },
  { type: "WATER", name: "Drinkable Water" },
  { type: "COMFORT_ROOM", name: "Comfort Room (CR)" },
]

/** Display-name aliases treated as the same essential (duplicate guard). */
const ESSENTIAL_NAME_ALIASES = new Set(
  ESSENTIAL_RESOURCES.flatMap((entry) => {
    const base = entry.name.toLowerCase()
    const aliases = [base]
    if (entry.type === "ELECTRICITY") aliases.push("electricity", "generator", "generators")
    if (entry.type === "WATER") aliases.push("water", "drinking water")
    if (entry.type === "COMFORT_ROOM") aliases.push("comfort room (cr)", "cr", "toilet", "toilets", "restroom", "restrooms")
    return aliases
  }),
)

/** True when a custom resource name collides with a mandatory essential. */
export const isEssentialName = (name: string): boolean =>
  ESSENTIAL_NAME_ALIASES.has(name.trim().toLowerCase())
