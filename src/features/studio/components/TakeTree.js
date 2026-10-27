"use client";

import { CircleCheck, GitBranch, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { layoutTree } from "../lib/tree-layout";

const ROW = 64;
const INDENT = 18;
const dotX = (depth) => 12 + depth * INDENT;
const dotY = (row) => row * ROW + ROW / 2;

/**
 * Lineage of every take in the shot. Branches show which direction led where,
 * so trying an idea never destroys the version you liked before.
 */
export function TakeTree({ shot, activeTakeId, pending, onSelect, className }) {
  const { rows, maxDepth } = useMemo(() => layoutTree(shot.takes), [shot.takes]);
  const pendingCount = pending?.shotId === shot.id ? pending.count : 0;
  const parentRow = pendingCount ? rows.findIndex((row) => row.take.id === pending.parentId) : -1;
  const pendingDepth = parentRow >= 0 ? rows[parentRow].depth + 1 : 0;
  const totalRows = rows.length + pendingCount;
  const width = dotX(Math.max(maxDepth, pendingDepth)) + 8;

  function onKeyDown(event) {
    const index = rows.findIndex((row) => row.take.id === activeTakeId);
    const delta = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = rows[Math.min(Math.max(index + delta, 0), rows.length - 1)];
    onSelect(next.take.id);
    event.currentTarget.querySelector(`[data-take="${next.take.id}"]`)?.focus();
  }

  return (
    <section aria-labelledby="takes-heading" className={cn("rounded-[24px] border border-line bg-surface p-3", className)}>
      <header className="flex items-center justify-between px-1 pb-2">
        <h2 id="takes-heading" className="flex items-center gap-2 text-sm font-semibold">
          <GitBranch className="size-4 text-accent-strong" aria-hidden />
          Takes
        </h2>
        <span className="text-xs text-muted">{shot.takes.length} in this shot</span>
      </header>

      <div className="relative" style={{ height: totalRows * ROW }}>
        <svg
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 text-line"
          width={width}
          height={totalRows * ROW}
        >
          {rows.map((row, index) =>
            row.parentRow == null ? null : (
              <path
                key={row.take.id}
                d={connector(rows[row.parentRow].depth, row.parentRow, row.depth, index)}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ),
          )}
          {Array.from({ length: pendingCount }, (_, i) => (
            <path
              key={`pending-${i}`}
              d={connector(pendingDepth - 1, parentRow, pendingDepth, rows.length + i)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          ))}
          {rows.map((row, index) => (
            <circle
              key={row.take.id}
              cx={dotX(row.depth)}
              cy={dotY(index)}
              r={row.take.id === activeTakeId ? 4.5 : 3.5}
              fill={row.take.id === activeTakeId ? "var(--accent-strong)" : "var(--surface)"}
              stroke={row.take.id === activeTakeId ? "var(--accent-strong)" : "var(--subtle)"}
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <ul role="listbox" aria-label="Takes" onKeyDown={onKeyDown}>
          {rows.map((row) => {
            const { take } = row;
            const active = take.id === activeTakeId;
            return (
              <li
                key={take.id}
                className="absolute inset-x-0"
                style={{ top: rows.indexOf(row) * ROW, height: ROW, paddingLeft: dotX(row.depth) + 12 }}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-take={take.id}
                  tabIndex={active ? 0 : -1}
                  onClick={() => onSelect(take.id)}
                  className={cn(
                    "flex h-[56px] w-full items-center gap-2.5 rounded-2xl px-1.5 text-left transition-colors duration-200",
                    active ? "bg-chip-active" : "hover:bg-panel",
                  )}
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-media">
                    <Image
                      src={take.media.src}
                      alt=""
                      fill
                      sizes="44px"
                      placeholder="blur"
                      blurDataURL={take.media.blurDataURL}
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      Take {row.number}
                      {take.approved ? <CircleCheck className="size-3.5 text-success" aria-label="Approved" /> : null}
                      {take.notes.length ? (
                        <span className="inline-flex items-center gap-0.5 font-normal text-muted">
                          <MessageSquare className="size-3" aria-hidden />
                          {take.notes.length}
                          <span className="sr-only">notes</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[11px] text-muted">{take.direction}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {Array.from({ length: pendingCount }, (_, i) => (
            <li
              key={`pending-${i}`}
              aria-hidden
              className="absolute inset-x-0 animate-fade-in"
              style={{ top: (rows.length + i) * ROW, height: ROW, paddingLeft: dotX(pendingDepth) + 12 }}
            >
              <div className="flex h-[56px] items-center gap-2.5 px-1.5">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-16 rounded-full" />
                  <Skeleton className="h-2 w-28 rounded-full" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Elbow from a parent's dot down and across to its child's dot. */
function connector(parentDepth, parentRow, depth, row) {
  const px = dotX(parentDepth);
  const py = dotY(parentRow) + 5;
  const cx = dotX(depth) - 5;
  const cy = dotY(row);
  const r = Math.min(8, cy - py);
  return `M ${px} ${py} V ${cy - r} Q ${px} ${cy} ${px + r} ${cy} H ${cx}`;
}
