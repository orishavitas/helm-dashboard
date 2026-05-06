"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { projects, userIntegrations } from "@/lib/db/schema";
import { getOpenPullRequests } from "@/lib/integrations/github";
import { latestVercelDeployment } from "@/lib/integrations/vercel";
import { assertProjectOwner } from "@/lib/ownership";
import { encryptSecret, decryptSecret } from "@/lib/security/encryption";
import { requireUser } from "@/lib/session";

export async function connectVercelToken(formData: FormData) {
  const user = await requireUser();
  const token = z.string().trim().min(1).parse(formData.get("token"));

  await getDb()
    .insert(userIntegrations)
    .values({
      userId: user.id,
      provider: "vercel",
      encryptedToken: encryptSecret(token),
    })
    .onConflictDoUpdate({
      target: [userIntegrations.userId, userIntegrations.provider],
      set: { encryptedToken: encryptSecret(token), updatedAt: new Date() },
    });

  revalidatePath("/settings");
}

export async function linkProjectRepo(projectId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const owner = z.string().trim().min(1).parse(formData.get("owner"));
  const repo = z.string().trim().min(1).parse(formData.get("repo"));

  await getDb()
    .update(projects)
    .set({ githubRepoOwner: owner, githubRepoName: repo, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function linkVercelProject(projectId: string, formData: FormData) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const vercelProjectId = z.string().trim().min(1).parse(formData.get("vercelProjectId"));
  const vercelProjectName = z.string().trim().min(1).parse(formData.get("vercelProjectName"));

  await getDb()
    .update(projects)
    .set({ vercelProjectId, vercelProjectName, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function refreshProjectSnapshots(projectId: string) {
  const user = await requireUser();
  const project = await assertProjectOwner(projectId, user.id);
  const integrations = await getDb().select().from(userIntegrations).where(eq(userIntegrations.userId, user.id));
  const github = integrations.find((item) => item.provider === "github");
  const vercel = integrations.find((item) => item.provider === "vercel");

  if (github?.installationId && project.githubRepoOwner && project.githubRepoName) {
    await refreshGithub(project.id, github.installationId, project.githubRepoOwner, project.githubRepoName);
  }
  if (vercel?.encryptedToken && project.vercelProjectId) {
    await refreshVercel(project.id, decryptSecret(vercel.encryptedToken), project.vercelProjectId);
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

async function refreshGithub(projectId: string, installationId: string, owner: string, repo: string) {
  const { githubRepoSnapshots } = await import("@/lib/db/schema");
  try {
    const prs = await getOpenPullRequests(installationId, owner, repo);
    await getDb().insert(githubRepoSnapshots).values({
      projectId,
      openPrCount: prs.length,
      openPrs: prs,
      status: "fresh",
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: githubRepoSnapshots.projectId,
      set: { openPrCount: prs.length, openPrs: prs, status: "fresh", error: null, fetchedAt: new Date() },
    });
  } catch (error) {
    await getDb().insert(githubRepoSnapshots).values({
      projectId,
      status: "error",
      error: error instanceof Error ? error.message : "GitHub refresh failed.",
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: githubRepoSnapshots.projectId,
      set: { status: "error", error: error instanceof Error ? error.message : "GitHub refresh failed.", fetchedAt: new Date() },
    });
  }
}

async function refreshVercel(projectId: string, token: string, vercelProjectId: string) {
  const { vercelDeploymentSnapshots } = await import("@/lib/db/schema");
  try {
    const deployment = await latestVercelDeployment(token, vercelProjectId);
    await getDb().insert(vercelDeploymentSnapshots).values({
      projectId,
      deployment,
      status: deployment ? "fresh" : "missing",
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: vercelDeploymentSnapshots.projectId,
      set: { deployment, status: deployment ? "fresh" : "missing", error: null, fetchedAt: new Date() },
    });
  } catch (error) {
    await getDb().insert(vercelDeploymentSnapshots).values({
      projectId,
      status: "error",
      error: error instanceof Error ? error.message : "Vercel refresh failed.",
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: vercelDeploymentSnapshots.projectId,
      set: { status: "error", error: error instanceof Error ? error.message : "Vercel refresh failed.", fetchedAt: new Date() },
    });
  }
}
