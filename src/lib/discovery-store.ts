import { useSyncExternalStore } from "react";
import { EMPTY_FILTERS, type Filters } from "./profiles";

interface State {
  filters: Filters;
  unblurRequested: string[];
  bookmarked: string[];
  dismissed: string[];
}

let state: State = { filters: EMPTY_FILTERS, unblurRequested: [], bookmarked: [], dismissed: [] };
const listeners = new Set<() => void>();

export function setState(fn: (s: State) => State) {
  state = fn(state);
  listeners.forEach((l) => l());
}

export function useDiscovery() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
    () => state,
  );
}

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
export const actions = {
  setFilters: (filters: Filters) => setState((s) => ({ ...s, filters })),
  requestUnblur: (id: string) => setState((s) => ({ ...s, unblurRequested: toggle(s.unblurRequested, id) })),
  bookmark: (id: string) => setState((s) => ({ ...s, bookmarked: toggle(s.bookmarked, id) })),
  dismiss: (id: string) => setState((s) => ({ ...s, dismissed: [...s.dismissed, id] })),
  resetDismissed: () => setState((s) => ({ ...s, dismissed: [] })),
};
