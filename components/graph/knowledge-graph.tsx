"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { VaultGraph } from "@/lib/vault/graph-builder";

// react-force-graph-2d uses canvas and window — must be client-only
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default ?? m),
  { ssr: false },
);

interface KnowledgeGraphProps {
  graph: VaultGraph;
  onNodeClick?: (path: string) => void;
  width?: number;
  height?: number;
}

interface GraphNodeDatum {
  id: string;
  label: string;
  inDegree: number;
  outDegree: number;
  tags: string[];
}

interface GraphLinkDatum {
  source: string;
  target: string;
}

export function KnowledgeGraph({
  graph,
  onNodeClick,
  width = 800,
  height = 600,
}: KnowledgeGraphProps) {
  const data = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        inDegree: n.inDegree,
        outDegree: n.outDegree,
        tags: n.tags,
      })) as GraphNodeDatum[],
      links: graph.edges.map((e) => ({
        source: e.source,
        target: e.target,
      })) as GraphLinkDatum[],
    }),
    [graph],
  );

  const nodeSize = (node: GraphNodeDatum) => Math.max(3, Math.sqrt((node.inDegree + 1) * 6));

  const nodeColor = (node: GraphNodeDatum): string => {
    if (node.tags.includes("project")) return "#818cf8"; // indigo
    if (node.tags.includes("session") || node.tags.includes("daily")) return "#34d399"; // emerald
    if (node.tags.includes("agent")) return "#fb923c"; // orange
    return "#71717a"; // zinc
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <ForceGraph2D
        graphData={data}
        width={width}
        height={height}
        backgroundColor="#09090b"
        nodeLabel={(node) => (node as GraphNodeDatum).label}
        nodeColor={(node) => nodeColor(node as GraphNodeDatum)}
        nodeVal={(node) => nodeSize(node as GraphNodeDatum)}
        linkColor={() => "#3f3f46"}
        linkWidth={0.5}
        onNodeClick={(node) => {
          if (onNodeClick) {
            onNodeClick((node as GraphNodeDatum).id);
          }
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNodeDatum & { x: number; y: number };
          const r = nodeSize(n);
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor(n);
          ctx.fill();

          // Show label when zoomed in
          if (globalScale > 1.8) {
            const label = n.label;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "#e4e4e7";
            ctx.textAlign = "center";
            ctx.fillText(label, n.x, n.y + r + fontSize + 1);
          }
        }}
      />
    </div>
  );
}
