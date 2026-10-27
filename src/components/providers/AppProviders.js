"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { GenerationsProvider } from "@/features/workspace/store/GenerationsProvider";
import { OverlayProvider } from "./OverlayProvider";

export function AppProviders({ initialPage, catalog, children }) {
  return (
    <ToastProvider>
      <GenerationsProvider initialPage={initialPage} catalog={catalog}>
        <OverlayProvider>{children}</OverlayProvider>
      </GenerationsProvider>
    </ToastProvider>
  );
}
