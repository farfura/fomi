"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import styles from "./MainNav.module.css";
import { useNav } from "./use-nav";

/** Bottom tab bar for phones: same destinations as the desktop nav, within thumb reach. */
export function MobileTabBar() {
  const { items, activeId, select } = useNav();
  const index = items.findIndex((item) => item.id === activeId);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="relative" style={{ "--count": items.length, "--index": Math.max(index, 0) }}>
        <div aria-hidden className={styles.tabTrack}>
          <span className={cn(styles.fill, index < 0 && styles.fillHidden)} />
        </div>
        <ul className={cn(styles.items, "px-2")}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeId;
            const content = (
              <>
                <Icon aria-hidden className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            );
            const className = cn(
              "flex h-14 w-full flex-col items-center justify-center gap-0.5 transition-colors active:scale-95",
              active ? "text-ink" : "text-muted",
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => select(item)}
                    className={className}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
