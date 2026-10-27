"use client";

import Link from "next/link";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";
import styles from "./MainNav.module.css";
import { useNav } from "./use-nav";

const itemClass =
  "group/nav relative flex h-10 w-full items-center justify-center rounded-full transition-colors duration-200";

export function MainNav({ className }) {
  const { items, activeId, select } = useNav();
  const index = items.findIndex((item) => item.id === activeId);

  return (
    <nav aria-label="Primary" className={cn("w-[320px] lg:w-[400px] xl:w-[452px]", className)}>
      <div
        className="flex flex-col gap-1.5"
        style={{ "--count": items.length, "--index": Math.max(index, 0) }}
      >
        <div aria-hidden className={styles.track}>
          <span className={cn(styles.fill, index < 0 && styles.fillHidden)} />
        </div>
        <ul className={styles.items}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeId;
            const icon = (
              <Icon
                aria-hidden
                className={cn(
                  "size-[19px] transition-transform duration-300 ease-spring group-hover/nav:-translate-y-0.5",
                  active ? "text-ink" : "text-muted group-hover/nav:text-ink",
                )}
                strokeWidth={active ? 2.4 : 1.9}
              />
            );
            return (
              <li key={item.id} className="flex justify-center">
                <Tooltip content={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={itemClass}
                      style={{ width: 52 }}
                    >
                      {icon}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-label={item.label}
                      aria-current={active ? "true" : undefined}
                      onClick={() => select(item)}
                      className={itemClass}
                      style={{ width: 52 }}
                    >
                      {icon}
                    </button>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
