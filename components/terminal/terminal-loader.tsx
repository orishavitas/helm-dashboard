"use client";

import dynamic from "next/dynamic";

// xterm.js accesses `document` at module load — must be client-only.
// This thin client wrapper owns the dynamic import so the Server Component
// page doesn't have to be a Client Component itself.
const XtermPane = dynamic(
  () => import("@/components/terminal/xterm-pane").then((m) => ({ default: m.XtermPane })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        Loading terminal…
      </div>
    ),
  },
);

interface TerminalLoaderProps {
  sessionId: string;
}

export function TerminalLoader({ sessionId }: TerminalLoaderProps) {
  return <XtermPane sessionId={sessionId} />;
}
