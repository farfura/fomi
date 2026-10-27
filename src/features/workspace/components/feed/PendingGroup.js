"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { ratioToCss } from "@/lib/format";
import { columnsFor } from "./GenerationGroup";

/** Eases toward 95% and waits there, so the bar never claims to be done before it is. */
function progressAt(elapsed, eta) {
  return Math.min(95, Math.round(95 * (1 - Math.exp((-2.6 * elapsed) / eta))));
}

/** Placeholder for a generation in flight, laid out exactly like the result it becomes. */
export function PendingGroup({ job, modelName, onCancel }) {
  const { request, startedAt, eta } = job;
  const [progress, setProgress] = useState(() => progressAt(Date.now() - startedAt, eta));

  useEffect(() => {
    const id = setInterval(() => setProgress(progressAt(Date.now() - startedAt, eta)), 200);
    return () => clearInterval(id);
  }, [startedAt, eta]);

  return (
    <section aria-label="Generating" aria-busy="true" className="@container animate-rise-in">
      <div className="grid gap-3 @min-[880px]:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] @min-[880px]:gap-4">
        <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-card p-3.5 @min-[880px]:self-start">
          <p className="line-clamp-4 text-[13px] leading-[1.6] text-ink/80">{request.prompt}</p>
          <div
            role="progressbar"
            aria-label="Generation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 overflow-hidden rounded-full bg-track"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted">
            <span className="tabular-nums">
              {modelName} · {progress}%
            </span>
            <Button size="sm" variant="ghost" icon={<X className="size-3.5" aria-hidden />} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
        <div className={cn("grid gap-3", columnsFor(request.ratio))}>
          {Array.from({ length: request.count }, (_, index) => (
            <Skeleton
              key={index}
              className="rounded-xl"
              style={{ aspectRatio: ratioToCss(request.ratio), animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
