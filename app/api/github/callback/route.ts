import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { userIntegrations } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const installationId = request.nextUrl.searchParams.get("installation_id");
  if (!installationId) {
    return NextResponse.redirect(new URL("/settings?github=missing-installation", request.url));
  }

  await getDb()
    .insert(userIntegrations)
    .values({
      userId: user.id,
      provider: "github",
      installationId,
      metadata: { setupAction: request.nextUrl.searchParams.get("setup_action") },
    })
    .onConflictDoUpdate({
      target: [userIntegrations.userId, userIntegrations.provider],
      set: { installationId, updatedAt: new Date() },
    });

  return NextResponse.redirect(new URL("/settings?github=connected", request.url));
}
