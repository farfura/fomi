import "server-only";
import { NextResponse } from "next/server";

/** Resolves after `ms`, or rejects early when the client aborts the request. */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

export function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function jsonError(status, code, message) {
  return NextResponse.json({ error: { code, message } }, { status });
}
