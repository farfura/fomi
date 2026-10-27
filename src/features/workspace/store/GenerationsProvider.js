"use client";

import { createContext, use, useEffect, useMemo, useReducer, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api-client";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { estimateDuration } from "../constants";
import { createInitialState, generationsReducer } from "./generations-reducer";

const StateContext = createContext(null);
const ActionsContext = createContext(null);
const CatalogContext = createContext(null);

const LOCAL_LIMIT = 40;

/**
 * Owns the generation history for the whole app.
 * State and actions live in separate contexts: components that only trigger actions
 * (buttons, menus) never re-render when the feed changes.
 */
export function GenerationsProvider({ initialPage, catalog, children }) {
  const [state, dispatch] = useReducer(generationsReducer, initialPage, createInitialState);
  const { toast } = useToast();
  const controllers = useRef(new Map());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  // Restore the user's own generations, favourites and deletions after hydration.
  useEffect(() => {
    const saved = readJson(STORAGE_KEYS.workspace, {});
    dispatch({ type: "hydrate", payload: saved });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const local = state.items.filter((item) => state.localIds.includes(item.id)).slice(0, LOCAL_LIMIT);
    writeJson(STORAGE_KEYS.workspace, {
      local,
      favorites: state.favorites,
      removed: state.removed,
    });
  }, [state.hydrated, state.items, state.localIds, state.favorites, state.removed]);

  const actions = useMemo(() => {
    async function generate(request) {
      const model = catalog.models.find((item) => item.id === request.modelId);
      const jobId = `job_${Date.now()}`;
      const controller = new AbortController();
      controllers.current.set(jobId, controller);
      dispatch({
        type: "generate/start",
        payload: {
          id: jobId,
          request,
          startedAt: Date.now(),
          eta: estimateDuration({ mode: request.mode, modelEta: model?.eta, count: request.count }),
        },
      });

      try {
        const { generation } = await api.createGeneration(request, { signal: controller.signal });
        dispatch({ type: "generate/success", payload: { jobId, generation } });
        return generation;
      } catch (error) {
        dispatch({ type: "generate/end", payload: { jobId } });
        if (error?.name === "AbortError") {
          toast("Generation cancelled", { type: "info" });
          return null;
        }
        toast(error.message, {
          type: "error",
          duration: 6000,
          action: { label: "Retry", onClick: () => generate(request) },
        });
        return null;
      } finally {
        controllers.current.delete(jobId);
      }
    }

    function cancel(jobId) {
      controllers.current.get(jobId)?.abort();
    }

    async function loadMore() {
      const current = stateRef.current;
      if (current.loadingMore || !current.hasMore) return;
      dispatch({ type: "page/start" });
      try {
        const page = await api.listGenerations({ cursor: current.cursor });
        dispatch({ type: "page/success", payload: page });
      } catch (error) {
        dispatch({ type: "page/error", payload: error.message });
      }
    }

    function toggleFavorite(mediaId) {
      const isFavorite = stateRef.current.favorites.includes(mediaId);
      dispatch({ type: "favorite/toggle", payload: mediaId });
      toast(isFavorite ? "Removed from favourites" : "Saved to favourites", { type: "info", duration: 1800 });
    }

    function removeGeneration(id) {
      dispatch({ type: "generation/remove", payload: id });
      toast("Generation deleted", {
        type: "info",
        duration: 5000,
        action: { label: "Undo", onClick: () => dispatch({ type: "generation/restore", payload: id }) },
      });
    }

    return {
      generate,
      cancel,
      loadMore,
      toggleFavorite,
      removeGeneration,
      setView: (view) => dispatch({ type: "view/set", payload: view }),
      highlight: (id) => dispatch({ type: "highlight", payload: id }),
      requestComposer: (payload) => dispatch({ type: "composer/request", payload }),
      consumeComposerRequest: () => dispatch({ type: "composer/consumed" }),
    };
  }, [catalog, toast]);

  return (
    <CatalogContext value={catalog}>
      <ActionsContext value={actions}>
        <StateContext value={state}>{children}</StateContext>
      </ActionsContext>
    </CatalogContext>
  );
}

export function useGenerations() {
  const context = use(StateContext);
  if (!context) throw new Error("useGenerations must be used inside <GenerationsProvider>");
  return context;
}

export function useGenerationActions() {
  const context = use(ActionsContext);
  if (!context) throw new Error("useGenerationActions must be used inside <GenerationsProvider>");
  return context;
}

export function useCatalog() {
  return use(CatalogContext);
}

/** Visible generations: removes deleted ones and applies the current image/video view. */
export function selectVisible(state) {
  const removed = new Set(state.removed);
  return state.items.filter(
    (item) => !removed.has(item.id) && (state.view === "all" || item.mode === state.view),
  );
}
