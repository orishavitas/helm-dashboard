import { DashboardWidgetGrid } from "@/components/dashboard/dashboard-layout";
import { getProjectSummaries } from "@/lib/data/projects";
import { getGlobalTodos } from "@/lib/data/todos";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const [projects, todos] = await Promise.all([
    getProjectSummaries(user.id),
    getGlobalTodos(user.id),
  ]);

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase text-zinc-600">Helm dashboard</div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-50">Attention</h1>
          <p className="mt-1 text-sm text-zinc-500">Active projects, terminal state, product maturity, and missing launch signals.</p>
        </div>
      </header>
      <DashboardWidgetGrid projects={projects} todos={todos} />
    </div>
  );
}
