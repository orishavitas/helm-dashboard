import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4">
      <section className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2 text-xl font-semibold text-zinc-100">
          <FolderKanban className="h-6 w-6 text-indigo-400" />
          Helm
        </div>
        <h1 className="text-2xl font-semibold text-zinc-50">Developer command center</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in to see project work, open pull requests, deploy state, and todos in one compact workspace.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="mt-6"
        >
          <Button className="w-full" type="submit" variant="primary">
            Continue with Google
          </Button>
        </form>
      </section>
    </main>
  );
}
