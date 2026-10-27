"use client";

import { FolderOpen, Heart, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { useGenerationActions, useGenerations } from "@/features/workspace/store/GenerationsProvider";
import { toViewerEntries } from "@/features/workspace/lib/viewer-entries";
import { MediaMasonry } from "./components/MediaMasonry";

const TABS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "favorites", label: "Favourites" },
];

/** Every output the user has made, searchable by prompt. Opened from "History" and "Assets". */
export default function LibrarySheet({ initialTab = "all", onClose }) {
  const { items, removed, favorites, hasMore, loadingMore } = useGenerations();
  const { loadMore } = useGenerationActions();
  const { openViewer } = useOverlays();
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const all = useMemo(() => {
    const hidden = new Set(removed);
    return toViewerEntries(items.filter((item) => !hidden.has(item.id)));
  }, [items, removed]);

  const entries = useMemo(() => {
    const words = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((entry) => {
      if (tab === "favorites" && !favoriteSet.has(entry.media.id)) return false;
      if ((tab === "image" || tab === "video") && entry.media.type !== tab) return false;
      if (!words.length) return true;
      const haystack = `${entry.prompt} ${entry.media.alt}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [all, tab, deferredQuery, favoriteSet]);

  const searching = deferredQuery.trim().length > 0;

  return (
    <Sheet open onClose={onClose} label="Library" width="920px">
      <header className="flex flex-col gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Library</h2>
            <p className="text-xs text-muted">{all.length} creations · {favorites.length} favourites</p>
          </div>
          <IconButton label="Close" shortcut="Esc" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SegmentedControl label="Filter" options={TABS} value={tab} onChange={setTab} size="sm" className="sm:w-[380px]" />
          <label className="relative flex-1">
            <span className="sr-only">Search prompts</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search prompts"
              className="h-9 w-full rounded-full border border-line bg-chip pr-3 pl-9 text-sm placeholder:text-subtle focus:border-accent-strong focus:outline-none"
            />
          </label>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {entries.length ? (
          <MediaMasonry entries={entries} favorites={favoriteSet} onOpen={(index) => openViewer(entries, index)} />
        ) : (
          <EmptyState
            icon={tab === "favorites" ? <Heart className="size-5" aria-hidden /> : <FolderOpen className="size-5" aria-hidden />}
            title={searching ? "No matches" : tab === "favorites" ? "No favourites yet" : "Nothing here yet"}
            description={
              searching
                ? `Nothing in this view mentions "${deferredQuery.trim()}".`
                : tab === "favorites"
                  ? "Tap the heart on any output to keep it here."
                  : "Your generations will show up here."
            }
            action={
              searching ? (
                <Button size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              ) : null
            }
          />
        )}

        {hasMore ? (
          <div className="flex justify-center pt-4">
            <Button size="sm" loading={loadingMore} onClick={loadMore}>
              Load older creations
            </Button>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
