import { AppShell } from "@/components/app-shell";
import { parseLocalProfileEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { isLocal } = parseLocalProfileEnv();
  return <AppShell userName={user.name} isLocal={isLocal}>{children}</AppShell>;
}
