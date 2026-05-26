export const GITHUB_SNAPSHOT_TTL_MS = 60 * 1000;

export type SnapshotStatus = "fresh" | "stale" | "error" | "missing";

export type GithubPullRequest = {
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  draft: boolean;
};

export type GithubCommit = {
  sha: string;
  message: string;
  author: string;
  url: string;
  committedAt: string | null;
};

export function deriveGithubSnapshotState({
  status,
  fetchedAt,
  error,
  now = new Date(),
  ttlMs = GITHUB_SNAPSHOT_TTL_MS,
}: {
  status: SnapshotStatus;
  fetchedAt: Date | string | null;
  error: string | null;
  now?: Date;
  ttlMs?: number;
}) {
  const fetchedDate = typeof fetchedAt === "string" ? new Date(fetchedAt) : fetchedAt;
  const derivedStatus =
    status === "fresh" && fetchedDate && now.getTime() - fetchedDate.getTime() > ttlMs ? "stale" : status;

  return {
    status: derivedStatus,
    fetchedAt: fetchedDate,
    error,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function firstLine(value: string) {
  return value.split(/\r?\n/, 1)[0] ?? value;
}

export function normalizePullRequest(value: unknown): GithubPullRequest {
  const pr = asObject(value);
  return {
    number: typeof pr.number === "number" ? pr.number : 0,
    title: asString(pr.title, "Untitled pull request"),
    url: asString(pr.html_url ?? pr.url),
    updatedAt: asString(pr.updated_at ?? pr.updatedAt),
    draft: Boolean(pr.draft),
  };
}

export function normalizeCommit(value: unknown): GithubCommit {
  const item = asObject(value);
  const commit = asObject(item.commit);
  const author = asObject(commit.author);
  const sha = asString(item.sha);

  return {
    sha: sha.slice(0, 7),
    message: firstLine(asString(commit.message, "Untitled commit")),
    author: asString(author.name, "Unknown"),
    url: asString(item.html_url ?? item.url),
    committedAt: asString(author.date) || null,
  };
}

export function coerceGithubPullRequests(value: unknown): GithubPullRequest[] {
  return Array.isArray(value) ? value.map(normalizePullRequest) : [];
}

export function coerceGithubCommits(value: unknown): GithubCommit[] {
  return Array.isArray(value) ? value.map(normalizeCommit) : [];
}
