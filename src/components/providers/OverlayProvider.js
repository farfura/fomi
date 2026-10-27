"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useMemo, useState } from "react";
import { useGenerationActions } from "@/features/workspace/store/GenerationsProvider";

// Overlays are code-split: none of this JavaScript loads until a user opens one.
const LibrarySheet = dynamic(() => import("@/features/library/LibrarySheet"), { ssr: false });
const InspirationSheet = dynamic(() => import("@/features/library/InspirationSheet"), { ssr: false });
const Lightbox = dynamic(() => import("@/features/library/Lightbox"), { ssr: false });

const OverlayContext = createContext(null);

/**
 * App-wide modal surfaces: the library (history and assets), the inspiration gallery
 * and the full screen viewer. Any component can open them through `useOverlays()`.
 */
export function OverlayProvider({ children }) {
  const [overlay, setOverlay] = useState(null);
  const [viewer, setViewer] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { requestComposer } = useGenerationActions();

  // Transient UI should never survive a navigation (adjusted during render, no effect needed).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOverlay(null);
    setViewer(null);
  }

  const api = useMemo(
    () => ({
      openLibrary: (tab = "all") => setOverlay({ kind: "library", tab }),
      openInspiration: () => setOverlay({ kind: "inspiration" }),
      openViewer: (entries, index = 0) => setViewer({ entries, index }),
      closeOverlay: () => setOverlay(null),
      closeViewer: () => setViewer(null),
      reusePrompt: (payload) => {
        requestComposer(payload);
        setOverlay(null);
        setViewer(null);
        if (pathname !== "/") router.push("/");
      },
    }),
    [pathname, requestComposer, router],
  );

  return (
    <OverlayContext value={api}>
      {children}
      {overlay?.kind === "library" ? (
        <LibrarySheet initialTab={overlay.tab} onClose={api.closeOverlay} />
      ) : null}
      {overlay?.kind === "inspiration" ? <InspirationSheet onClose={api.closeOverlay} /> : null}
      {viewer ? (
        <Lightbox
          entries={viewer.entries}
          initialIndex={viewer.index}
          onClose={api.closeViewer}
        />
      ) : null}
    </OverlayContext>
  );
}

export function useOverlays() {
  const context = use(OverlayContext);
  if (!context) throw new Error("useOverlays must be used inside <OverlayProvider>");
  return context;
}
