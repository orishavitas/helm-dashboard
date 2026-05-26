import { notFound } from "next/navigation";
import { SquareTerminal } from "lucide-react";

import { Card } from "@/components/ui/card";
import { parseLocalProfileEnv } from "@/lib/env";
import { TerminalLoader } from "@/components/terminal/terminal-loader";

export const runtime = "nodejs";

export default function TerminalPage() {
  const env = parseLocalProfileEnv();

  if (!env.isLocal) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-300">
            <SquareTerminal className="h-4 w-4" />
            Local runtime
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-zinc-50">Terminal</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            PowerShell session running from {env.TERMINAL_CWD ?? process.cwd()}.
          </p>
        </div>
        <Card className="grid gap-1 p-3 text-xs text-zinc-400 md:min-w-64">
          <div className="flex justify-between gap-4">
            <span>Profile</span>
            <span className="font-medium text-zinc-200">{env.HELM_PROFILE}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Shell</span>
            <span className="font-medium text-zinc-200">{env.TERMINAL_SHELL ?? "powershell.exe"}</span>
          </div>
        </Card>
      </div>

      <TerminalLoader sessionId="main" />
    </div>
  );
}
