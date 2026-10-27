"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useGenerationActions, useGenerations } from "../store/GenerationsProvider";

const MAX_THUMBS = 40;

/**
 * Quick jump strip under the header, as in the design: one thumbnail per generation.
 * Clicking a thumbnail scrolls the feed to that generation and flashes it.
 */
export function HistoryRail() {
  const { items, removed, pending, view } = useGenerations();
  const { highlight, setView } = useGenerationActions();
  const { openLibrary } = useOverlays();
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const thumbs = useMemo(() => {
    const hidden = new Set(removed);
    return items.filter((item) => !hidden.has(item.id)).slice(0, MAX_THUMBS);
  }, [items, removed]);

  function measure() {
    const node = scrollerRef.current;
    if (!node) return;
    const start = node.scrollLeft <= 4;
    const end = node.scrollLeft + node.clientWidth >= node.scrollWidth - 4;
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
  }

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function scrollBy(direction) {
    const node = scrollerRef.current;
    node?.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  }

  function jumpTo(item) {
    if (view !== "all" && view !== item.mode) setView("all");
    highlight(item.id);
  }

  return (
    <div className="mx-auto max-w-[1760px] px-4 pb-2 md:px-6 md:pb-3 xl:px-12">
      <div className="relative flex items-center gap-2 rounded-[18px] border border-line bg-panel p-1.5 shadow-soft md:gap-3 md:rounded-[22px] md:p-2">
        <button
          type="button"
          onClick={() => openLibrary("all")}
          className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-surface text-center transition-[transform,box-shadow] duration-200 hover:shadow-soft active:scale-95 md:size-20 md:rounded-2xl"
        >
          <span className="text-xs font-bold md:text-base">History</span>
          <span className="text-[10px] text-muted md:text-[11px]">View All</span>
        </button>
        <span aria-hidden className="hidden h-8 w-1 shrink-0 rounded-full bg-surface md:block" />

        <div className="relative min-w-0 flex-1">
          <ul
            ref={scrollerRef}
            onScroll={measure}
            aria-label="Recent generations"
            className={cn(
              "no-scrollbar flex snap-x gap-2 overflow-x-auto scroll-smooth md:gap-3",
              "[mask-image:linear-gradient(to_right,transparent,black_var(--fade-start),black_calc(100%-var(--fade-end)),transparent)]",
            )}
            style={{ "--fade-start": edges.start ? "0px" : "40px", "--fade-end": edges.end ? "0px" : "56px" }}
          >
            {pending.map((job) => (
              <li key={job.id} className="shrink-0 snap-start">
                <Skeleton className="size-14 rounded-xl md:size-20" />
                <span className="sr-only">Generating: {job.request.prompt}</span>
              </li>
            ))}
            {thumbs.map((item) => {
              const media = item.media[0];
              return (
                <li key={item.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => jumpTo(item)}
                    aria-label={`Jump to: ${item.prompt.slice(0, 80)}`}
                    className="group/thumb relative block size-14 overflow-hidden rounded-xl bg-media transition-transform duration-200 ease-out-soft hover:-translate-y-0.5 active:scale-95 md:size-20"
                    style={{ backgroundColor: media.color }}
                  >
                    <Image
                      src={media.type === "video" ? media.poster : media.src}
                      alt=""
                      fill
                      sizes="80px"
                      placeholder="blur"
                      blurDataURL={media.blurDataURL}
                      className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                    />
                    {item.mode === "video" ? (
                      <span className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 text-[9px] font-medium text-white">
                        Video
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden shrink-0 gap-1 lg:flex">
          <IconButton label="Scroll left" size="sm" variant="solid" disabled={edges.start} onClick={() => scrollBy(-1)}>
            <ChevronLeft className="size-4" aria-hidden />
          </IconButton>
          <IconButton label="Scroll right" size="sm" variant="solid" disabled={edges.end} onClick={() => scrollBy(1)}>
            <ChevronRight className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
