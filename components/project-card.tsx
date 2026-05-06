import { AlertTriangle, GitPullRequest, Rocket } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/view-models";

function statusTone(status: ProjectSummary["status"]) {
  return status === "active" ? "green" : status === "paused" ? "amber" : "zinc";
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const progress =
    project.sprintTotal > 0 ? `${project.sprintDone}/${project.sprintTotal}` : "backlog";

  return (
    <Link
      href={`/projects/${project.id}`}
      className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-50">{project.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{project.description ?? "No description"}</p>
        </div>
        <Badge tone={statusTone(project.status)}>{project.status}</Badge>
      </div>
      <div className="grid gap-2 text-sm text-zinc-300">
        <div className="flex items-center justify-between">
          <span>{project.sprintName ?? "No open sprint"}</span>
          <span className="text-zinc-500">{progress}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-indigo-300" />
            Open PRs
          </span>
          <span>{project.openPrCount ?? "not linked"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-emerald-300" />
            Deploy
          </span>
          <span className="text-right text-zinc-500">
            {project.vercel.deploymentStatus ?? project.vercel.status}
          </span>
        </div>
        {(project.github.status === "error" || project.vercel.status === "error") && (
          <span className="flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Integration attention needed
          </span>
        )}
      </div>
      <div className="text-xs text-zinc-600">
        GitHub {formatRelativeTime(project.github.fetchedAt)} · Vercel {formatRelativeTime(project.vercel.fetchedAt)}
      </div>
    </Link>
  );
}
