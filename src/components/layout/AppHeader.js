"use client";

import { Images } from "lucide-react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { MobileTabBar } from "./MobileTabBar";
import { SupportMenu } from "./SupportMenu";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

/**
 * Top bar shared by every page: brand, primary navigation and account actions.
 * The page decides what sits under it (`children` renders inside the sticky area,
 * which the workspace uses for the history rail).
 */
export function AppHeader({ children, className }) {
  const { openInspiration } = useOverlays();

  return (
    <>
      <header className={cn("sticky top-0 z-40 bg-bg/85 backdrop-blur-xl", className)}>
        <div className="mx-auto grid h-16 max-w-[1760px] grid-cols-[1fr_auto] items-center gap-4 px-4 md:h-[76px] md:grid-cols-[1fr_auto_1fr] md:px-6 xl:px-12">
          <Logo />
          <MainNav className="hidden md:block" />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={openInspiration}
              className="hidden h-9 items-center gap-2 rounded-full border border-line bg-chip px-3.5 text-xs font-medium text-muted transition-colors hover:text-ink md:inline-flex"
            >
              <Images className="size-4" aria-hidden />
              Gallery
            </button>
            <SupportMenu className="hidden lg:inline-flex" />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        {children}
      </header>
      <MobileTabBar />
    </>
  );
}
