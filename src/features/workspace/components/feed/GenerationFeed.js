"use client";

import { ImagePlus, RotateCw, Video } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInView } from "@/hooks/use-in-view";
import {
  selectVisible,
  useCatalog,
  useGenerationActions,
  useGenerations,
} from "@/features/workspace/store/GenerationsProvider";
import { toViewerEntries } from "../../lib/viewer-entries";
import { GenerationGroup } from "./GenerationGroup";
import { PendingGroup } from "./PendingGroup";

/** The stream of generations, newest first, with infinite loading of older pages. */
export function GenerationFeed() {
  const state = useGenerations();
  const catalog = useCatalog();
  const { loadMore, cancel, toggleFavorite, removeGeneration, setView, highlight } = useGenerationActions();
  const { openViewer, reusePrompt } = useOverlays();
  const [sentinelRef, nearEnd] = useInView({ rootMargin: "600px" });

  const visible = useMemo(() => selectVisible(state), [state]);
  const favorites = useMemo(() => new Set(state.favorites), [state.favorites]);
  const models = useMemo(() => new Map(catalog.models.map((m) => [m.id, m.name])), [catalog.models]);
  const styles = useMemo(() => new Map(catalog.styles.map((s) => [s.id, s.label])), [catalog.styles]);
  const pending = state.pending.filter((job) => state.view === "all" || job.request.mode === state.view);

  const { hasMore, loadingMore, loadError } = state;
  useEffect(() => {
    if (nearEnd && hasMore && !loadingMore && !loadError) loadMore();
  }, [nearEnd, hasMore, loadingMore, loadError, loadMore]);

  function open(generationId, index) {
    const entries = toViewerEntries(visible);
    const start = entries.findIndex((entry) => entry.key === `${generationId}:${index}`);
    openViewer(entries, Math.max(start, 0));
  }

  function reuse(generation) {
    reusePrompt({
      prompt: generation.prompt,
      mode: generation.mode,
      modelId: generation.modelId,
      ratio: generation.ratio,
      styleId: generation.styleId,
    });
  }

  const filtered = state.view !== "all";
  const noun = state.view === "video" ? "videos" : "images";
  const isEmpty = visible.length === 0 && pending.length === 0 && !hasMore;

  return (
    <div className="flex min-w-0 flex-col gap-6 md:gap-8">
      {filtered ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-chip px-4 py-2.5 text-sm shadow-soft">
          <span className="text-muted">
            Showing <span className="font-medium text-ink">{noun}</span> only
          </span>
          <Button size="sm" variant="soft" onClick={() => setView("all")}>
            Show all
          </Button>
        </div>
      ) : null}

      {pending.map((job) => (
        <PendingGroup
          key={job.id}
          job={job}
          modelName={models.get(job.request.modelId)}
          onCancel={() => cancel(job.id)}
        />
      ))}

      {visible.map((generation, index) => (
        <GenerationGroup
          key={generation.id}
          generation={generation}
          modelName={models.get(generation.modelId) ?? "Model"}
          styleLabel={generation.styleId !== "none" ? styles.get(generation.styleId) : null}
          favorites={favorites}
          highlighted={state.highlightId === generation.id}
          priority={index === 0}
          onOpen={open}
          onToggleFavorite={toggleFavorite}
          onReuse={reuse}
          onDelete={removeGeneration}
          onHighlightEnd={() => highlight(null)}
        />
      ))}

      {isEmpty ? (
        <EmptyState
          icon={state.view === "video" ? <Video className="size-5" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
          title={filtered ? `No ${noun} yet` : "Nothing here yet"}
          description={
            filtered
              ? `Switch the composer to ${state.view} and describe a scene to make your first one.`
              : "Describe something in the panel and press Generate. Your creations will collect here."
          }
          action={
            filtered ? (
              <Button size="sm" variant="secondary" onClick={() => setView("all")}>
                Show everything
              </Button>
            ) : null
          }
        />
      ) : null}

      {loadingMore ? <FeedSkeleton /> : null}

      {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-line p-6 text-center text-sm">
          <p className="text-muted">Couldn&apos;t load older creations. {loadError}</p>
          <Button size="sm" icon={<RotateCw className="size-3.5" aria-hidden />} onClick={loadMore}>
            Try again
          </Button>
        </div>
      ) : null}

      {/* Stays mounted so the observer keeps watching it between pages. */}
      <div ref={sentinelRef} className="flex min-h-px justify-center">
        {hasMore && !loadingMore && !loadError ? (
          // Fallback for keyboard users and browsers without IntersectionObserver.
          <Button size="sm" variant="ghost" onClick={loadMore}>
            Load older
          </Button>
        ) : null}
      </div>

      {!hasMore && visible.length > 0 ? (
        <p className="py-4 text-center text-xs text-subtle">You&apos;ve reached the beginning of your history.</p>
      ) : null}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div aria-hidden className="@container">
      <div className="grid gap-3 @min-[880px]:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] @min-[880px]:gap-4">
        <Skeleton className="h-40 rounded-[22px]" />
        <div className="grid grid-cols-2 gap-3 @min-[560px]:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
