import { AppHeader } from "@/components/layout/AppHeader";
import { Composer } from "./composer/Composer";
import { GenerationFeed } from "./feed/GenerationFeed";
import { HistoryRail } from "./HistoryRail";

/**
 * Part A: the generation workspace from the design.
 * Desktop: composer column on the left, feed on the right. Tablet and phone: stacked.
 */
export function Workspace() {
  return (
    <>
      <AppHeader>
        <HistoryRail />
      </AppHeader>
      <main
        id="main"
        className="mx-auto grid max-w-[1760px] grid-cols-1 gap-6 px-4 pt-3 pb-28 md:px-6 md:pb-16 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 xl:px-12 2xl:grid-cols-[380px_minmax(0,1fr)]"
      >
        <aside className="lg:sticky lg:top-[208px] lg:h-[calc(100dvh-224px)] lg:self-start">
          <Composer className="lg:h-full lg:overflow-y-auto lg:overscroll-contain" />
        </aside>
        <GenerationFeed />
      </main>
    </>
  );
}
