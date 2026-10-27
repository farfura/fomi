import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }) {
  return (
    <Link
      href="/"
      aria-label="Fomi home"
      className={cn("inline-flex items-center rounded-lg text-ink transition-opacity hover:opacity-80", className)}
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
        <path d="M5 2.5h15l-2.2 5H11v3.6h6.6l-2.1 4.8H11v5.6H5z" fill="currentColor" />
      </svg>
    </Link>
  );
}
