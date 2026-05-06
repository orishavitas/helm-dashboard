import { NextResponse } from "next/server";

import { githubInstallUrl } from "@/lib/integrations/github";
import { requireUser } from "@/lib/session";

export async function GET() {
  await requireUser();
  return NextResponse.redirect(githubInstallUrl());
}
