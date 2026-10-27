"use client";

import { Ban, Check } from "lucide-react";
import Image from "next/image";
import { Disclosure } from "@/components/ui/Disclosure";
import { cn } from "@/lib/cn";

export function StylePicker({ styles, value, onChange }) {
  const selected = styles.find((style) => style.id === value);

  return (
    <Disclosure title="Styles" summary={value !== "none" ? selected?.label : ""}>
      <div role="radiogroup" aria-label="Style preset" className="grid grid-cols-3 gap-2 pt-1">
        {styles.map((style) => {
          const checked = style.id === value;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(style.id)}
              className="group/style flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-xl bg-panel ring-2 ring-offset-2 ring-offset-chip transition-[box-shadow,transform] duration-200",
                  checked ? "ring-accent-strong" : "ring-transparent group-hover/style:ring-line",
                )}
              >
                {style.cover ? (
                  <Image
                    src={style.cover.src}
                    alt=""
                    fill
                    sizes="80px"
                    placeholder="blur"
                    blurDataURL={style.cover.blurDataURL}
                    className="object-cover transition-transform duration-500 group-hover/style:scale-110"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted">
                    <Ban className="size-5" aria-hidden />
                  </span>
                )}
                {checked ? (
                  <span className="absolute top-1 right-1 flex size-4 animate-pop-in items-center justify-center rounded-full bg-accent-strong text-accent-ink">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
              </span>
              <span className={cn("text-[11px] leading-tight", checked ? "font-semibold text-ink" : "text-muted")}>
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </Disclosure>
  );
}
