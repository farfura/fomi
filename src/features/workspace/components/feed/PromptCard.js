"use client";

import { Copy, CornerUpLeft, Trash2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { copyText } from "@/lib/download";

/** The prompt that produced a generation, with the actions people reach for most. */
export function PromptCard({ generation, modelName, styleLabel, onReuse, onDelete, className }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef(null);

  // Only offer "Show more" when the text is actually cut off.
  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) return undefined;
    const measure = () => setClamped(node.scrollHeight - node.clientHeight > 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  async function copy() {
    const ok = await copyText(generation.prompt);
    toast(ok ? "Prompt copied" : "Couldn't copy, select the text instead", {
      type: ok ? "success" : "error",
      duration: 1800,
    });
  }

  return (
    <article
      className={cn(
        "group/card relative flex flex-col gap-3 rounded-[22px] border border-line bg-card p-3.5 text-ink",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <span className="font-medium capitalize text-ink/80">{generation.mode}</span>
        <span aria-hidden>·</span>
        <RelativeTime iso={generation.createdAt} />
        <div className="ml-auto flex gap-0.5 transition-opacity duration-200 lg:opacity-0 lg:group-hover/card:opacity-100 lg:group-focus-within/card:opacity-100">
          <IconButton label="Copy prompt" size="sm" onClick={copy} className="size-7">
            <Copy className="size-3.5" aria-hidden />
          </IconButton>
          <IconButton label="Reuse prompt" size="sm" onClick={onReuse} className="size-7">
            <CornerUpLeft className="size-3.5" aria-hidden />
          </IconButton>
          <IconButton label="Delete" size="sm" onClick={onDelete} className="size-7 hover:text-danger">
            <Trash2 className="size-3.5" aria-hidden />
          </IconButton>
        </div>
      </div>

      <div>
        <p
          ref={textRef}
          className={cn("text-[13px] leading-[1.6] break-words", !expanded && "line-clamp-6 @min-[880px]:line-clamp-[10]")}
        >
          {generation.prompt}
        </p>
        {clamped || expanded ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 text-xs font-medium text-accent-strong hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-end gap-1.5">
        {styleLabel ? (
          <span className="rounded-lg bg-chip/70 px-2.5 py-1 text-[11px] text-muted">{styleLabel}</span>
        ) : null}
        <span className="rounded-lg bg-chip px-3 py-1.5 text-xs font-medium shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)]">
          {modelName}
        </span>
      </div>
    </article>
  );
}
