import "server-only";

import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export function githubInstallUrl() {
  const slug = process.env.GITHUB_APP_SLUG;
  if (!slug) {
    throw new Error("GITHUB_APP_SLUG is required.");
  }
  return `https://github.com/apps/${slug}/installations/new`;
}

function privateKey() {
  const key = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!key) {
    throw new Error("GITHUB_APP_PRIVATE_KEY is required.");
  }
  return key.replace(/\\n/g, "\n");
}

export async function githubForInstallation(installationId: string) {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID ?? "",
    privateKey: privateKey(),
    installationId,
  });
  const { token } = await auth({ type: "installation" });
  return new Octokit({ auth: token });
}

export async function listInstallationRepos(installationId: string) {
  const octokit = await githubForInstallation(installationId);
  const repos = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation);
  return repos.map((repo) => ({
    id: repo.id,
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
  }));
}

export async function getOpenPullRequests(installationId: string, owner: string, repo: string) {
  const octokit = await githubForInstallation(installationId);
  const prs = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: "open",
    per_page: 50,
  });

  return prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    updatedAt: pr.updated_at,
    draft: pr.draft,
  }));
}
