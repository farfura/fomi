"use client";

import { useSyncExternalStore } from "react";
import { formatRelativeTime } from "@/lib/format";

// One shared minute ticker for every timestamp on the page.
const listeners = new Set();
let now = 0;
let timer = null;

function subscribe(listener) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}
const getServerSnapshot = () => 0;

/**
 * "5 minutes ago". Renders nothing on the server (the server's clock and locale differ
 * from the visitor's), then fills in on the client without a hydration mismatch.
 */
export function RelativeTime({ iso, className }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {current ? formatRelativeTime(iso, current) : ""}
    </time>
  );
}
