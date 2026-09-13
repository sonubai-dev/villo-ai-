/**
 * Vilo V1 - Editor History & Safe Undo/Redo Engine
 * Maintains an immutable snapshot ring buffer for effortless undo/redo
 * and tracks dirty state for background autosaving.
 */

import { Project } from "@/lib/types";

export interface HistoryState {
  past: Project[];
  present: Project;
  future: Project[];
}

export class HistoryManager {
  private static MAX_HISTORY = 40;

  public static push(state: HistoryState, newPresent: Project): HistoryState {
    // If state is identical, don't create new history entry
    if (JSON.stringify(state.present) === JSON.stringify(newPresent)) {
      return state;
    }

    const past = [...state.past, state.present].slice(-HistoryManager.MAX_HISTORY);
    return {
      past,
      present: newPresent,
      future: [], // Clear redo stack on new action
    };
  }

  public static undo(state: HistoryState): HistoryState {
    if (state.past.length === 0) return state;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    return {
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  public static redo(state: HistoryState): HistoryState {
    if (state.future.length === 0) return state;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    return {
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    };
  }

  public static canUndo(state: HistoryState): boolean {
    return state.past.length > 0;
  }

  public static canRedo(state: HistoryState): boolean {
    return state.future.length > 0;
  }
}
