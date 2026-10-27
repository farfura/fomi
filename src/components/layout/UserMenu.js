"use client";

import { Headset, Images, LogOut } from "lucide-react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Popover } from "@/components/ui/Popover";
import { useToast } from "@/components/ui/Toast";
import { useGenerations } from "@/features/workspace/store/GenerationsProvider";
import { formatNumber } from "@/lib/format";

const USER = { name: "Hira Khan", email: "hira@northlight.studio", initials: "HK", plan: "Pro · Beta" };
const MONTHLY_CREDITS = 2000;
const CREDITS_USED_BEFORE = 760;

export function UserMenu() {
  const { items, localIds } = useGenerations();
  const { openInspiration } = useOverlays();
  const { toast } = useToast();

  // Credits respond to what the user generates in this browser.
  const usedNow = items
    .filter((item) => localIds.includes(item.id))
    .reduce((sum, item) => sum + item.count * (item.mode === "video" ? 5 : 1), 0);
  const used = CREDITS_USED_BEFORE + usedNow;
  const left = Math.max(MONTHLY_CREDITS - used, 0);

  return (
    <Popover
      label="Account"
      className="w-72 p-3"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label="Account menu"
          className="flex size-8 items-center justify-center rounded-full bg-[conic-gradient(from_200deg,#e3998a,#b95a43,#6f7f5a,#e3998a)] p-[2px] transition-transform active:scale-90"
        >
          <span className="flex size-full items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-ink">
            {USER.initials}
          </span>
        </button>
      )}
    >
      {({ close }) => (
        <div className="space-y-3">
          <div className="px-1">
            <p className="text-sm font-semibold">{USER.name}</p>
            <p className="text-xs text-muted">{USER.email}</p>
          </div>
          <div className="space-y-2 rounded-xl bg-panel p-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium">{USER.plan}</span>
              <span className="tabular-nums text-muted">{formatNumber(left)} credits left</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Monthly credits used" aria-valuemin={0} aria-valuemax={MONTHLY_CREDITS} aria-valuenow={used}>
              <div
                className="h-full rounded-full bg-accent-strong transition-[width] duration-700 ease-out-soft"
                style={{ width: `${(used / MONTHLY_CREDITS) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => {
                close();
                openInspiration();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-chip-active"
            >
              <Images className="size-4 text-muted" aria-hidden /> Gallery
            </button>
            <a
              href="mailto:support@fomi.art"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-chip-active"
            >
              <Headset className="size-4 text-muted" aria-hidden /> support@fomi.art
            </a>
          </div>
          <button
            type="button"
            onClick={() => {
              close();
              toast("This is a demo workspace, so you stay signed in.", { type: "info" });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-chip-active hover:text-ink"
          >
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
      )}
    </Popover>
  );
}
