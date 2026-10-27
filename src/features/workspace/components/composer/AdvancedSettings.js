"use client";

import { Lock, LockOpen, Shuffle } from "lucide-react";
import { useId } from "react";
import { Disclosure } from "@/components/ui/Disclosure";
import { IconButton } from "@/components/ui/IconButton";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";

/** Power-user controls, collapsed by default so they never crowd the prompt. */
export function AdvancedSettings({ value, onChange }) {
  const negativeId = useId();
  const seedId = useId();
  const changed = [
    value.negativePrompt && "negative",
    value.guidance !== 7 && `cfg ${value.guidance}`,
    value.seedLocked && `seed ${value.seed}`,
  ].filter(Boolean);

  return (
    <Disclosure title="Advance" summary={changed.join(", ")}>
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium">Enhance prompt</p>
            <p className="text-[11px] text-muted">Adds lighting and lens detail for you</p>
          </div>
          <Switch
            label="Enhance prompt"
            checked={value.enhance}
            onChange={(enhance) => onChange({ enhance })}
          />
        </div>

        <Slider
          label="Prompt guidance"
          value={value.guidance}
          min={1}
          max={15}
          step={0.5}
          onChange={(guidance) => onChange({ guidance })}
          format={(v) => v.toFixed(1)}
          hint="Higher follows your words more literally. Lower gives the model more freedom."
        />

        <div className="space-y-1.5">
          <label htmlFor={negativeId} className="text-xs font-medium">
            Avoid
          </label>
          <textarea
            id={negativeId}
            rows={2}
            value={value.negativePrompt}
            onChange={(event) => onChange({ negativePrompt: event.target.value })}
            placeholder="Things to keep out, e.g. text, watermark, extra fingers"
            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-xs placeholder:text-subtle focus:border-accent-strong focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={seedId} className="text-xs font-medium">
            Seed
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id={seedId}
              inputMode="numeric"
              value={value.seedLocked ? value.seed : ""}
              placeholder="Random every time"
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 7);
                onChange({ seed: Number(digits || 0), seedLocked: digits.length > 0 });
              }}
              className="h-9 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-xs tabular-nums placeholder:text-subtle focus:border-accent-strong focus:outline-none"
            />
            <IconButton
              label="New random seed"
              size="sm"
              variant="chip"
              onClick={() => onChange({ seed: Math.floor(Math.random() * 999999), seedLocked: true })}
            >
              <Shuffle className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              label={value.seedLocked ? "Unlock seed" : "Lock seed"}
              size="sm"
              variant="chip"
              aria-pressed={value.seedLocked}
              onClick={() => onChange({ seedLocked: !value.seedLocked })}
            >
              {value.seedLocked ? (
                <Lock className="size-4 text-accent-strong" aria-hidden />
              ) : (
                <LockOpen className="size-4" aria-hidden />
              )}
            </IconButton>
          </div>
          <p className="text-[11px] text-muted">Lock a seed to keep composition stable while you edit the prompt.</p>
        </div>
      </div>
    </Disclosure>
  );
}
