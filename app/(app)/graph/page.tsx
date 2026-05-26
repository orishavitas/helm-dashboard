"use client";

import dynamic from "next/dynamic";
import { Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { VaultGraph } from "@/lib/vault/graph-builder";

// KnowledgeGraph already does dynamic import internally, but we still
// guard the whole page as client-only since it uses window size.
const KnowledgeGraph = dynamic(
  () => import("@/components/graph/knowledge-graph").then((m) => m.KnowledgeGraph),
  { ssr: false },
);

export default function GraphPage() {
  const [graph, setGraph] = useState<VaultGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const router = useRouter();

  // Load graph data
  useEffect(() => {
    void fetch("/api/vault/graph")
      .then((r) => r.json() as Promise<VaultGraph & { error?: string }>)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setGraph(data);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load graph");
        setLoading(false);
      });
  }, []);

  // Responsive canvas dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (path: string) => {
      router.push(`/vault?note=${encodeURIComponent(path)}`);
    },
    [router],
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <Share2 className="h-4 w-4 text-indigo-400" />
          Knowledge Graph
        </div>
        {graph && (
          <span className="text-xs text-zinc-500">
            {graph.nodes.length} notes · {graph.edges.length} links
          </span>
        )}
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="min-h-0 flex-1">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Building graph…
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-sm text-red-400">
            {error}
          </div>
        )}
        {graph && !loading && (
          <KnowledgeGraph
            graph={graph}
            width={dimensions.width}
            height={dimensions.height}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
    </div>
  );
}
