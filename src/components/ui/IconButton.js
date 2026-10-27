import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

const VARIANTS = {
  ghost: "text-muted hover:text-ink hover:bg-chip-active/70",
  chip: "bg-chip text-ink border border-line hover:border-subtle/60",
  glass: "bg-black/45 text-white backdrop-blur-md hover:bg-black/65",
  solid: "bg-surface text-ink shadow-soft hover:bg-chip-active",
};

const SIZES = { sm: "size-8", md: "size-10", lg: "size-11" };

/** Icon-only button. `label` is required: it becomes the accessible name and the tooltip. */
export function IconButton({
  label,
  shortcut,
  tooltipSide = "bottom",
  showTooltip = true,
  variant = "ghost",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform,border-color] duration-200 active:scale-90 disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
  if (!showTooltip) return button;
  return (
    <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
