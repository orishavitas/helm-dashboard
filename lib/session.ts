import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "Developer",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };
}
