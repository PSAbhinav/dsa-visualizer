"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { InteractiveCanvas, type CanvasDragPayload } from "./InteractiveCanvas";

type NodeId = "A" | "B" | "C" | "D" | "E" | "F";

interface GraphNode {
  id: NodeId;
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  from: NodeId;
  to: NodeId;
}

const GRAPH_WIDTH = 760;
const GRAPH_HEIGHT = 440;
const GRAPH_PADDING = 70;
const NODE_RADIUS = 28;
const GRAPH_NODE_IDS: readonly NodeId[] = ["A", "B", "C", "D", "E", "F"];
const GRAPH_EDGES: GraphEdge[] = [
  { id: "A-B", from: "A", to: "B" },
  { id: "A-C", from: "A", to: "C" },
  { id: "A-F", from: "A", to: "F" },
  { id: "B-D", from: "B", to: "D" },
  { id: "C-E", from: "C", to: "E" },
  { id: "C-F", from: "C", to: "F" },
  { id: "D-E", from: "D", to: "E" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createForceDirectedLayout(): GraphNode[] {
  const centerX = GRAPH_WIDTH / 2;
  const centerY = GRAPH_HEIGHT / 2;
  let nodes = GRAPH_NODE_IDS.map((id, index) => {
    const angle = (Math.PI * 2 * index) / GRAPH_NODE_IDS.length;
    return {
      id,
      x: centerX + Math.cos(angle) * 170,
      y: centerY + Math.sin(angle) * 140,
    };
  });

  const indexMap = new Map<NodeId, number>(nodes.map((node, index) => [node.id, index]));

  for (let iteration = 0; iteration < 180; iteration += 1) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }));

    for (let left = 0; left < nodes.length; left += 1) {
      for (let right = left + 1; right < nodes.length; right += 1) {
        const dx = nodes[right].x - nodes[left].x;
        const dy = nodes[right].y - nodes[left].y;
        const distance = Math.hypot(dx, dy) || 1;
        const repulsion = 24000 / (distance * distance);
        const unitX = dx / distance;
        const unitY = dy / distance;

        forces[left].x -= unitX * repulsion;
        forces[left].y -= unitY * repulsion;
        forces[right].x += unitX * repulsion;
        forces[right].y += unitY * repulsion;
      }
    }

    for (const edge of GRAPH_EDGES) {
      const fromIndex = indexMap.get(edge.from);
      const toIndex = indexMap.get(edge.to);
      if (fromIndex === undefined || toIndex === undefined) {
        continue;
      }

      const fromNode = nodes[fromIndex];
      const toNode = nodes[toIndex];
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.hypot(dx, dy) || 1;
      const spring = (distance - 190) * 0.08;
      const unitX = dx / distance;
      const unitY = dy / distance;

      forces[fromIndex].x += unitX * spring;
      forces[fromIndex].y += unitY * spring;
      forces[toIndex].x -= unitX * spring;
      forces[toIndex].y -= unitY * spring;
    }

    nodes = nodes.map((node, index) => ({
      ...node,
      x: clamp(node.x + clamp(forces[index].x + (centerX - node.x) * 0.015, -16, 16), GRAPH_PADDING, GRAPH_WIDTH - GRAPH_PADDING),
      y: clamp(node.y + clamp(forces[index].y + (centerY - node.y) * 0.015, -16, 16), GRAPH_PADDING, GRAPH_HEIGHT - GRAPH_PADDING),
    }));
  }

  return nodes;
}

function getEdgeGeometry(from: GraphNode, to: GraphNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;

  return {
    x1: from.x + unitX * NODE_RADIUS,
    y1: from.y + unitY * NODE_RADIUS,
    x2: to.x - unitX * NODE_RADIUS,
    y2: to.y - unitY * NODE_RADIUS,
  };
}

