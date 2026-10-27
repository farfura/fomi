"use client";

import { Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { createClientId } from "../lib/ids";

/**
 * The working canvas. Three tools share one image box so coordinates always line up:
 * view, pin notes (click anywhere to leave feedback) and compare against the parent take.
 */
export function Stage({ take, parent, takeLabel, parentLabel, tool, onAddNote, onRemoveNote, className }) {
  const { media } = take;
  const ratio = media.width / media.height;

  return (
    <div
      className={cn("relative flex min-h-0 items-center justify-center", className)}
      style={{ containerType: "size" }}
    >
      <figure
        className="relative overflow-visible"
        style={{ aspectRatio: `${media.width} / ${media.height}`, width: `min(100cqw, calc(100cqh * ${ratio}))` }}
      >
        <div key={take.id} className="absolute inset-0 animate-fade-in overflow-hidden rounded-2xl bg-media shadow-float">
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 60vw, 100vw"
            quality={85}
            placeholder="blur"
            blurDataURL={media.blurDataURL}
            loading="eager"
            fetchPriority="high"
            className="object-cover"
            draggable={false}
          />
          {tool === "compare" && parent ? (
            <CompareOverlay parent={parent} takeLabel={takeLabel} parentLabel={parentLabel} />
          ) : null}
        </div>

        {tool !== "compare" ? (
          <NoteLayer
            key={take.id}
            notes={take.notes}
            editing={tool === "notes"}
            onAdd={onAddNote}
            onRemove={onRemoveNote}
          />
        ) : null}
        <figcaption className="sr-only">{media.alt}</figcaption>
      </figure>
    </div>
  );
}

/** Before/after slider. A native range input drives it, so it works with keyboard and touch. */
function CompareOverlay({ parent, takeLabel, parentLabel }) {
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div className="absolute inset-0 animate-fade-in">
      {/* Parent on the left of the handle, current take on the right. */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image
          src={parent.media.src}
          alt={`${parentLabel}: ${parent.media.alt}`}
          fill
          sizes="(min-width: 1280px) 50vw, 100vw"
          quality={85}
          placeholder="blur"
          blurDataURL={parent.media.blurDataURL}
          className="object-cover"
          draggable={false}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#1e1b19] shadow-float">
          ⟷
        </span>
      </div>
      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
        {parentLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
        {takeLabel}
      </span>
      <label htmlFor={id} className="sr-only">
        Compare {parentLabel} and {takeLabel}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/** Numbered pins over the image. In notes mode a click drops a new pin with a comment box. */
function NoteLayer({ notes, editing, onAdd, onRemove }) {
  const [draft, setDraft] = useState(null);
  const [openId, setOpenId] = useState(null);
  const layerRef = useRef(null);

  // Leaving notes mode discards an unsaved pin (adjusted during render, no effect).
  const [wasEditing, setWasEditing] = useState(editing);
  if (wasEditing !== editing) {
    setWasEditing(editing);
    if (!editing) setDraft(null);
  }

  function placePin(event) {
    if (event.target !== event.currentTarget) return;
    setOpenId(null);
    if (!editing) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setDraft({ x: round(x), y: round(y), text: "" });
  }

  function save(pin) {
    const text = pin.text.trim();
    if (text) onAdd({ id: createClientId("note"), x: pin.x, y: pin.y, text });
    setDraft(null);
  }

  return (
    <div
      ref={layerRef}
      onClick={placePin}
      className={cn("absolute inset-0 rounded-2xl", editing && "cursor-crosshair ring-2 ring-accent ring-offset-2 ring-offset-bg")}
    >
      {notes.map((note, index) => (
        <Pin
          key={note.id}
          note={note}
          number={index + 1}
          open={openId === note.id}
          onToggle={() => setOpenId((current) => (current === note.id ? null : note.id))}
          onRemove={() => {
            setOpenId(null);
            onRemove(note.id);
          }}
        />
      ))}
      {draft ? (
        <DraftPin
          draft={draft}
          number={notes.length + 1}
          onChange={(text) => setDraft((current) => ({ ...current, text }))}
          onSave={() => save(draft)}
          onCancel={() => setDraft(null)}
        />
      ) : null}
    </div>
  );
}

const round = (value) => Math.round(Math.min(Math.max(value, 0.02), 0.98) * 1000) / 1000;

/** Keeps the bubble on the image: opens left of pins near the right edge, above pins near the bottom. */
function bubblePlacement({ x, y }) {
  return cn(
    "absolute z-20 w-60 animate-pop-in rounded-2xl border border-line bg-surface p-3 text-ink shadow-float",
    x > 0.55 ? "right-1/2 mr-4" : "left-1/2 ml-4",
    y > 0.6 ? "bottom-0" : "top-0",
  );
}

function Pin({ note, number, open, onToggle, onRemove }) {
  return (
    <div className="absolute" style={{ left: `${note.x * 100}%`, top: `${note.y * 100}%` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Note ${number}: ${note.text}`}
        className={cn(
          "flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-float transition-transform duration-200 ease-spring hover:scale-110 active:scale-95",
          open ? "bg-ink text-bg" : "bg-accent-strong text-accent-ink",
        )}
      >
        {number}
      </button>
      {open ? (
        <div role="dialog" aria-label={`Note ${number}`} className={bubblePlacement(note)}>
          <p className="text-[13px] leading-5">{note.text}</p>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" aria-hidden />} onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DraftPin({ draft, number, onChange, onSave, onCancel }) {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="absolute" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}>
      <span className="flex size-7 -translate-x-1/2 -translate-y-1/2 animate-pop-in items-center justify-center rounded-full border-2 border-white bg-accent-strong text-xs font-bold text-accent-ink shadow-float">
        {number}
      </span>
      <form
        className={bubblePlacement(draft)}
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <label htmlFor="note-draft" className="text-xs font-semibold">
          What should change here?
        </label>
        <textarea
          id="note-draft"
          ref={inputRef}
          rows={3}
          value={draft.text}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSave();
            }
            if (event.key === "Escape") {
              event.stopPropagation();
              onCancel();
            }
          }}
          placeholder="e.g. Keep the rose deep red"
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-bg px-2.5 py-2 text-[13px] placeholder:text-subtle focus:border-accent-strong focus:outline-none"
        />
        <div className="mt-2 flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" icon={<X className="size-3.5" aria-hidden />} onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" disabled={!draft.text.trim()}>
            Pin note
          </Button>
        </div>
      </form>
    </div>
  );
}
