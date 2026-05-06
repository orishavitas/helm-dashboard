import { createTodo } from "@/lib/actions/todos";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function TodoForm({ projectId }: { projectId?: string }) {
  return (
    <form action={createTodo} className="flex gap-2">
      <input type="hidden" name="projectId" value={projectId ?? ""} />
      <TextField className="min-w-0" label="Todo" name="title" placeholder="Capture an open loop" required />
      <Button className="mt-6" type="submit" variant="primary">Add</Button>
    </form>
  );
}
