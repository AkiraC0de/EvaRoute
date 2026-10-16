/**
 * ArrivalOverlay — the "you have arrived" end state.
 */
import { useAppState } from '../../contexts/AppStateContext';
import ArrivalOverlayCard from './ArrivalOverlayCard';

export default function ArrivalOverlay() {
  const { state, actions } = useAppState();
  return <ArrivalOverlayCard facility={state.facility} onFinish={actions.backToDiscovery} />;
}
