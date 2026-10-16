import { Bed, Cross, Droplets, Package, Toilet, UtensilsCrossed, Zap } from "lucide-react";

/**
 * Icon for a `FacilityResource` record. Mandatory essentials match by their
 * stable identifier first; custom resources fall back to name matching
 * (the API stores no icon field), then a generic package icon.
 */
const ESSENTIAL_ICONS = {
  ELECTRICITY: Zap,
  WATER: Droplets,
  COMFORT_ROOM: Toilet,
};

const ICONS = {
  Beds: Bed,
  Water: Droplets,
  Food: UtensilsCrossed,
  "Medical Kits": Cross,
  Toilets: Toilet,
  Generators: Zap,
};

const ResourceIcon = ({ name, essentialType, size = 17 }) => {
  const Icon =
    (essentialType && ESSENTIAL_ICONS[essentialType]) || ICONS[name] || Package;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
};

export default ResourceIcon;
