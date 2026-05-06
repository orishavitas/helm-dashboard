import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { userIntegrations } from "@/lib/db/schema";
import { listVercelProjects } from "@/lib/integrations/vercel";
import { decryptSecret } from "@/lib/security/encryption";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const [integration] = await getDb()
    .select()
    .from(userIntegrations)
    .where(and(eq(userIntegrations.userId, user.id), eq(userIntegrations.provider, "vercel")))
    .limit(1);
  if (!integration?.encryptedToken) {
    return NextResponse.json({ connected: false, projects: [] });
  }

  try {
    const projects = await listVercelProjects(decryptSecret(integration.encryptedToken));
    return NextResponse.json({ connected: true, projects });
  } catch (error) {
    return NextResponse.json(
      { connected: true, projects: [], error: error instanceof Error ? error.message : "Vercel unavailable." },
      { status: 502 },
    );
  }
}
