import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";

export function TaskForm({ projectId, sprintId }: { projectId: string; sprintId: string | null }) {
  return (
    <form action={createTask.bind(null, projectId)} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <input type="hidden" name="sprintId" value={sprintId ?? ""} />
      <TextField label="Task" name="title" placeholder="Ship the next useful slice" required />
      <TextField label="Notes" name="notes" placeholder="Optional context" />
      <SelectField label="Priority" name="priority" defaultValue="medium">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </SelectField>
      <Button type="submit" variant="primary">Add task</Button>
    </form>
  );
}
