"use client";

import { Image as ImageIcon, Lightbulb, Sparkles, Video } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useHotkey } from "@/hooks/use-hotkey";
import { cn } from "@/lib/cn";
import {
  useCatalog,
  useGenerationActions,
  useGenerations,
} from "@/features/workspace/store/GenerationsProvider";
import { estimateCredits, estimateDuration, PROMPT_LIMIT, SAMPLE_PROMPTS } from "../../constants";
import { AdvancedSettings } from "./AdvancedSettings";
import { ComposerOptions } from "./ComposerOptions";
import { StylePicker } from "./StylePicker";

const MODES = [
  { value: "image", label: "Image", icon: <ImageIcon className="size-4" aria-hidden /> },
  { value: "video", label: "Video", icon: <Video className="size-4" aria-hidden /> },
];

const DEFAULT_ADVANCED = { negativePrompt: "", guidance: 7, seed: 0, seedLocked: false, enhance: true };

/**
 * The prompt panel. Settings are remembered per mode, so switching Image ↔ Video and back
 * never loses what the user picked.
 */
export function Composer({ className }) {
  const catalog = useCatalog();
  const { pending, view, composerRequest } = useGenerations();
  const { generate, consumeComposerRequest } = useGenerationActions();

  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState(catalog.defaults);
  const [styleId, setStyleId] = useState("none");
  const [advanced, setAdvanced] = useState(DEFAULT_ADVANCED);
  const [touched, setTouched] = useState(false);

  const textareaRef = useRef(null);
  const promptId = useId();
  const hintId = useId();

  // Follow the navigation: picking "Videos" in the header switches the composer too.
  const [syncedView, setSyncedView] = useState(view);
  if (view !== syncedView) {
    setSyncedView(view);
    if (view !== "all") setMode(view);
  }

  // "Reuse prompt" from a card, the library or the viewer fills the composer.
  const [appliedNonce, setAppliedNonce] = useState(null);
  if (composerRequest && composerRequest.nonce !== appliedNonce) {
    const request = composerRequest;
    const nextMode = request.mode ?? mode;
    setAppliedNonce(request.nonce);
    setMode(nextMode);
    setPrompt(request.prompt ?? "");
    setStyleId(request.styleId ?? "none");
    setSettings((current) => ({
      ...current,
      [nextMode]: {
        ...current[nextMode],
        ...(request.modelId ? { modelId: request.modelId } : null),
        ...(request.ratio ? { ratio: request.ratio } : null),
      },
    }));
    if (Number.isInteger(request.seed)) {
      setAdvanced((current) => ({ ...current, seed: request.seed, seedLocked: true }));
    }
  }

  useEffect(() => {
    if (!appliedNonce) return;
    consumeComposerRequest();
    const field = textareaRef.current;
    if (!field) return;
    field.focus({ preventScroll: true });
    field.setSelectionRange(field.value.length, field.value.length);
    field.closest("section")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [appliedNonce, consumeComposerRequest]);

  const current = settings[mode];
  const trimmed = prompt.trim();
  const isBusy = pending.length > 0;
  const tooShort = trimmed.length < 3;
  const tooLong = prompt.length > PROMPT_LIMIT;
  const canSubmit = !tooShort && !tooLong && !isBusy;
  const model = catalog.models.find((item) => item.id === current.modelId);
  const credits = estimateCredits({ mode, count: current.count });
  const seconds = Math.round(estimateDuration({ mode, modelEta: model?.eta, count: current.count }) / 1000);

  function updateSettings(patch) {
    setSettings((all) => ({ ...all, [mode]: { ...all[mode], ...patch } }));
  }

  function surprise() {
    const options = SAMPLE_PROMPTS.filter((sample) => sample !== prompt);
    setPrompt(options[Math.floor(Math.random() * options.length)]);
    textareaRef.current?.focus();
  }

  async function submit(event) {
    event?.preventDefault();
    setTouched(true);
    if (!canSubmit) {
      if (tooShort) textareaRef.current?.focus();
      return;
    }
    await generate({
      mode,
      prompt: trimmed,
      modelId: current.modelId,
      ratio: current.ratio,
      count: current.count,
      styleId,
      negativePrompt: advanced.negativePrompt.trim() || undefined,
      guidance: advanced.guidance,
      enhance: advanced.enhance,
      seed: advanced.seedLocked ? advanced.seed : undefined,
    });
  }

  useHotkey("/", (event) => {
    event.preventDefault();
    textareaRef.current?.focus();
  });
  useHotkey("mod+enter", (event) => {
    event.preventDefault();
    submit();
  });

  const showError = touched && tooShort && !isBusy;

  return (
    <section
      aria-label="Create"
      className={cn(
        "flex flex-col gap-4 rounded-[26px] border border-line bg-panel p-3 sm:p-4",
        className,
      )}
    >
      <SegmentedControl
        label="What to create"
        options={MODES}
        value={mode}
        onChange={setMode}
        className="w-full"
      />

      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <div
          className={cn(
            "rounded-[24px] border bg-surface p-3.5 transition-[border-color,box-shadow] duration-200",
            "focus-within:shadow-[0_0_0_4px_var(--accent-soft)]",
            showError || tooLong ? "border-danger" : "border-line-strong",
          )}
        >
          <label htmlFor={promptId} className="sr-only">
            Prompt
          </label>
          <textarea
            id={promptId}
            ref={textareaRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") event.currentTarget.blur();
            }}
            rows={5}
            maxLength={PROMPT_LIMIT + 200}
            placeholder={
              mode === "video"
                ? "Describe your scene and how the camera moves…"
                : "Describe your imagination to be converted into a piece of art…"
            }
            aria-describedby={hintId}
            aria-invalid={showError || tooLong || undefined}
            className="field-sizing-content block max-h-72 min-h-24 w-full sm:min-h-32 resize-none bg-transparent text-sm leading-6 text-ink placeholder:text-subtle focus:outline-none"
          />

          <div className="mt-2 flex items-center gap-2">
            <IconButton label="Inspire me" size="sm" onClick={surprise} tooltipSide="top">
              <Lightbulb className="size-4" aria-hidden />
            </IconButton>
            <span
              id={hintId}
              aria-live="polite"
              className={cn("min-w-0 flex-1 truncate text-[11px] tabular-nums", tooLong || showError ? "text-danger" : "text-subtle")}
            >
              {showError
                ? "Add a few words first"
                : tooLong
                  ? `${prompt.length - PROMPT_LIMIT} over the limit`
                  : prompt.length > PROMPT_LIMIT * 0.8
                    ? `${PROMPT_LIMIT - prompt.length} left`
                    : null}
            </span>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isBusy}
              disabled={tooLong}
              aria-disabled={!canSubmit || undefined}
              icon={<Sparkles className="size-4" aria-hidden />}
              className={cn("px-6", !canSubmit && !isBusy && "opacity-60 shadow-none")}
            >
              {isBusy ? "Generating" : "Generate"}
            </Button>
          </div>
        </div>

        <ComposerOptions mode={mode} settings={current} catalog={catalog} onChange={updateSettings} />

        <div className="flex flex-col gap-2">
          <AdvancedSettings value={advanced} onChange={(patch) => setAdvanced((v) => ({ ...v, ...patch }))} />
          <StylePicker styles={catalog.styles} value={styleId} onChange={setStyleId} />
        </div>
      </form>

      <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-[11px] text-muted">
        <span>
          {credits} credit{credits > 1 ? "s" : ""} · about {seconds}s
        </span>
        <span className="hidden items-center gap-1 lg:inline-flex">
          <Kbd>⌘/Ctrl</Kbd>
          <Kbd>Enter</Kbd>
          to generate
        </span>
      </p>
    </section>
  );
}
