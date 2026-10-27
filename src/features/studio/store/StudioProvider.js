"use client";

import { createContext, use, useEffect, useMemo, useReducer, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api-client";
import { pluralize } from "@/lib/format";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { createInitialState, selectActiveShot, studioReducer } from "./studio-reducer";

const StateContext = createContext(null);
const ActionsContext = createContext(null);

/**
 * Owns one Studio project. Edits (takes, notes, approvals, DNA) are saved locally,
 * so a returning user lands exactly where they left off.
 */
export function StudioProvider({ initialProject, children }) {
  const [state, dispatch] = useReducer(studioReducer, initialProject, createInitialState);
  const { toast } = useToast();
  const stateRef = useRef(state);
  const controllerRef = useRef(null);
  const storageKey = STORAGE_KEYS.studio(initialProject.id);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    dispatch({ type: "hydrate", payload: readJson(storageKey, null) });
  }, [storageKey]);

  useEffect(() => {
    if (!state.hydrated) return;
    writeJson(storageKey, {
      project: state.project,
      activeShotId: state.activeShotId,
      selection: state.selection,
    });
  }, [storageKey, state.hydrated, state.project, state.activeShotId, state.selection]);

  // Abort an in-flight request if the user leaves the page.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const actions = useMemo(() => {
    async function iterate({ parentId, direction, notes, strength, count }) {
      const current = stateRef.current;
      if (current.pending) return;
      const shot = selectActiveShot(current);
      const parent = shot.takes.find((take) => take.id === parentId);
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: "iterate/start", payload: { shotId: shot.id, parentId, count, startedAt: Date.now() } });

      try {
        const { takes } = await api.createTakes(
          initialProject.id,
          {
            shotId: shot.id,
            parentId,
            direction,
            notes,
            strength,
            count,
            // Parent first: the mock uses it to keep new takes close to the original.
            exclude: [parent?.mediaId, ...shot.takes.map((take) => take.mediaId)].filter(Boolean),
          },
          { signal: controller.signal },
        );
        dispatch({ type: "iterate/success", payload: { shotId: shot.id, takes } });
        toast(`${pluralize(takes.length, "new take")} on ${shot.name}`, { type: "success" });
        return true;
      } catch (error) {
        dispatch({ type: "iterate/end" });
        if (error?.name === "AbortError") {
          toast("Stopped", { type: "info", duration: 1800 });
        } else {
          toast(error.message, {
            type: "error",
            duration: 6000,
            action: { label: "Retry", onClick: () => iterate({ parentId, direction, notes, strength, count }) },
          });
        }
        return false;
      } finally {
        controllerRef.current = null;
      }
    }

    return {
      iterate,
      cancelIterate: () => controllerRef.current?.abort(),
      selectShot: (shotId) => dispatch({ type: "shot/select", payload: shotId }),
      selectTake: (shotId, takeId) => dispatch({ type: "take/select", payload: { shotId, takeId } }),
      setTool: (tool) => dispatch({ type: "tool/set", payload: tool }),
      toggleApproval: (shotId, takeId) => dispatch({ type: "take/approve", payload: { shotId, takeId } }),
      addNote: (shotId, takeId, note) => dispatch({ type: "note/add", payload: { shotId, takeId, note } }),
      removeNote: (shotId, takeId, noteId) =>
        dispatch({ type: "note/remove", payload: { shotId, takeId, noteId } }),
      updateDna: (patch) => dispatch({ type: "dna/update", payload: patch }),
      toggleLock: (field) => dispatch({ type: "dna/lock", payload: field }),
      reset: () => dispatch({ type: "reset", payload: initialProject }),
    };
  }, [initialProject, toast]);

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>{children}</StateContext>
    </ActionsContext>
  );
}

export function useStudio() {
  const context = use(StateContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>");
  return context;
}

export function useStudioActions() {
  const context = use(ActionsContext);
  if (!context) throw new Error("useStudioActions must be used inside <StudioProvider>");
  return context;
}
