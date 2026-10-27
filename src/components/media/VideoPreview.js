"use client";

import { Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { MediaImage } from "./MediaImage";

/**
 * Poster first (cheap, optimised by next/image); the video element only starts loading
 * when the tile is hovered or focused, so a feed full of clips stays light.
 */
export function VideoPreview({ media, active, sizes, priority, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <MediaImage media={media} sizes={sizes} priority={priority} />
      <video
        ref={videoRef}
        src={active ? media.src : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
        <Play className="size-3 fill-current" aria-hidden />
        {media.duration}s
      </span>
    </div>
  );
}
