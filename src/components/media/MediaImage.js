"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * next/image wrapper used for every generated image:
 * blur-up placeholder from the API, a soft fade once decoded, and a graceful error state.
 */
export function MediaImage({
  media,
  sizes,
  priority = false,
  fit = "cover",
  quality = 75,
  className,
  imgClassName,
}) {
  const [status, setStatus] = useState("loading");

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-media", className)}
      style={{ backgroundColor: media.color }}
    >
      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-media text-xs text-muted">
          <ImageOff className="size-5" aria-hidden />
          Couldn&apos;t load
        </div>
      ) : (
        <Image
          src={media.type === "video" ? media.poster : media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          quality={quality}
          placeholder={media.blurDataURL ? "blur" : "empty"}
          blurDataURL={media.blurDataURL}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            fit === "cover" ? "object-cover" : "object-contain",
            "transition-[opacity,filter,transform] duration-500 ease-out-soft",
            status === "loading" ? "opacity-80 blur-[2px]" : "opacity-100 blur-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
