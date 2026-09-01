import { useState, useCallback, useRef } from 'react';
import { Device, Link, NetworkContainer } from '../types';

export interface TopologyState {
  nodes: Device[];
  links: Link[];
  containers: NetworkContainer[];
}

interface HistoryState {
  past: TopologyState[];
  present: TopologyState;
  future: TopologyState[];
  lastActionText: string | null;
}

export function useHistory(initialState: TopologyState) {
  const [state, setState] = useState<HistoryState>(() => ({
    past: [],
    present: initialState,
    future: [],
    lastActionText: null,
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  // Deep comparison to avoid duplicate snapshots
  const isEquivalentState = (a: TopologyState, b: TopologyState): boolean => {
    if (
      a.nodes.length !== b.nodes.length ||
      a.links.length !== b.links.length ||
      a.containers.length !== b.containers.length
    ) {
      return false;
    }
    return JSON.stringify(a) === JSON.stringify(b);
  };

  const pushSnapshot = useCallback((newState: TopologyState, label?: string) => {
    const current = stateRef.current.present;
    if (isEquivalentState(current, newState)) {
      return;
    }

    setState((prev) => {
      const nextPast = [...prev.past, prev.present];
      if (nextPast.length > 50) {
        nextPast.shift();
      }
      return {
        past: nextPast,
        present: newState,
        future: [],
        lastActionText: label || 'Ändring',
      };
    });
  }, []);

  const pushSnapshotWithCustomPast = useCallback((pastState: TopologyState, presentState: TopologyState, label?: string) => {
    if (isEquivalentState(pastState, presentState)) {
      return;
    }

    setState((prev) => {
      const nextPast = [...prev.past, pastState];
      if (nextPast.length > 50) {
        nextPast.shift();
      }
      return {
        past: nextPast,
        present: presentState,
        future: [],
        lastActionText: label || 'Ändring',
      };
    });
  }, []);

  const undo = useCallback((): TopologyState | null => {
    const { past, present, future } = stateRef.current;
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setState({
      past: newPast,
      present: previous,
      future: [present, ...future],
      lastActionText: 'Ångrade ändring',
    });

    return previous;
  }, []);

  const redo = useCallback((): TopologyState | null => {
    const { past, present, future } = stateRef.current;
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    setState({
      past: [...past, present],
      present: next,
      future: newFuture,
      lastActionText: 'Gjorde om ändring',
    });

    return next;
  }, []);

  const resetHistory = useCallback((newState: TopologyState) => {
    setState({
      past: [],
      present: newState,
      future: [],
      lastActionText: null,
    });
  }, []);

  const setPresentDirectly = useCallback((newState: TopologyState) => {
    setState((prev) => ({
      ...prev,
      present: newState,
    }));
  }, []);

  return {
    nodes: state.present.nodes,
    links: state.present.links,
    containers: state.present.containers,
    presentState: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undoCount: state.past.length,
    redoCount: state.future.length,
    lastActionText: state.lastActionText,
    pushSnapshot,
    pushSnapshotWithCustomPast,
    undo,
    redo,
    resetHistory,
    setPresentDirectly,
  };
}