export function GraphVisualizer() {
  const [nodes, setNodes] = useState<GraphNode[]>(() => createForceDirectedLayout());
  const [visitedNodes, setVisitedNodes] = useState<Set<NodeId>>(new Set());
  const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<NodeId[]>([]);
  const [algorithm, setAlgorithm] = useState<"bfs" | "dfs">("bfs");

  const nodeMap = useMemo(
    () =>
      nodes.reduce<Record<NodeId, GraphNode>>((accumulator, node) => {
        accumulator[node.id] = node;
        return accumulator;
      }, {} as Record<NodeId, GraphNode>),
    [nodes]
  );

  const getNeighbors = useCallback(
    (nodeId: NodeId) => GRAPH_EDGES.filter((edge) => edge.from === nodeId).map((edge) => edge.to),
    []
  );

  const handleNodeDrag = useCallback(({ dx, dy }: CanvasDragPayload, nodeId: string) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              x: clamp(node.x + dx, GRAPH_PADDING, GRAPH_WIDTH - GRAPH_PADDING),
              y: clamp(node.y + dy, GRAPH_PADDING, GRAPH_HEIGHT - GRAPH_PADDING),
            }
          : node
      )
    );
  }, []);

  const runBFS = useCallback(async () => {
    setIsAnimating(true);
    setVisitedNodes(new Set());
    setVisitedEdges(new Set());
    setTraversalOrder([]);

    const visited = new Set<NodeId>(["A"]);
    const queue: NodeId[] = ["A"];
    const order: NodeId[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      order.push(current);
      setVisitedNodes(new Set(order));
      setTraversalOrder([...order]);
      await sleep(650);

      for (const edge of GRAPH_EDGES.filter((candidate) => candidate.from === current)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push(edge.to);
          setVisitedEdges((currentEdges) => new Set([...currentEdges, edge.id]));
          await sleep(260);
        }
      }
    }

    setIsAnimating(false);
  }, []);

  const runDFS = useCallback(async () => {
    setIsAnimating(true);
    setVisitedNodes(new Set());
    setVisitedEdges(new Set());
    setTraversalOrder([]);

    const visited = new Set<NodeId>();
    const order: NodeId[] = [];

    const dfs = async (nodeId: NodeId) => {
      visited.add(nodeId);
      order.push(nodeId);
      setVisitedNodes(new Set(order));
      setTraversalOrder([...order]);
      await sleep(650);

      for (const neighbor of getNeighbors(nodeId)) {
        if (!visited.has(neighbor)) {
          setVisitedEdges((currentEdges) => new Set([...currentEdges, `${nodeId}-${neighbor}`]));
          await sleep(260);
          await dfs(neighbor);
        }
      }
    };

    await dfs("A");
    setIsAnimating(false);
  }, [getNeighbors]);

  const runAlgorithm = () => {
    void (algorithm === "bfs" ? runBFS() : runDFS());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Graph Traversal</h3>
          <p className="mt-1 text-sm text-gray-400">Zoom, pan, or drag nodes while the traversal animation continues to run.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as "bfs" | "dfs")}
            className="rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white"
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={runAlgorithm}
            disabled={isAnimating}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAnimating ? "Running..." : `Run ${algorithm.toUpperCase()}`}
          </motion.button>
        </div>
      </div>

      {traversalOrder.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3"
        >
          <span className="font-mono text-sm text-purple-200">
            {algorithm.toUpperCase()}: {traversalOrder.join(" → ")}
          </span>
        </motion.div>
      )}

      <InteractiveCanvas
        canvasClassName="h-[420px]"
        onNodeDrag={(nodeId, payload) => handleNodeDrag(payload, nodeId)}
      >
        {() => (
          <div className="relative h-[440px] w-[760px]">
            <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="h-full w-full">
              <defs>
                <marker
                  id="graph-visualizer-arrow"
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="6"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,12 L12,6 z" fill="context-stroke" />
                </marker>
              </defs>

              {GRAPH_EDGES.map((edge, index) => {
                const geometry = getEdgeGeometry(nodeMap[edge.from], nodeMap[edge.to]);
                const isVisited = visitedEdges.has(edge.id);
                return (
                  <motion.line
                    key={edge.id}
                    x1={geometry.x1}
                    y1={geometry.y1}
                    x2={geometry.x2}
                    y2={geometry.y2}
                    stroke={isVisited ? "#a855f7" : "rgba(148,163,184,0.55)"}
                    strokeWidth={isVisited ? 3.4 : 2.2}
                    markerEnd="url(#graph-visualizer-arrow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  />
                );
              })}

              {nodes.map((node) => {
                const isVisited = visitedNodes.has(node.id);
                return (
                  <motion.g
                    key={node.id}
                    data-draggable
                    data-node-id={node.id}
                    style={{ cursor: "grab", transformOrigin: `${node.x}px ${node.y}px` }}
                    animate={{ scale: isVisited ? [1, 1.08, 1] : 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS}
                      fill={isVisited ? "rgba(168,85,247,0.38)" : "rgba(17,24,39,0.92)"}
                      stroke={isVisited ? "#c084fc" : "rgba(255,255,255,0.2)"}
                      strokeWidth={2.6}
                    />
                    <text
                      x={node.x}
                      y={node.y + 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="700"
                    >
                      {node.id}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>
        )}
      </InteractiveCanvas>
    </motion.div>
  );
}
