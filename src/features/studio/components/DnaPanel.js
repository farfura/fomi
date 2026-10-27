"use client";

import { Dna, Lock, LockOpen } from "lucide-react";
import Image from "next/image";
import { useId } from "react";
import { cn } from "@/lib/cn";

const FIELDS = [
  { key: "subject", label: "Subject" },
  { key: "light", label: "Light" },
  { key: "lens", label: "Lens" },
];

/**
 * Project DNA: the traits every take in the project inherits.
 * Locking a trait is how a team keeps twenty frames feeling like one shoot.
 */
export function DnaPanel({ project, modelName, onUpdate, onToggleLock, className }) {
  const { dna } = project;

  return (
    <section aria-labelledby="dna-heading" className={cn("flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-4", className)}>
      <header className="space-y-1">
        <h2 id="dna-heading" className="flex items-center gap-2 text-sm font-semibold">
          <Dna className="size-4 text-accent-strong" aria-hidden />
          Project DNA
        </h2>
        <p className="text-xs leading-5 text-muted">{project.brief}</p>
      </header>

      <div className="space-y-2">
        <h3 className="text-xs font-medium">References</h3>
        <ul className="grid grid-cols-3 gap-2">
          {dna.references.map((media) => (
            <li key={media.id} className="relative aspect-square overflow-hidden rounded-xl bg-media">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="90px"
                placeholder="blur"
                blurDataURL={media.blurDataURL}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Palette</h3>
          <LockToggle field="palette" locked={dna.locks.palette} onToggle={onToggleLock} />
        </div>
        <ul className="flex gap-1.5" aria-label="Palette">
          {dna.palette.map((color) => (
            <li
              key={color}
              title={color}
              className="h-8 flex-1 rounded-lg border border-black/5"
              style={{ backgroundColor: color }}
            >
              <span className="sr-only">{color}</span>
            </li>
          ))}
        </ul>
      </div>

      {FIELDS.map((field) => (
        <DnaField
          key={field.key}
          field={field}
          value={dna[field.key]}
          locked={dna.locks[field.key]}
          onChange={(value) => onUpdate({ [field.key]: value })}
          onToggleLock={onToggleLock}
        />
      ))}

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-panel px-3 py-2">
          <dt className="text-muted">Model</dt>
          <dd className="font-medium">{modelName}</dd>
        </div>
        <div className="rounded-xl bg-panel px-3 py-2">
          <dt className="text-muted">Frame</dt>
          <dd className="font-medium">{dna.ratio}</dd>
        </div>
      </dl>
    </section>
  );
}

function DnaField({ field, value, locked, onChange, onToggleLock }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium">
          {field.label}
        </label>
        <LockToggle field={field.key} locked={locked} onToggle={onToggleLock} />
      </div>
      <textarea
        id={id}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "field-sizing-content block w-full resize-none rounded-xl border px-3 py-2 text-xs leading-5 transition-colors focus:border-accent-strong focus:outline-none",
          locked ? "border-accent/40 bg-accent-soft/40" : "border-line bg-bg",
        )}
      />
    </div>
  );
}

function LockToggle({ field, locked, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={locked}
      onClick={() => onToggle(field)}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors active:scale-95",
        locked ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-panel hover:text-ink",
      )}
    >
      {locked ? <Lock className="size-3" aria-hidden /> : <LockOpen className="size-3" aria-hidden />}
      {locked ? "Locked" : "Free"}
      <span className="sr-only"> {field}</span>
    </button>
  );
}
