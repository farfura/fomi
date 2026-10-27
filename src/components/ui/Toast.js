"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { createContext, use, useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const ToastContext = createContext(null);

const ICONS = {
  success: <CircleCheck className="size-4 text-success" aria-hidden />,
  error: <CircleAlert className="size-4 text-danger" aria-hidden />,
  info: <Info className="size-4 text-muted" aria-hidden />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const schedule = useCallback(
    (id, duration) => {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  const toast = useCallback(
    (message, { type = "success", action, duration = 3200 } = {}) => {
      const id = `${Date.now()}${Math.random()}`;
      setToasts((list) => [...list.slice(-2), { id, message, type, action, duration }]);
      schedule(id, duration);
      return id;
    },
    [schedule],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            onPointerEnter={() => clearTimeout(timers.current.get(item.id))}
            onPointerLeave={() => schedule(item.id, 1800)}
            className={cn(
              "pointer-events-auto flex max-w-md animate-rise-in items-center gap-3 rounded-2xl border border-line bg-surface py-2.5 pr-2 pl-4 text-sm shadow-float",
            )}
          >
            {ICONS[item.type]}
            <span className="min-w-0 flex-1 text-ink">{item.message}</span>
            {item.action ? (
              <button
                type="button"
                onClick={() => {
                  item.action.onClick();
                  dismiss(item.id);
                }}
                className="rounded-full px-3 py-1 text-xs font-semibold text-accent-strong hover:bg-chip-active"
              >
                {item.action.label}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(item.id)}
              className="rounded-full p-1.5 text-muted hover:bg-chip-active hover:text-ink"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
