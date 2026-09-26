/**
 * EvaRoute Application State Machine
 *
 * The 17 Figma frames are visual snapshots of these states.
 * The application is ONE map-centric experience, not 17 pages.
 * The map is always the background; only overlays change.
 *
 * Full implementation deferred to later phases.
 * This file establishes the type model for the state machine.
 */

import type { Facility } from '../types/facility';

/**
 * The EvaRoute state machine.
 * Union type — only one state is active at a time.
 */
export type EvaRouteState =
  | { status: 'initializing' }
  | { status: 'location_ready' }
  | { status: 'discovery'; sheetExpanded: boolean; searchQuery: string }
  | { status: 'center_selected'; centerId: string; sheetExpanded: boolean; facility: Facility }
  | { status: 'route_preview'; centerId: string; sheetExpanded: boolean }
  | { status: 'navigating'; centerId: string; sheetExpanded: boolean }
  | { status: 'arrived' };

/**
 * A partial snapshot of the state machine with all potentially-shared fields
 * made optional. Used as the transition payload type so callers may update
 * any combination of fields without narrowing the union first.
 *
 * The useAppState hook internally normalizes the payload back to the
 * narrow union after the transition.
 */
export type EvaRouteTransitionPayload = {
  status?: EvaRouteState['status'];
  sheetExpanded?: boolean;
  centerId?: string;
  facility?: Facility;
  searchQuery?: string;
};

/**
 * Placeholder interface for route data.
 * Not yet implemented — routing service is deferred.
 */
export interface RouteData {
  distance: number;    // kilometers
  duration: number;    // minutes
  polyline?: string;   // encoded polyline (future)
}

/**
 * Placeholder interface for navigation data.
 * Not yet implemented — navigation service is deferred.
 */
export interface NavigationData {
  currentInstruction: string;
  progress: number;    // 0-100
}

/**
 * Type guard: check if state is a discovery state
 */
export function isDiscoveryState(
  state: EvaRouteState,
): state is Extract<EvaRouteState, { status: 'discovery' }> {
  return state.status === 'discovery';
}

/**
 * Type guard: check if state is a center_selected state
 */
export function isCenterSelectedState(
  state: EvaRouteState,
): state is Extract<EvaRouteState, { status: 'center_selected' }> {
  return state.status === 'center_selected';
}

/**
 * Type guard: check if state is a route_preview state
 */
export function isRoutePreviewState(
  state: EvaRouteState,
): state is Extract<EvaRouteState, { status: 'route_preview' }> {
  return state.status === 'route_preview';
}

/**
 * Type guard: check if state is a navigating state
 */
export function isNavigatingState(
  state: EvaRouteState,
): state is Extract<EvaRouteState, { status: 'navigating' }> {
  return state.status === 'navigating';
}
