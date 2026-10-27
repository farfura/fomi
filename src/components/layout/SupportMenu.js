"use client";

import { Copy, ExternalLink, Headset } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/download";
import { ShortcutList } from "./ShortcutList";

const SUPPORT_EMAIL = "support@fomi.art";

export function SupportMenu({ className }) {
  const { toast } = useToast();

  return (
    <Popover
      label="Support"
      className="w-80 p-4"
      wrapperClassName={className}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-chip px-3.5 text-xs font-medium text-muted transition-colors hover:text-ink aria-expanded:text-ink"
        >
          <Headset className="size-4" aria-hidden />
          Support
        </button>
      )}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold">Need a hand?</p>
          <p className="text-xs text-muted">We usually reply within a few hours during the beta.</p>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-panel px-3 py-2">
          <span className="text-xs font-medium select-all">{SUPPORT_EMAIL}</span>
          <button
            type="button"
            onClick={async () => toast((await copyText(SUPPORT_EMAIL)) ? "Email address copied" : SUPPORT_EMAIL)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-accent-strong hover:bg-chip-active"
          >
            <Copy className="size-3.5" aria-hidden /> Copy
          </button>
        </div>
        <a
          href="https://fomi.art"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium hover:bg-chip-active"
        >
          Visit fomi.art
          <ExternalLink className="size-3.5 text-muted" aria-hidden />
        </a>
        <div className="space-y-2 border-t border-line pt-3">
          <p className="text-xs font-semibold">Keyboard shortcuts</p>
          <ShortcutList />
        </div>
      </div>
    </Popover>
  );
}
