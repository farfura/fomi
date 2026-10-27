"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Route level error boundary: keeps the app usable if a screen fails to render. */
export default function Error({ reset }) {
  return (
    <main id="main" role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">This screen hit an unexpected error. Trying again usually fixes it.</p>
      <Button variant="primary" icon={<RotateCw className="size-4" aria-hidden />} onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
