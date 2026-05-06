import { createProject, updateProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";

export function ProjectForm({
  project,
}: {
  project?: { id: string; name: string; description: string | null; status: string };
}) {
  const action = project ? updateProject.bind(null, project.id) : createProject;

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <TextField label="Name" name="name" defaultValue={project?.name} required />
      <TextField label="Description" name="description" defaultValue={project?.description ?? ""} />
      <SelectField label="Status" name="status" defaultValue={project?.status ?? "active"}>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="archived">Archived</option>
      </SelectField>
      <Button type="submit" variant="primary">
        {project ? "Update project" : "Create project"}
      </Button>
    </form>
  );
}
