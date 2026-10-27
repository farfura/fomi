"use client";

import { Lock, Sparkles, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useHotkey } from "@/hooks/use-hotkey";
import { cn } from "@/lib/cn";

const QUICK_DIRECTIONS = [
  "Warmer light",
  "Tighter crop",
  "Simpler background",
  "More contrast",
  "Softer expression",
];

const STRENGTHS = [
  { value: "subtle", label: "Subtle" },
  { value: "balanced", label: "Balanced" },
  { value: "bold", label: "Bold" },
];

const STRENGTH_HINTS = {
  subtle: "Small fixes. Composition and pose stay put.",
  balanced: "Follows the direction while keeping the frame recognisable.",
  bold: "Free to rethink the frame. Good for exploring.",
};

const COUNTS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

const LOCK_LABELS = { palette: "palette", subject: "subject", light: "light", lens: "lens" };

/**
 * "Direct the next take": the one place where feedback turns into new work.
 * Pinned notes are included automatically, so nothing written on the image gets lost.
 */
export function DirectionPanel({ take, takeLabel, locks, busy, onIterate, onCancel, className }) {
  const [direction, setDirection] = useState("");
  const [strength, setStrength] = useState("balanced");
  const [count, setCount] = useState(2);
  const [excluded, setExcluded] = useState([]);
  const directionId = useId();

  // A new take starts with a clean brief: reset when the selected take changes.
  const [forTake, setForTake] = useState(take.id);
  if (forTake !== take.id) {
    setForTake(take.id);
    setDirection("");
    setExcluded([]);
  }

  const notes = take.notes.filter((note) => !excluded.includes(note.id));
  const canSubmit = !busy && (direction.trim().length > 0 || notes.length > 0);
  const locked = Object.entries(locks)
    .filter(([, value]) => value)
    .map(([key]) => LOCK_LABELS[key]);

  function addQuick(text) {
    setDirection((current) => {
      if (current.toLowerCase().includes(text.toLowerCase())) return current;
      return current.trim() ? `${current.trim().replace(/[.,]$/, "")}, ${text.toLowerCase()}` : text;
    });
  }

  async function submit(event) {
    event?.preventDefault();
    if (!canSubmit) return;
    const ok = await onIterate({
      parentId: take.id,
      direction: direction.trim(),
      notes: notes.map(({ text, x, y }) => ({ text, x, y })),
      strength,
      count,
    });
    if (ok) setDirection("");
  }

  useHotkey("mod+enter", (event) => {
    event.preventDefault();
    submit();
  });

  return (
    <section aria-labelledby="direct-heading" className={cn("rounded-[24px] border border-line bg-panel p-4", className)}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <header>
          <h2 id="direct-heading" className="text-sm font-semibold">
            Direct the next take
          </h2>
          <p className="text-xs text-muted">Branches from {takeLabel}. The original stays untouched.</p>
        </header>

        <div className="rounded-[20px] border border-line-strong bg-surface p-3 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
          <label htmlFor={directionId} className="sr-only">
            Direction
          </label>
          <textarea
            id={directionId}
            rows={3}
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
            placeholder="What should change? Talk to it like a photographer."
            className="field-sizing-content block max-h-48 min-h-20 w-full resize-none bg-transparent text-sm leading-6 placeholder:text-subtle focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Quick directions" role="group">
            {QUICK_DIRECTIONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => addQuick(text)}
                className="h-7 rounded-full border border-line px-2.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-ink active:scale-95"
              >
                + {text}
              </button>
            ))}
          </div>
        </div>

        {take.notes.length ? (
          <fieldset className="space-y-1.5">
            <legend className="mb-1.5 text-xs font-medium">Pinned notes to address</legend>
            {take.notes.map((note, index) => {
              const included = !excluded.includes(note.id);
              return (
                <label
                  key={note.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface px-3 py-2 text-xs transition-opacity",
                    !included && "opacity-55",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() =>
                      setExcluded((list) => (included ? [...list, note.id] : list.filter((id) => id !== note.id)))
                    }
                    className="mt-0.5 size-3.5 accent-[var(--accent-strong)]"
                  />
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent-strong text-[10px] font-bold text-accent-ink">
                    {index + 1}
                  </span>
                  <span className="leading-5">{note.text}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-3 py-2 text-[11px] text-muted">
            Tip: press <Kbd>N</Kbd> and click the image to pin a note on the exact spot.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1 2xl:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <p className="text-xs font-medium" id="strength-label">
              How far to go
            </p>
            <SegmentedControl label="Variation strength" options={STRENGTHS} value={strength} onChange={setStrength} size="sm" />
            <p className="text-[11px] text-muted">{STRENGTH_HINTS[strength]}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Takes</p>
            <SegmentedControl label="Number of takes" options={COUNTS} value={count} onChange={setCount} size="sm" className="w-28" />
          </div>
        </div>

        {locked.length ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <Lock className="size-3" aria-hidden />
            Keeps the locked {locked.join(", ")} from Project DNA
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            loading={busy}
            disabled={!busy && !canSubmit}
            icon={<Sparkles className="size-4" aria-hidden />}
          >
            {busy ? "Creating takes" : `Create ${count} take${count > 1 ? "s" : ""}`}
          </Button>
          {busy ? (
            <Button size="lg" variant="secondary" onClick={onCancel} icon={<X className="size-4" aria-hidden />}>
              Stop
            </Button>
          ) : null}
        </div>
        {!busy && !canSubmit ? (
          <p className="-mt-2 text-center text-[11px] text-muted">Write a direction or pin a note to continue.</p>
        ) : null}
      </form>
    </section>
  );
}
