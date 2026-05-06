import { createSprint } from "@/lib/actions/sprints";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function SprintForm({ projectId }: { projectId: string }) {
  return (
    <form action={createSprint.bind(null, projectId)} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <TextField label="Sprint name" name="name" placeholder="Sprint 1" required />
      <TextField label="Goal" name="goal" placeholder="Tight outcome for the sprint" />
      <Button type="submit" variant="primary">Open sprint</Button>
    </form>
  );
}
