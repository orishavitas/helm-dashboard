import Link from "next/link";

import { VercelTokenForm } from "@/components/forms/integration-forms";
import { ProjectForm } from "@/components/forms/project-form";
import { Badge } from "@/components/ui/badge";
import { getProjectSummaries } from "@/lib/data/projects";
import { githubInstallUrl } from "@/lib/integrations/github";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const projects = await getProjectSummaries(user.id, true);

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Archived projects and provider connections.</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold text-zinc-100">GitHub App</h2>
          <p className="mt-2 text-sm text-zinc-500">Install the app, then link a repository from each project.</p>
          <Link
            href={safeGithubUrl()}
            className="mt-4 inline-flex h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm font-medium hover:bg-zinc-800"
          >
            Install GitHub App
          </Link>
        </div>
        <VercelTokenForm />
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-zinc-300">Project management</h2>
        <ProjectForm />
        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between p-3">
              <span className="font-medium text-zinc-100">{project.name}</span>
              <Badge tone={project.status === "archived" ? "zinc" : "green"}>{project.status}</Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function safeGithubUrl() {
  try {
    return githubInstallUrl();
  } catch {
    return "#";
  }
}
