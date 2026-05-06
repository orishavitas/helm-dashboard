import "server-only";

const apiBase = () => process.env.VERCEL_API_BASE_URL ?? "https://api.vercel.com";

async function vercelFetch<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Vercel request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function listVercelProjects(token: string) {
  const payload = await vercelFetch<{ projects?: Array<{ id: string; name: string }> }>(token, "/v9/projects");
  return payload.projects ?? [];
}

export async function latestVercelDeployment(token: string, projectId: string) {
  const payload = await vercelFetch<{
    deployments?: Array<{
      uid: string;
      name: string;
      url?: string;
      target?: string;
      state?: string;
      createdAt?: number;
    }>;
  }>(token, `/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=1`);

  const deployment = payload.deployments?.[0];
  if (!deployment) {
    return null;
  }

  return {
    id: deployment.uid,
    name: deployment.name,
    url: deployment.url ? `https://${deployment.url}` : null,
    environment: deployment.target ?? null,
    status: deployment.state ?? null,
    createdAt: deployment.createdAt ?? null,
  };
}
