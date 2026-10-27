import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-accent-strong">404</p>
      <h1 className="text-2xl font-semibold">This page wandered off</h1>
      <p className="max-w-sm text-sm text-muted">The link may be old, or the page was moved. Your work is safe in the workspace.</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-full bg-accent-strong px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong-hover"
      >
        Back to the workspace
      </Link>
    </main>
  );
}
