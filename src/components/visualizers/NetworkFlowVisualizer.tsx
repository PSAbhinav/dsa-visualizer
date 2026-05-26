"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type NodeId = "S" | "A" | "B" | "C" | "D" | "T";

type FlowEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  capacity: number;
  flow: number;
};

type ResidualEdge = {
  id: string;
  baseId: string;
  from: NodeId;
  to: NodeId;
  capacity: number;
  direction: "forward" | "backward";
};

const NODES: { id: NodeId; x: number; y: number }[] = [
  { id: "S", x: 60, y: 150 },
  { id: "A", x: 200, y: 70 },
  { id: "B", x: 360, y: 70 },
  { id: "C", x: 200, y: 230 },
  { id: "D", x: 360, y: 230 },
  { id: "T", x: 520, y: 150 },
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: "S-A", from: "S", to: "A", capacity: 10, flow: 0 },
  { id: "S-C", from: "S", to: "C", capacity: 10, flow: 0 },
  { id: "A-B", from: "A", to: "B", capacity: 4, flow: 0 },
  { id: "A-C", from: "A", to: "C", capacity: 2, flow: 0 },
  { id: "A-D", from: "A", to: "D", capacity: 8, flow: 0 },
  { id: "C-D", from: "C", to: "D", capacity: 9, flow: 0 },
  { id: "D-B", from: "D", to: "B", capacity: 6, flow: 0 },
  { id: "B-T", from: "B", to: "T", capacity: 10, flow: 0 },
  { id: "D-T", from: "D", to: "T", capacity: 10, flow: 0 },
];

const NODE_MAP = NODES.reduce<Record<NodeId, { x: number; y: number }>>((accumulator, node) => {
  accumulator[node.id] = { x: node.x, y: node.y };
  return accumulator;
}, {} as Record<NodeId, { x: number; y: number }>);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getEdgeGeometry(from: NodeId, to: NodeId) {
  const start = NODE_MAP[from];
  const end = NODE_MAP[to];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;
  return {
    x1: start.x + unitX * 24,
    y1: start.y + unitY * 24,
    x2: end.x - unitX * 24,
    y2: end.y - unitY * 24,
    midX: (start.x + end.x) / 2,
    midY: (start.y + end.y) / 2,
  };
}

function buildResidualGraph(edges: FlowEdge[]) {
  const residual: ResidualEdge[] = [];
  for (const edge of edges) {
    const forward = edge.capacity - edge.flow;
    if (forward > 0) {
      residual.push({ id: `${edge.id}-f`, baseId: edge.id, from: edge.from, to: edge.to, capacity: forward, direction: "forward" });
    }
    if (edge.flow > 0) {
      residual.push({ id: `${edge.id}-b`, baseId: edge.id, from: edge.to, to: edge.from, capacity: edge.flow, direction: "backward" });
    }
  }
  return residual;
}

function bfsAugmentingPath(residual: ResidualEdge[]) {
  const queue: NodeId[] = ["S"];
  const visited = new Set<NodeId>(["S"]);
  const previous = new Map<NodeId, ResidualEdge>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current === "T") break;

    for (const edge of residual.filter((item) => item.from === current)) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      previous.set(edge.to, edge);
      queue.push(edge.to);
    }
  }

  if (!previous.has("T")) {
    return null;
  }

  const path: ResidualEdge[] = [];
  let current: NodeId = "T";
  while (current !== "S") {
    const edge = previous.get(current);
    if (!edge) break;
    path.unshift(edge);
    current = edge.from;
  }

  return {
    path,
    bottleneck: Math.min(...path.map((edge) => edge.capacity)),
  };
}

