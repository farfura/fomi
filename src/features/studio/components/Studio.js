"use client";

import { CircleCheck, Columns2, Download, Eye, MessageSquarePlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useHotkey } from "@/hooks/use-hotkey";
import { cn } from "@/lib/cn";
import { downloadMedia } from "@/lib/download";
import { useCatalog } from "@/features/workspace/store/GenerationsProvider";
import { takeNumber } from "../lib/tree-layout";
import {
  selectActiveShot,
  selectActiveTake,
  selectParentTake,
} from "../store/studio-reducer";
import { StudioProvider, useStudio, useStudioActions } from "../store/StudioProvider";
import { DirectionPanel } from "./DirectionPanel";
import { DnaPanel } from "./DnaPanel";
import { ProjectBar } from "./ProjectBar";
import { Stage } from "./Stage";
import { TakeTree } from "./TakeTree";

const DeliverSheet = dynamic(() => import("./DeliverSheet"), { ssr: false });

const PANELS = [
  { value: "stage", label: "Stage" },
  { value: "takes", label: "Takes" },
  { value: "direct", label: "Direct" },
  { value: "dna", label: "DNA" },
];

/** Part B: Direction Studio, a project based workspace for refining images with intent. */
export function Studio({ initialProject }) {
  return (
    <StudioProvider initialProject={initialProject}>
      <StudioScreen />
    </StudioProvider>
  );
}

