import { GitBranch, RefreshCw, Rocket } from "lucide-react";

import {
  connectVercelToken,
  linkProjectRepo,
  linkVercelProject,
  refreshProjectSnapshots,
} from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function VercelTokenForm() {
  return (
    <form action={connectVercelToken} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <TextField label="Vercel token" name="token" type="password" required />
      <Button type="submit" variant="primary">
        <Rocket className="h-4 w-4" />
        Save token
      </Button>
    </form>
  );
}

export function ProjectIntegrationForms({ projectId }: { projectId: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={linkProjectRepo.bind(null, projectId)} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <TextField label="GitHub owner" name="owner" required />
        <TextField label="GitHub repo" name="repo" required />
        <Button type="submit">
          <GitBranch className="h-4 w-4" />
          Link repo
        </Button>
      </form>
      <form action={linkVercelProject.bind(null, projectId)} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <TextField label="Vercel project ID" name="vercelProjectId" required />
        <TextField label="Vercel project name" name="vercelProjectName" required />
        <Button type="submit">
          <Rocket className="h-4 w-4" />
          Link Vercel
        </Button>
      </form>
      <form action={refreshProjectSnapshots.bind(null, projectId)} className="lg:col-span-2">
        <Button type="submit" variant="primary">
          <RefreshCw className="h-4 w-4" />
          Refresh integrations
        </Button>
      </form>
    </div>
  );
}
