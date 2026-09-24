import { useState, useCallback } from 'react';
import type { EvaRouteState, EvaRouteTransitionPayload } from './app-state';

/**
 * useAppState — Hook for the EvaRoute state machine.
 *
 * Provides the current state and a transition function.
 * Full state machine implementation deferred to later phases.
 * This hook establishes the pattern for state management.
 *
 * State progression:
 *   initializing → location_ready → discovery → center_selected
 *   → route_preview → navigating → arrived
 */
export function useAppState() {
  const [state, setState] = useState<EvaRouteState>({
    status: 'initializing',
  });

  const transition = useCallback((payload: EvaRouteTransitionPayload) => {
    setState((prev) => ({ ...prev, ...payload } as EvaRouteState));
  }, []);

  return { state, transition };
}
