"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CornerUpLeft,
  Download,
  Heart,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { useHotkey } from "@/hooks/use-hotkey";
import { cn } from "@/lib/cn";
import { copyText, downloadMedia } from "@/lib/download";
import { formatNumber } from "@/lib/format";
import {
  useCatalog,
  useGenerationActions,
  useGenerations,
} from "@/features/workspace/store/GenerationsProvider";

const SWIPE_DISTANCE = 50;

/** Full screen viewer for any list of outputs (feed, library or inspiration). */
export default function Lightbox({ entries, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(true);
  const catalog = useCatalog();
  const { favorites } = useGenerations();
  const { toggleFavorite } = useGenerationActions();
  const { reusePrompt } = useOverlays();
  const { toast } = useToast();
  const swipeStart = useRef(null);

  const entry = entries[Math.min(index, entries.length - 1)];
  const total = entries.length;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const go = (delta) => setIndex((current) => Math.min(Math.max(current + delta, 0), total - 1));

  useHotkey("arrowleft", () => go(-1), { allowInInputs: true });
  useHotkey("arrowright", () => go(1), { allowInInputs: true });
  useHotkey("i", () => setShowInfo((value) => !value));

  if (!entry) return null;

  const { media } = entry;
  const isVideo = media.type === "video";
  const model = catalog.models.find((item) => item.id === entry.modelId);
  const style = catalog.styles.find((item) => item.id === entry.styleId);
  const favorite = favorites.includes(media.id);
  const canFavorite = Boolean(entry.generationId);

  async function copy() {
    const ok = await copyText(entry.prompt);
    toast(ok ? "Prompt copied" : "Couldn't copy the prompt", { type: ok ? "success" : "error", duration: 1800 });
  }

  async function download() {
    const ok = await downloadMedia(media, entry.prompt);
    if (ok) toast("Download started", { duration: 1800 });
  }

  const details = [
    ["Model", model?.name],
    ["Ratio", entry.ratio],
    ["Style", style && style.id !== "none" ? style.label : null],
    ["Seed", entry.seed != null ? String(entry.seed) : null],
    ["Avoid", entry.negativePrompt],
  ].filter(([, value]) => value);

  return (
    <Sheet open onClose={onClose} label="Viewer" variant="center">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Stage */}
        <div
          className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center p-3 select-none sm:p-6"
          onPointerDown={(event) => {
            swipeStart.current = event.pointerType === "mouse" ? null : event.clientX;
          }}
          onPointerUp={(event) => {
            if (swipeStart.current == null) return;
            const delta = event.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(delta) > SWIPE_DISTANCE) go(delta < 0 ? 1 : -1);
          }}
        >
          <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between sm:inset-x-5 sm:top-5">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs tabular-nums text-white/80 backdrop-blur-md">
              {index + 1} / {total}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInfo((value) => !value)}
                aria-pressed={showInfo}
                className="text-white/80 hover:bg-white/10 hover:text-white max-lg:hidden"
              >
                {showInfo ? "Hide details" : "Details"}
              </Button>
              <IconButton
                label="Close viewer"
                shortcut="Esc"
                variant="glass"
                onClick={onClose}
                autoFocus
              >
                <X className="size-5" aria-hidden />
              </IconButton>
            </div>
          </div>

          <div key={entry.key} className="relative h-full w-full animate-fade-in">
            {isVideo ? (
              <video
                src={media.src}
                poster={media.poster}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-contain"
                aria-label={media.alt}
              />
            ) : (
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                quality={85}
                placeholder={media.blurDataURL ? "blur" : "empty"}
                blurDataURL={media.blurDataURL}
                loading="eager"
                fetchPriority="high"
                className="object-contain"
                draggable={false}
              />
            )}
          </div>

          <IconButton
            label="Previous"
            shortcut="←"
            variant="glass"
            disabled={!hasPrev}
            onClick={() => go(-1)}
            showTooltip={false}
            className="absolute top-1/2 left-3 -translate-y-1/2 max-sm:hidden sm:left-5"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>
          <IconButton
            label="Next"
            shortcut="→"
            variant="glass"
            disabled={!hasNext}
            onClick={() => go(1)}
            showTooltip={false}
            className="absolute top-1/2 right-3 -translate-y-1/2 max-sm:hidden sm:right-5"
          >
            <ChevronRight className="size-5" aria-hidden />
          </IconButton>
        </div>

        {/* Details */}
        <aside
          aria-label="Details"
          className={cn(
            "flex shrink-0 flex-col gap-5 overflow-y-auto border-white/10 bg-[#181513] p-5 max-lg:max-h-[42dvh] max-lg:border-t lg:w-[360px] lg:border-l",
            !showInfo && "lg:hidden",
          )}
        >
          {entry.author ? (
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{entry.author}</span>
              <span className="text-white/60">{formatNumber(entry.likes ?? 0)} likes</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-white/60 uppercase">Prompt</h2>
              {entry.createdAt ? <RelativeTime iso={entry.createdAt} className="text-xs text-white/50" /> : null}
            </div>
            <p className="text-sm leading-6 text-white/90">{entry.prompt}</p>
          </div>

          {details.length ? (
            <dl className="grid grid-cols-2 gap-2 text-xs">
              {details.map(([label, value]) => (
                <div key={label} className={cn("rounded-xl bg-white/5 px-3 py-2", label === "Avoid" && "col-span-2")}>
                  <dt className="text-white/50">{label}</dt>
                  <dd className="mt-0.5 font-medium break-words text-white/90">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              className="col-span-2"
              icon={<CornerUpLeft className="size-4" aria-hidden />}
              onClick={() =>
                reusePrompt({
                  prompt: entry.prompt,
                  mode: entry.mode ?? media.type,
                  modelId: entry.modelId,
                  ratio: entry.ratio,
                  styleId: entry.styleId,
                })
              }
            >
              Reuse prompt
            </Button>
            <Button
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              icon={<Download className="size-4" aria-hidden />}
              onClick={download}
            >
              Download
            </Button>
            <Button
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              icon={<Copy className="size-4" aria-hidden />}
              onClick={copy}
            >
              Copy
            </Button>
            {canFavorite ? (
              <Button
                className="col-span-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
                aria-pressed={favorite}
                icon={
                  <Heart
                    className={cn("size-4 transition-transform duration-300 ease-spring", favorite && "scale-110 fill-current text-[#ff8f7a]")}
                    aria-hidden
                  />
                }
                onClick={() => toggleFavorite(media.id)}
              >
                {favorite ? "Favourited" : "Add to favourites"}
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </Sheet>
  );
}
