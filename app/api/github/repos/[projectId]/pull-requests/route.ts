import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { githubRepoSnapshots } from "@/lib/db/schema";
import { coerceGithubPullRequests, deriveGithubSnapshotState } from "@/lib/github-snapshot";
import { assertProjectOwner } from "@/lib/ownership";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const [{ projectId }, user] = await Promise.all([params, requireUser()]);
  const project = await assertProjectOwner(projectId, user.id);
  const [snapshot] = await getDb()
    .select()
    .from(githubRepoSnapshots)
    .where(eq(githubRepoSnapshots.projectId, projectId))
    .limit(1);

  const state = deriveGithubSnapshotState({
    status: snapshot?.status ?? "missing",
    fetchedAt: snapshot?.fetchedAt ?? null,
    error: snapshot?.error ?? null,
  });

  return NextResponse.json({
    repo:
      project.githubRepoOwner && project.githubRepoName
        ? { owner: project.githubRepoOwner, name: project.githubRepoName }
        : null,
    ...state,
    openPullRequests: coerceGithubPullRequests(snapshot?.openPrs),
  });
}
