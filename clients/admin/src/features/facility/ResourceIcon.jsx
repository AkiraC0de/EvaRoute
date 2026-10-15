import { Bed, Cross, Droplets, Package, Toilet, UtensilsCrossed, Zap } from "lucide-react";

/**
 * Icon for a `FacilityResource` record, chosen by its name (the API stores no
 * icon field). Unknown names fall back to a generic package icon.
 */
const ICONS = {
  Beds: Bed,
  Water: Droplets,
  Food: UtensilsCrossed,
  "Medical Kits": Cross,
  Toilets: Toilet,
  Generators: Zap,
};

const ResourceIcon = ({ name, size = 17 }) => {
  const Icon = ICONS[name] ?? Package;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
};

export default ResourceIcon;
