"use client";

import { Download, Heart, Maximize2 } from "lucide-react";
import { memo, useState } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { VideoPreview } from "@/components/media/VideoPreview";
import { IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { downloadMedia } from "@/lib/download";
import { ratioToCss } from "@/lib/format";

/**
 * One output in the feed. The whole tile opens the viewer; the corner actions
 * stay reachable by keyboard and are always visible on touch screens.
 */
export const MediaTile = memo(function MediaTile({
  media,
  ratio,
  label,
  index,
  favorite,
  priority,
  sizes,
  onOpen,
  onToggleFavorite,
}) {
  const [active, setActive] = useState(false);
  const { toast } = useToast();
  const isVideo = media.type === "video";

  async function download() {
    const ok = await downloadMedia(media, label);
    if (ok) toast("Download started", { type: "success", duration: 1800 });
  }

  return (
    <div
      className="group/tile relative overflow-hidden rounded-xl bg-media"
      style={{ aspectRatio: ratioToCss(ratio) }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(false);
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Open ${isVideo ? "video" : "image"} ${index + 1}: ${media.alt}`}
        className="absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline-offset-[-3px]"
      >
        {isVideo ? (
          <VideoPreview media={media} active={active} sizes={sizes} priority={priority} />
        ) : (
          <MediaImage
            media={media}
            sizes={sizes}
            priority={priority}
            imgClassName="group-hover/tile:scale-[1.03]"
          />
        )}
      </button>

      {/* Gradient keeps white icons legible on light images. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 pointer-coarse:opacity-100"
      />

      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1.5 transition-[opacity,transform] duration-200 ease-out-soft",
          "translate-y-[-4px] opacity-0 group-hover/tile:translate-y-0 group-hover/tile:opacity-100",
          "group-focus-within/tile:translate-y-0 group-focus-within/tile:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100",
          favorite && "translate-y-0 opacity-100",
        )}
      >
        <IconButton
          label={favorite ? "Remove from favourites" : "Add to favourites"}
          variant="glass"
          size="sm"
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(media.id)}
          showTooltip={false}
        >
          <Heart
            className={cn("size-4 transition-transform duration-300 ease-spring", favorite && "scale-110 fill-current text-[#ff8f7a]")}
            aria-hidden
          />
        </IconButton>
        <IconButton label="Download" variant="glass" size="sm" onClick={download} showTooltip={false}>
          <Download className="size-4" aria-hidden />
        </IconButton>
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover/tile:opacity-100"
      >
        <Maximize2 className="size-3.5" />
      </span>
    </div>
  );
});
