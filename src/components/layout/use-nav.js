"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { useGenerationActions, useGenerations } from "@/features/workspace/store/GenerationsProvider";
import { NAV_ITEMS } from "./nav-items";

/** Shared behaviour for the desktop nav and the mobile tab bar. */
export function useNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { view } = useGenerations();
  const { setView } = useGenerationActions();
  const { openLibrary } = useOverlays();

  const activeId =
    pathname === "/studio"
      ? "studio"
      : (NAV_ITEMS.find((item) => item.view === view)?.id ?? "home");

  function select(item) {
    if (item.overlay === "library") return openLibrary();
    if (item.view) {
      setView(item.view);
      if (pathname !== "/") router.push("/");
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return { items: NAV_ITEMS, activeId, select };
}
