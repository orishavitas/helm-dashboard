import { and, eq, ilike, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { projects, sprints, tasks, users } from "@/lib/db/schema";
import { parseOperationsImportEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const taskImportSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    notes: z.string().trim().max(1000).nullish(),
    status: z.enum(["todo", "in-progress", "done", "blocked"]).default("todo"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    assignee: z.string().trim().max(120).nullish(),
    agentRole: z.string().trim().max(80).nullish(),
    source: z.string().trim().min(1).max(40).default("local"),
    sourceRef: z.string().trim().min(1).max(320),
    sourceUrl: z.string().trim().max(1000).nullish(),
    blockedReason: z.string().trim().max(500).nullish(),
    finishedAt: z.string().datetime().nullish(),
  })
  .strict();

const projectImportSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).nullish(),
    status: z.enum(["active", "paused", "archived"]).optional(),
    path: z.string().trim().max(1000).nullish(),
    repo: z.string().trim().max(240).nullish(),
    vercelProject: z.string().trim().max(240).nullish(),
    owner: z.string().trim().min(1).max(240),
    sprint: z
      .object({
        name: z.string().trim().min(1).max(120),
        sourceUrl: z.string().trim().max(1000).nullish(),
      })
      .strict()
      .nullish(),
    tasks: z.array(taskImportSchema).max(1000).default([]),
  })
  .strict();

const importSchema = z
  .object({
    projects: z.array(projectImportSchema).max(100),
  })
  .strict();

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function splitRepo(value: string | null | undefined) {
  const repo = emptyToNull(value);
  if (!repo) {
    return { owner: null, name: null };
  }

  const [owner, name] = repo.split("/", 2).map((part) => part.trim()).filter(Boolean);
  return owner && name ? { owner, name } : { owner: null, name: repo };
}

async function resolveOwner(ownerRef: string) {
  const db = getDb();
  const normalized = ownerRef.trim();
  const [matched] = await db
    .select({ id: users.id })
    .from(users)
    .where(normalized.includes("@") ? eq(users.email, normalized) : ilike(users.name, normalized))
    .limit(1);

  if (matched) {
    return matched.id;
  }

  const allUsers = await db.select({ id: users.id }).from(users).limit(2);
  if (allUsers.length === 1) {
    return allUsers[0].id;
  }

  throw new Error(`No Helm user matched import owner "${ownerRef}".`);
}

async function upsertProject(input: z.infer<typeof projectImportSchema>) {
  const db = getDb();
  const ownerId = await resolveOwner(input.owner);
  const repo = splitRepo(input.repo);
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.name, input.name), isNull(projects.deletedAt)))
    .limit(1);

  if (existing) {
    const updateValues: Partial<typeof projects.$inferInsert> = {
      updatedAt: new Date(),
    };
    const description = emptyToNull(input.description);
    const vercelProjectName = emptyToNull(input.vercelProject);
    if (description) {
      updateValues.description = description;
    }
    if (input.status) {
      updateValues.status = input.status;
    }
    if (repo.owner || repo.name) {
      updateValues.githubRepoOwner = repo.owner;
      updateValues.githubRepoName = repo.name;
    }
    if (vercelProjectName) {
      updateValues.vercelProjectName = vercelProjectName;
    }

    await db
      .update(projects)
      .set(updateValues)
      .where(eq(projects.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(projects)
    .values({
      ownerId,
      name: input.name,
      description: emptyToNull(input.description),
      status: input.status ?? "active",
      githubRepoOwner: repo.owner,
      githubRepoName: repo.name,
      vercelProjectName: emptyToNull(input.vercelProject),
    })
    .returning({ id: projects.id });
  return created.id;
}

async function upsertSprint(projectId: string, sprint: z.infer<typeof projectImportSchema>["sprint"]) {
  if (!sprint) {
    return null;
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: sprints.id })
    .from(sprints)
    .where(and(eq(sprints.projectId, projectId), isNull(sprints.closedAt)))
    .limit(1);

  if (existing) {
    await db.update(sprints).set({ name: sprint.name, goal: emptyToNull(sprint.sourceUrl) }).where(eq(sprints.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(sprints)
    .values({ projectId, name: sprint.name, goal: emptyToNull(sprint.sourceUrl) })
    .returning({ id: sprints.id });
  return created.id;
}

async function upsertTask(projectId: string, sprintId: string | null, input: z.infer<typeof taskImportSchema>) {
  const db = getDb();
  const [existing] = await db
    .select({ id: tasks.id, finishedAt: tasks.finishedAt })
    .from(tasks)
    .where(and(eq(tasks.source, input.source), eq(tasks.sourceRef, input.sourceRef), isNull(tasks.deletedAt)))
    .limit(1);

  const finishedAt = input.status === "done" ? input.finishedAt ? new Date(input.finishedAt) : existing?.finishedAt ?? new Date() : null;
  const values = {
    projectId,
    sprintId,
    title: input.title,
    notes: emptyToNull(input.notes),
    status: input.status,
    priority: input.priority,
    assignee: emptyToNull(input.assignee),
    agentRole: emptyToNull(input.agentRole),
    source: input.source,
    sourceRef: input.sourceRef,
    sourceUrl: emptyToNull(input.sourceUrl),
    blockedReason: input.status === "blocked" ? emptyToNull(input.blockedReason) : null,
    finishedAt,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(tasks).set(values).where(eq(tasks.id, existing.id));
    return "updated" as const;
  }

  await db.insert(tasks).values(values);
  return "created" as const;
}

export async function POST(req: NextRequest) {
  const env = parseOperationsImportEnv();
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env.OPERATIONS_IMPORT_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  let projectCount = 0;
  let taskCreated = 0;
  let taskUpdated = 0;

  try {
    for (const project of parsed.data.projects) {
      const projectId = await upsertProject(project);
      const sprintId = await upsertSprint(projectId, project.sprint);
      projectCount += 1;

      for (const task of project.tasks) {
        const result = await upsertTask(projectId, sprintId, task);
        if (result === "created") {
          taskCreated += 1;
        } else {
          taskUpdated += 1;
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    projects: projectCount,
    tasks: {
      created: taskCreated,
      updated: taskUpdated,
    },
  });
}
