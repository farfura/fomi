"use client";

import { CircleCheck, PackageCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { isShotApproved } from "../store/studio-reducer";

/** Project title, the shot list (the real unit of work) and delivery progress. */
export function ProjectBar({ project, activeShotId, onSelectShot, onDeliver }) {
  const approved = project.shots.filter(isShotApproved).length;
  const total = project.shots.length;

  return (
    <div className="mx-auto flex max-w-[1760px] flex-col gap-3 px-4 pb-3 md:px-6 xl:px-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
            Projects / {project.client}
          </p>
          <h1 className="truncate text-xl font-semibold md:text-2xl">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">
              {approved} of {total} shots approved
            </p>
            <div
              role="progressbar"
              aria-label="Shots approved"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={approved}
              className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-track"
            >
              <div
                className="h-full rounded-full bg-success transition-[width] duration-500 ease-out-soft"
                style={{ width: `${(approved / total) * 100}%` }}
              />
            </div>
          </div>
          <Button variant="primary" onClick={onDeliver} icon={<PackageCheck className="size-4" aria-hidden />}>
            Deliver
          </Button>
        </div>
      </div>

      <div role="tablist" aria-label="Shots" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {project.shots.map((shot) => {
          const active = shot.id === activeShotId;
          const done = isShotApproved(shot);
          const cover = (shot.takes.find((take) => take.approved) ?? shot.takes.at(-1))?.media;
          return (
            <button
              key={shot.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectShot(shot.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-2xl border p-1.5 pr-3.5 text-left transition-[background-color,border-color,box-shadow] duration-200",
                active ? "border-line-strong bg-surface shadow-soft" : "border-line bg-panel hover:bg-surface",
              )}
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-media">
                {cover ? (
                  <Image src={cover.src} alt="" fill sizes="40px" placeholder="blur" blurDataURL={cover.blurDataURL} className="object-cover" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
                  {shot.name}
                  {done ? <CircleCheck className="size-3.5 text-success" aria-label="approved" /> : null}
                </span>
                <span className="block text-[11px] whitespace-nowrap text-muted">
                  {shot.purpose} · {shot.takes.length} takes
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
