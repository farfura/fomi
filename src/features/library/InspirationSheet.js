"use client";

import { CornerUpLeft, Heart, RotateCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { MediaMasonry } from "./components/MediaMasonry";

const SKELETON_HEIGHTS = ["aspect-[2/3]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-square"];

/** Community gallery: browse what others made and start from their prompt. */
export default function InspirationSheet({ onClose }) {
  const { openViewer, reusePrompt } = useOverlays();
  const [state, setState] = useState({ status: "loading", items: [], error: null });
  const [category, setCategory] = useState("All");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getGallery({ signal: controller.signal })
      .then(({ items }) => setState({ status: "ready", items, error: null }))
      .catch((error) => {
        if (error?.name !== "AbortError") setState({ status: "error", items: [], error: error.message });
      });
    return () => controller.abort();
  }, [attempt]);

  const categories = useMemo(
    () => ["All", ...new Set(state.items.map((item) => item.category))],
    [state.items],
  );

  const entries = useMemo(
    () =>
      state.items
        .filter((item) => category === "All" || item.category === category)
        .map((item) => ({
          key: item.id,
          media: item.media,
          prompt: item.prompt,
          modelId: item.modelId,
          ratio: item.ratio,
          author: item.author,
          likes: item.likes,
          mode: item.media.type,
        })),
    [state.items, category],
  );

  function reuse(entry) {
    reusePrompt({ prompt: entry.prompt, mode: entry.mode, modelId: entry.modelId, ratio: entry.ratio });
  }

  function retry() {
    setState({ status: "loading", items: [], error: null });
    setAttempt((value) => value + 1);
  }

  return (
    <Sheet open onClose={onClose} label="Gallery" width="920px">
      <header className="flex flex-col gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Gallery</h2>
            <p className="text-xs text-muted">Made by the community. Start from any prompt.</p>
          </div>
          <IconButton label="Close" shortcut="Esc" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>
        <div role="toolbar" aria-label="Categories" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors duration-200",
                category === name
                  ? "border-transparent bg-ink text-bg"
                  : "border-line bg-chip text-muted hover:text-ink",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6" aria-busy={state.status === "loading"}>
        {state.status === "loading" ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {SKELETON_HEIGHTS.concat(SKELETON_HEIGHTS).map((height, index) => (
              <Skeleton key={index} className={cn("mb-3 rounded-xl", height)} />
            ))}
          </div>
        ) : null}

        {state.status === "error" ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center text-sm">
            <p className="text-muted">{state.error}</p>
            <Button size="sm" icon={<RotateCw className="size-3.5" aria-hidden />} onClick={retry}>
              Try again
            </Button>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <MediaMasonry
            entries={entries}
            onOpen={(index) => openViewer(entries, index)}
            renderOverlay={(entry) => (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 text-white opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 group-focus-within/item:opacity-100 pointer-coarse:opacity-100">
                <span className="min-w-0 text-[11px] leading-tight">
                  <span className="block truncate font-medium">{entry.author}</span>
                  <span className="inline-flex items-center gap-1 text-white/75">
                    <Heart className="size-3" aria-hidden /> {formatNumber(entry.likes)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => reuse(entry)}
                  className="pointer-events-auto inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-medium text-[#1e1b19] transition-transform active:scale-95"
                >
                  <CornerUpLeft className="size-3" aria-hidden />
                  Use prompt
                </button>
              </div>
            )}
          />
        ) : null}
      </div>
    </Sheet>
  );
}
