import { ProjectStateWidget } from "@/components/operations/project-state-widget";
import { ResponsibilityWidget } from "@/components/operations/responsibility-widget";
import { TaskQueueWidget } from "@/components/operations/task-queue-widget";
import { TerminalPresenceWidget } from "@/components/operations/terminal-presence-widget";
import type { OperationsState } from "@/lib/view-models";

type Props = {
  state: OperationsState;
};

export function OperationsDashboard({ state }: Props) {
  return (
    <section className="grid grid-cols-12 gap-4 xl:gap-6" aria-label="Operations state">
      <ProjectStateWidget projects={state.projects} />
      <TaskQueueWidget tasks={state.tasks} size="wide" />
      <ResponsibilityWidget responsibility={state.responsibility} size="side" />
      <TerminalPresenceWidget terminals={state.terminals} />
    </section>
  );
}
