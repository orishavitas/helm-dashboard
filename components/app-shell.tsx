import { BookOpen, Bot, FolderKanban, Home, LogOut, Settings, Share2, SquareTerminal } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  userName,
  isLocal = false,
}: {
  children: React.ReactNode;
  userName: string;
  isLocal?: boolean;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-zinc-800 bg-zinc-950/95 p-4 md:block">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <FolderKanban className="h-5 w-5 text-indigo-400" />
          Helm
        </Link>
        <nav className="mt-8 grid gap-1 text-sm">
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          {isLocal ? (
            <>
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/terminal">
                <SquareTerminal className="h-4 w-4" />
                Terminal
              </Link>
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/agents">
                <Bot className="h-4 w-4" />
                Agents
              </Link>
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/vault">
                <BookOpen className="h-4 w-4" />
                Vault
              </Link>
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/graph">
                <Share2 className="h-4 w-4" />
                Graph
              </Link>
            </>
          ) : null}
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900" href="/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="mb-3 truncate text-xs text-zinc-500">{userName}</div>
          <Button className="w-full" variant="ghost" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </aside>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FolderKanban className="h-5 w-5 text-indigo-400" />
          Helm
        </Link>
        <div className="flex items-center gap-1">
          {isLocal ? (
            <>
              <Link className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900" href="/terminal" aria-label="Terminal">
                <SquareTerminal className="h-5 w-5" />
              </Link>
              <Link className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900" href="/agents" aria-label="Agents">
                <Bot className="h-5 w-5" />
              </Link>
              <Link className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900" href="/vault" aria-label="Vault">
                <BookOpen className="h-5 w-5" />
              </Link>
              <Link className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900" href="/graph" aria-label="Graph">
                <Share2 className="h-5 w-5" />
              </Link>
            </>
          ) : null}
          <Link className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900" href="/settings" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <main className="md:pl-60">{children}</main>
    </div>
  );
}
