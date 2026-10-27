"use client";

import { CircleDashed, Download, Link2, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { copyText, downloadMedia } from "@/lib/download";
import { takeNumber } from "../lib/tree-layout";

/** Hand-off: one approved take per shot, downloadable together, with what is still missing. */
export default function DeliverSheet({ project, onClose, onOpenShot, onReset }) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const picks = project.shots.map((shot) => ({ shot, take: shot.takes.find((take) => take.approved) ?? null }));
  const ready = picks.filter((pick) => pick.take);

  async function downloadAll() {
    setDownloading(true);
    for (const { shot, take } of ready) {
      await downloadMedia(take.media, `${project.name} ${shot.name}`);
    }
    setDownloading(false);
    toast(`${ready.length} files downloaded`);
  }

  async function share() {
    const ok = await copyText(`https://fomi.art/review/${project.id}`);
    toast(ok ? "Review link copied" : "Couldn't copy the link", { type: ok ? "success" : "error" });
  }

  return (
    <Sheet open onClose={onClose} label="Deliver" width="560px">
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 pt-5 pb-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold">Deliver {project.name}</h2>
          <p className="text-xs text-muted">
            {ready.length} of {project.shots.length} shots have an approved take.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" aria-hidden />} onClick={onReset}>
            Reset demo
          </Button>
          <IconButton label="Close" shortcut="Esc" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>
      </header>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4 sm:px-6">
        {picks.map(({ shot, take }) => (
          <li key={shot.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 pr-3">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-media">
              {take ? (
                <Image src={take.media.src} alt="" fill sizes="56px" placeholder="blur" blurDataURL={take.media.blurDataURL} className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-subtle">
                  <CircleDashed className="size-5" aria-hidden />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{shot.name}</span>
              <span className="block truncate text-xs text-muted">
                {take ? `Take ${takeNumber(shot.takes, take.id)} · ${take.direction}` : `${shot.purpose} · needs a pick`}
              </span>
            </span>
            {take ? (
              <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">Ready</span>
            ) : (
              <Button size="sm" variant="soft" onClick={() => onOpenShot(shot.id)}>
                Review
              </Button>
            )}
          </li>
        ))}
      </ul>

      <footer className="flex flex-col gap-2 border-t border-line px-5 py-4 sm:flex-row sm:px-6">
        <Button
          variant="primary"
          className="flex-1"
          loading={downloading}
          disabled={!ready.length}
          icon={<Download className="size-4" aria-hidden />}
          onClick={downloadAll}
        >
          Download {ready.length} approved
        </Button>
        <Button icon={<Link2 className="size-4" aria-hidden />} onClick={share}>
          Copy review link
        </Button>
      </footer>
    </Sheet>
  );
}
