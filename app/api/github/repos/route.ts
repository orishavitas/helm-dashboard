import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { userIntegrations } from "@/lib/db/schema";
import { listInstallationRepos } from "@/lib/integrations/github";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const [integration] = await getDb()
    .select()
    .from(userIntegrations)
    .where(and(eq(userIntegrations.userId, user.id), eq(userIntegrations.provider, "github")))
    .limit(1);
  if (!integration?.installationId) {
    return NextResponse.json({ connected: false, repos: [] });
  }

  try {
    const repos = await listInstallationRepos(integration.installationId);
    return NextResponse.json({ connected: true, repos });
  } catch (error) {
    return NextResponse.json(
      { connected: true, repos: [], error: error instanceof Error ? error.message : "GitHub unavailable." },
      { status: 502 },
    );
  }
}
