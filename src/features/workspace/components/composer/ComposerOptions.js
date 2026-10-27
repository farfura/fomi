"use client";

import { Hash } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { RatioIcon } from "../RatioIcon";

/** The three quick settings under the prompt: output count, aspect ratio and model. */
export function ComposerOptions({ mode, settings, catalog, onChange }) {
  const noun = mode === "video" ? "video" : "image";
  const countOptions = catalog.counts[mode].map((value) => ({
    value,
    label: `${value} ${noun}${value > 1 ? "s" : ""}`,
  }));
  const ratioOptions = catalog.ratios[mode].map((value) => ({
    value,
    label: value,
    icon: <RatioIcon ratio={value} className="size-4 text-muted" />,
  }));
  const modelOptions = catalog.models
    .filter((model) => model.mode === mode)
    .map((model) => ({ value: model.id, label: model.name, description: model.description }));
  const model = modelOptions.find((option) => option.value === settings.modelId);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Select
        label="Number of outputs"
        className="shrink-0"
        value={settings.count}
        options={countOptions}
        onChange={(count) => onChange({ count })}
        prefix={<Hash className="size-3 text-muted" aria-hidden />}
        renderValue={(option) => (
          <>
            {option.value} <span className="capitalize text-muted">{noun}s</span>
          </>
        )}
      />
      <Select
        label="Aspect ratio"
        className="shrink-0"
        value={settings.ratio}
        options={ratioOptions}
        onChange={(ratio) => onChange({ ratio })}
      />
      <Select
        label="Model"
        className="min-w-0"
        value={settings.modelId}
        options={modelOptions}
        onChange={(modelId) => onChange({ modelId })}
        menuClassName="w-72"
        renderValue={() => (
          <>
            <span className="text-muted">Model:</span> <span className="font-semibold">{model?.label ?? "Name"}</span>
          </>
        )}
      />
    </div>
  );
}
