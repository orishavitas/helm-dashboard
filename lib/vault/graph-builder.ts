/**
 * Builds a force-graph-compatible {nodes, edges} structure from vault markdown files.
 * Parses [[wikilinks]] and #tags to build edges.
 */

export interface GraphNode {
  id: string;
  label: string;
  /** Relative path from vault root */
  path: string;
  /** Number of inbound links */
  inDegree: number;
  /** Number of outbound links */
  outDegree: number;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface VaultGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const WIKILINK_PATTERN = /\[\[([^\]|#]+)(?:[|#][^\]]*)?]]/g;
const TAG_PATTERN = /(?:^|\s)#([a-zA-Z0-9_/-]+)/g;
const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;

export interface NoteFile {
  /** Path relative to vault root, e.g. "projects/apex.md" */
  path: string;
  content: string;
}

/**
 * Build a VaultGraph from an array of note files.
 * Links are resolved by filename stem (case-insensitive).
 */
export function buildGraph(notes: NoteFile[]): VaultGraph {
  // Index: stem → path
  const stemIndex = new Map<string, string>();
  for (const note of notes) {
    const stem = stemFromPath(note.path);
    stemIndex.set(stem.toLowerCase(), note.path);
  }

  const nodeMap = new Map<string, GraphNode>();
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  // Initialize nodes
  for (const note of notes) {
    const tags = extractTags(note.content);
    nodeMap.set(note.path, {
      id: note.path,
      label: stemFromPath(note.path),
      path: note.path,
      inDegree: 0,
      outDegree: 0,
      tags,
    });
  }

  // Parse links
  for (const note of notes) {
    const bodyContent = stripFrontmatter(note.content);
    const links = extractWikilinks(bodyContent);

    for (const link of links) {
      const targetPath = stemIndex.get(link.toLowerCase());
      if (!targetPath || targetPath === note.path) {
        continue;
      }
      const edgeKey = `${note.path}→${targetPath}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({ source: note.path, target: targetPath });
        const sourceNode = nodeMap.get(note.path);
        const targetNode = nodeMap.get(targetPath);
        if (sourceNode) sourceNode.outDegree++;
        if (targetNode) targetNode.inDegree++;
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

function stemFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/, "");
}

function stripFrontmatter(content: string): string {
  return content.replace(FRONTMATTER_PATTERN, "");
}

function extractWikilinks(content: string): string[] {
  const links: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(WIKILINK_PATTERN.source, "g");
  while ((match = re.exec(content)) !== null) {
    if (match[1]) {
      links.push(match[1].trim());
    }
  }
  return links;
}

function extractTags(content: string): string[] {
  // Check frontmatter tags first
  const fmMatch = FRONTMATTER_PATTERN.exec(content);
  const fmTags: string[] = [];
  if (fmMatch?.[1]) {
    const tagLine = fmMatch[1].match(/^tags:\s*(.+)$/m)?.[1];
    if (tagLine) {
      fmTags.push(
        ...tagLine
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      );
    }
  }

  // Inline tags
  const inlineTags: string[] = [];
  const body = stripFrontmatter(content);
  let match: RegExpExecArray | null;
  const re = new RegExp(TAG_PATTERN.source, "g");
  while ((match = re.exec(body)) !== null) {
    if (match[1]) {
      inlineTags.push(match[1]);
    }
  }

  return [...new Set([...fmTags, ...inlineTags])];
}
