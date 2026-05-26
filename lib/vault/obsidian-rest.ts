/**
 * Typed client for obsidian-local-rest-api (https://github.com/coddingtonbear/obsidian-local-rest-api)
 * Default port: 27123, Bearer auth.
 *
 * All methods throw if the REST API is unavailable — callers should fall back to vault-fs.ts.
 */

export interface VaultFileEntry {
  path: string;
  name: string;
  type: "file" | "directory";
  children?: VaultFileEntry[];
  /** Size in bytes, present for files */
  size?: number;
  /** Last modified, ISO string */
  modified?: string;
}

export interface NoteContent {
  path: string;
  content: string;
  frontmatter: Record<string, unknown>;
  tags: string[];
}

export interface SearchResult {
  path: string;
  score: number;
  matches: string[];
}

export interface ObsidianRestClientOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export class ObsidianRestClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor({ baseUrl, apiKey, timeoutMs = 5_000 }: ObsidianRestClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: { ...this.headers(), ...init?.headers },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Obsidian REST API error ${response.status}: ${await response.text()}`);
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** List vault root or a directory */
  async listVault(dirPath = "/"): Promise<VaultFileEntry[]> {
    const path = dirPath === "/" ? "/vault/" : `/vault/${encodeURIComponent(dirPath)}/`;
    const result = await this.fetch<{ files: VaultFileEntry[] }>(path);
    return result.files ?? [];
  }

  /** Read a note's raw markdown content */
  async readNote(notePath: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/vault/${encodeURIComponent(notePath)}`, {
      headers: this.headers(),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`Failed to read note: ${response.status}`);
    }
    return response.text();
  }

  /** Full-text search across the vault */
  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const result = await this.fetch<{ results?: SearchResult[] }>(
      `/search/simple/?query=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return result.results ?? [];
  }

  /** Health check — returns true if API is reachable */
  async isAvailable(): Promise<boolean> {
    try {
      await this.fetch<unknown>("/");
      return true;
    } catch {
      return false;
    }
  }
}

/** Singleton factory — reads env vars */
let _client: ObsidianRestClient | null = null;

export function getObsidianClient(): ObsidianRestClient | null {
  const url = process.env.OBSIDIAN_REST_API_URL;
  const key = process.env.OBSIDIAN_REST_API_KEY;
  if (!url || !key) {
    return null;
  }
  if (!_client) {
    _client = new ObsidianRestClient({ baseUrl: url, apiKey: key });
  }
  return _client;
}