export function NetworkFlowVisualizer() {
  const [edges, setEdges] = useState<FlowEdge[]>(INITIAL_EDGES);
  const [residualEdges, setResidualEdges] = useState<ResidualEdge[]>(() => buildResidualGraph(INITIAL_EDGES));
  const [highlightedBaseEdges, setHighlightedBaseEdges] = useState<string[]>([]);
  const [highlightedResidualEdges, setHighlightedResidualEdges] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<NodeId[]>([]);
  const [maxFlow, setMaxFlow] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [status, setStatus] = useState("Use BFS on the residual graph to find an augmenting path from source to sink.");

  const reset = useCallback(() => {
    setEdges(INITIAL_EDGES);
    setHighlightedBaseEdges([]);
    setHighlightedResidualEdges([]);
    setHighlightedNodes([]);
    setIsAnimating(false);
    setStatus("Use BFS on the residual graph to find an augmenting path from source to sink.");
  }, []);

  useEffect(() => {
    setResidualEdges(buildResidualGraph(edges));
    setMaxFlow(edges.filter((edge) => edge.from === "S").reduce((sum, edge) => sum + edge.flow, 0));
  }, [edges]);

  const findAugmentingPath = useCallback(async () => {
    if (isAnimating) return;

    const residual = buildResidualGraph(edges);
    const result = bfsAugmentingPath(residual);
    if (!result) {
      setHighlightedBaseEdges([]);
      setHighlightedResidualEdges([]);
      setHighlightedNodes([]);
      setStatus(`No augmenting path remains. Current max flow is ${maxFlow}.`);
      return;
    }

    const pathNodes = ["S", ...result.path.map((edge) => edge.to)] as NodeId[];
    setIsAnimating(true);
    setHighlightedBaseEdges(result.path.map((edge) => edge.baseId));
    setHighlightedResidualEdges(result.path.map((edge) => edge.id));
    setHighlightedNodes(pathNodes);
    setStatus(`BFS found augmenting path ${pathNodes.join(" → ")} with bottleneck ${result.bottleneck}.`);
    await sleep(900);

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const step = result.path.find((item) => item.baseId === edge.id);
        if (!step) return edge;
        return {
          ...edge,
          flow: step.direction === "forward" ? edge.flow + result.bottleneck : edge.flow - result.bottleneck,
        };
      })
    );

    setStatus(`Augmented the path by ${result.bottleneck}. Residual capacities update for the next BFS.`);
    await sleep(550);
    setIsAnimating(false);
  }, [edges, isAnimating, maxFlow]);

  const renderGraph = (graphEdges: (FlowEdge | ResidualEdge)[], residual = false) => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-950/70 p-3">
      <div className="relative h-[300px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 580 300">
          <defs>
            <marker id={residual ? "residual-arrow" : "flow-arrow"} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L9,3 L0,6" className="fill-purple-300" />
            </marker>
          </defs>
          {graphEdges.map((edge) => {
            const geometry = getEdgeGeometry(edge.from, edge.to);
            const highlighted = residual
              ? highlightedResidualEdges.includes(edge.id)
              : highlightedBaseEdges.includes((edge as FlowEdge).id);
            return (
              <g key={edge.id}>
                <line
                  x1={geometry.x1}
                  y1={geometry.y1}
                  x2={geometry.x2}
                  y2={geometry.y2}
                  stroke={highlighted ? "rgba(34,211,238,0.95)" : "rgba(148,163,184,0.7)"}
                  strokeWidth={highlighted ? 4 : 2.5}
                  markerEnd={`url(#${residual ? "residual-arrow" : "flow-arrow"})`}
                />
                <foreignObject x={geometry.midX - 36} y={geometry.midY - 22} width="72" height="44">
                  <div className={`rounded-lg border px-2 py-1 text-center text-xs ${highlighted ? "border-cyan-400 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-gray-800/90 text-gray-200"}`}>
                    {residual ? `r=${(edge as ResidualEdge).capacity}` : `${(edge as FlowEdge).flow}/${(edge as FlowEdge).capacity}`}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {NODES.map((node) => (
          <motion.div
            key={`${residual ? "r" : "f"}-${node.id}`}
            animate={{ scale: highlightedNodes.includes(node.id) ? 1.08 : 1 }}
            className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-semibold ${
              highlightedNodes.includes(node.id)
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                : node.id === "S" || node.id === "T"
                ? "border-purple-400 bg-purple-500/20 text-purple-100"
                : "border-white/10 bg-gray-800/95 text-white"
            }`}
            style={{ left: node.x, top: node.y }}
          >
            {node.id}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-white backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Network Flow / Ford-Fulkerson</h3>
          <p className="mt-1 text-sm text-gray-400">Each click runs BFS in the residual graph, highlights the augmenting path, then pushes more flow.</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={findAugmentingPath} disabled={isAnimating} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50">{isAnimating ? "Searching..." : "Find Augmenting Path"}</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={reset} className="rounded-lg bg-gray-700 px-4 py-2 text-sm">Reset</motion.button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-white/10 bg-gray-800/70 p-4 text-sm text-gray-300">{status}</div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">Max Flow: {maxFlow}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium text-purple-200">Flow network</div>
          {renderGraph(edges)}
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-cyan-200">Residual graph</div>
          {renderGraph(residualEdges, true)}
        </div>
      </div>
    </motion.div>
  );
}
