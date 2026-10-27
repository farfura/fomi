"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import { cn } from "@/lib/cn";

const GAP = 8;
const EDGE = 8;

/**
 * Places the menu with fixed positioning so it is never clipped by a scrolling parent
 * (the composer column scrolls on short screens). Flips above the trigger when there is
 * not enough room below, and stays inside the viewport horizontally.
 */
function placeMenu(trigger, menu, align, side) {
  const t = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const below = window.innerHeight - t.bottom - GAP - EDGE;
  const above = t.top - GAP - EDGE;
  const openUp = side === "top" ? above >= height || above > below : below < height && above > below;
  const preferredLeft = align === "end" ? t.right - width : t.left;
  const left = Math.min(Math.max(EDGE, preferredLeft), window.innerWidth - width - EDGE);
  const top = openUp ? Math.max(EDGE, t.top - GAP - height) : t.bottom + GAP;
  return { left, top, maxHeight: Math.max(160, openUp ? above : below), origin: openUp ? "bottom" : "top" };
}

/**
 * Accessible single-select dropdown (WAI-ARIA listbox pattern).
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Home/End jump, Enter selects, Escape closes.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  renderValue,
  prefix,
  align = "start",
  side = "bottom",
  className,
  menuClassName,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const listId = useId();
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

  useDismiss([triggerRef, listRef], () => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => setPosition(placeMenu(triggerRef.current, listRef.current, align, side));
    update();
    // Close on outside scroll (the trigger moved away), reposition on resize.
    const onScroll = (event) => {
      if (!listRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
      setPosition(null);
    };
  }, [open, align, side]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openMenu() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function choose(index) {
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onListKeyDown(event) {
    const last = options.length - 1;
    const keys = {
      ArrowDown: () => setActiveIndex((i) => Math.min(i + 1, last)),
      ArrowUp: () => setActiveIndex((i) => Math.max(i - 1, 0)),
      Home: () => setActiveIndex(0),
      End: () => setActiveIndex(last),
      Enter: () => choose(activeIndex),
      " ": () => choose(activeIndex),
      Escape: () => {
        setOpen(false);
        triggerRef.current?.focus();
      },
      Tab: () => setOpen(false),
    };
    const action = keys[event.key];
    if (!action) return;
    if (event.key !== "Tab") event.preventDefault();
    event.stopPropagation();
    action();
  }

  function onTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
    }
  }

  return (
    <div className={cn("relative inline-flex min-w-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "inline-flex h-8 max-w-full min-w-0 items-center gap-1 rounded-[10px] border border-transparent bg-chip px-2 text-xs text-ink shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)]",
          "transition-[border-color,background-color] duration-200 hover:border-line",
          open && "border-line",
        )}
      >
        {prefix}
        <span className="min-w-0 truncate">{renderValue ? renderValue(selected) : selected?.label}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
          style={
            position
              ? {
                  left: position.left,
                  top: position.top,
                  maxHeight: Math.min(position.maxHeight, 288),
                  transformOrigin: position.origin,
                }
              : { left: 0, top: 0, visibility: "hidden" }
          }
          className={cn(
            "fixed z-[60] max-w-[calc(100vw-16px)] min-w-44 animate-pop-in overflow-auto rounded-2xl border border-line bg-surface p-1.5 shadow-float outline-none",
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  index === activeIndex && "bg-chip-active",
                )}
              >
                {option.icon}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="block truncate text-xs text-muted">{option.description}</span>
                  ) : null}
                </span>
                <Check
                  aria-hidden
                  className={cn("size-4 text-accent-strong", !isSelected && "invisible")}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