function StudioScreen() {
  const state = useStudio();
  const actions = useStudioActions();
  const catalog = useCatalog();
  const { toast } = useToast();
  const [panel, setPanel] = useState("stage");
  const [delivering, setDelivering] = useState(false);

  const { project, pending } = state;
  const shot = selectActiveShot(state);
  const take = selectActiveTake(state);
  const parent = selectParentTake(state);
  // A first take has nothing to compare against.
  const tool = state.tool === "compare" && !parent ? "view" : state.tool;
  const busy = Boolean(pending);
  const label = (item) => `Take ${takeNumber(shot.takes, item.id)}`;
  const modelName = catalog.models.find((model) => model.id === project.dna.modelId)?.name ?? "Model";

  const toggleTool = (next) => actions.setTool(tool === next ? "view" : next);

  useHotkey("n", () => toggleTool("notes"));
  useHotkey("c", () => parent && toggleTool("compare"));
  useHotkey("v", () => actions.setTool("view"));
  useHotkey("a", () => take && actions.toggleApproval(shot.id, take.id));
  useHotkey("escape", () => tool !== "view" && actions.setTool("view"));

  async function iterate(request) {
    const ok = await actions.iterate(request);
    if (ok) setPanel("stage");
    return ok;
  }

  async function download() {
    const ok = await downloadMedia(take.media, `${project.name} ${shot.name} ${label(take)}`);
    if (ok) toast("Download started", { duration: 1800 });
  }

  const tools = [
    { value: "view", label: "View", icon: <Eye className="size-3.5" aria-hidden /> },
    { value: "notes", label: "Notes", icon: <MessageSquarePlus className="size-3.5" aria-hidden /> },
    ...(parent ? [{ value: "compare", label: "Compare", icon: <Columns2 className="size-3.5" aria-hidden /> }] : []),
  ];

  // Phones show one panel at a time; from lg every panel is on screen.
  const show = (name) => (panel === name ? "" : "max-lg:hidden");

  return (
    <>
      <AppHeader />
      <main id="main" className="pb-28 md:pb-12">
        <ProjectBar
          project={project}
          activeShotId={shot.id}
          onSelectShot={actions.selectShot}
          onDeliver={() => setDelivering(true)}
        />

        <div className="sticky top-16 z-30 bg-bg/90 px-4 py-2 backdrop-blur-xl md:top-[76px] md:px-6 lg:hidden">
          <SegmentedControl label="Panel" options={PANELS} value={panel} onChange={setPanel} className="w-full" />
        </div>

        <div
          className={cn(
            "mx-auto grid max-w-[1760px] grid-cols-1 gap-4 px-4 pt-2 md:px-6 xl:px-12",
            "lg:grid-cols-[minmax(0,1fr)_340px] lg:[grid-template-areas:'stage_takes''stage_direct''stage_dna']",
            "xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:[grid-template-areas:'dna_stage_takes''dna_stage_direct''dna_stage_.']",
            "lg:grid-rows-[auto_auto_1fr] xl:gap-5",
          )}
        >
          {take ? (
            <div
              className={cn(
                "flex min-w-0 flex-col gap-3 lg:sticky lg:top-[92px] lg:h-[calc(100dvh-108px)] lg:self-start lg:[grid-area:stage]",
                show("stage"),
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {shot.name} · {label(take)}
                    {take.approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
                        <CircleCheck className="size-3" aria-hidden /> Approved
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {parent ? `From ${label(parent)}: ` : ""}
                    {take.direction}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SegmentedControl label="Tool" options={tools} value={tool} onChange={actions.setTool} size="sm" />
                  <Button
                    size="sm"
                    variant={take.approved ? "soft" : "secondary"}
                    aria-pressed={take.approved}
                    onClick={() => actions.toggleApproval(shot.id, take.id)}
                    icon={<CircleCheck className={cn("size-3.5", take.approved && "text-success")} aria-hidden />}
                  >
                    {take.approved ? "Approved" : "Approve"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={download} icon={<Download className="size-3.5" aria-hidden />}>
                    <span className="max-sm:sr-only">Download</span>
                  </Button>
                </div>
              </div>

              <Stage
                take={take}
                parent={parent}
                takeLabel={label(take)}
                parentLabel={parent ? label(parent) : ""}
                tool={tool}
                onAddNote={(note) => actions.addNote(shot.id, take.id, note)}
                onRemoveNote={(noteId) => actions.removeNote(shot.id, take.id, noteId)}
                className="h-[62dvh] rounded-[28px] bg-panel p-3 sm:p-5 lg:h-auto lg:flex-1"
              />

              <p className="hidden items-center justify-center gap-3 text-[11px] text-muted lg:flex">
                <span><b className="font-semibold text-ink">N</b> pin a note</span>
                <span><b className="font-semibold text-ink">C</b> compare with parent</span>
                <span><b className="font-semibold text-ink">A</b> approve</span>
                <span><b className="font-semibold text-ink">⌘/Ctrl Enter</b> create takes</span>
              </p>
            </div>
          ) : null}

          <TakeTree
            shot={shot}
            activeTakeId={take?.id}
            pending={pending}
            onSelect={(takeId) => {
              actions.selectTake(shot.id, takeId);
              setPanel("stage");
            }}
            className={cn("lg:[grid-area:takes]", show("takes"))}
          />

          {take ? (
            <DirectionPanel
              take={take}
              takeLabel={label(take)}
              locks={project.dna.locks}
              busy={busy}
              onIterate={iterate}
              onCancel={actions.cancelIterate}
              className={cn("lg:[grid-area:direct]", show("direct"))}
            />
          ) : null}

          <DnaPanel
            project={project}
            modelName={modelName}
            onUpdate={actions.updateDna}
            onToggleLock={actions.toggleLock}
            className={cn("lg:self-start lg:[grid-area:dna] xl:sticky xl:top-[92px] xl:max-h-[calc(100dvh-108px)] xl:overflow-y-auto xl:overscroll-contain", show("dna"))}
          />
        </div>
      </main>

      {delivering ? (
        <DeliverSheet
          project={project}
          onClose={() => setDelivering(false)}
          onOpenShot={(shotId) => {
            actions.selectShot(shotId);
            setDelivering(false);
          }}
          onReset={() => {
            actions.reset();
            setDelivering(false);
            toast("Project reset to the original demo", { type: "info" });
          }}
        />
      ) : null}
    </>
  );
}
