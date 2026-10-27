import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary:
    "bg-accent-strong text-accent-ink shadow-[0_6px_16px_-6px_rgb(185_90_67/0.55)] hover:bg-accent-strong-hover disabled:shadow-none",
  secondary: "bg-chip text-ink border border-line hover:border-subtle/60 hover:bg-surface",
  soft: "bg-chip-active text-ink hover:bg-accent-soft",
  ghost: "text-muted hover:text-ink hover:bg-chip-active/70",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-[15px]",
};

/**
 * The single button primitive. Every button gets the same press feedback,
 * focus ring and disabled treatment, so interactions feel consistent app wide.
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium whitespace-nowrap",
        "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out-soft",
        "active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </button>
  );
}
