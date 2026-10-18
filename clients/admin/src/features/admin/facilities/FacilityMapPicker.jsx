import { LABEL_CLASS } from "../../../components/ui/fieldStyles";
import LocationPickerMap from "../../map/LocationPickerMap";
import { toCoords } from "../../map/coordinateUtils";

/**
 * Map half of the register-facility modal — label + Leaflet picker. The raw
 * draft strings are coerced via `toCoords` (empty strings stay "unset", so the
 * modal's validation keeps guarding the (0, 0) case); the picker emits numbers
 * via `onChange({ latitude, longitude })`.
 */
const FacilityMapPicker = ({ latitude, longitude, onChange }) => (
  <div>
    <p className={LABEL_CLASS}>Location on map</p>
    <LocationPickerMap
      value={toCoords(latitude, longitude)}
      onChange={onChange}
      height={280}
    />
  </div>
);

export default FacilityMapPicker;
