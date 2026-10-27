import { cn } from "@/lib/cn";

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-chip-active text-accent-strong">
          {icon}
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description ? <p className="mx-auto max-w-xs text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
