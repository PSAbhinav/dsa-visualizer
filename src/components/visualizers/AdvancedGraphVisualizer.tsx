"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { InteractiveCanvas, type CanvasDragPayload } from "./InteractiveCanvas";

type TabKey = "kruskal" | "topological";
type NodeId = "A" | "B" | "C" | "D" | "E" | "F";

type GraphNode = {
  id: NodeId;
  x: number;
  y: number;
};

type WeightedEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  weight: number;
};

type DirectedEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

const NODE_RADIUS = 28;
const NODE_CLASS =
  "absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 text-base font-bold text-white shadow-lg";
const KRUSKAL_VIEW = { width: 760, height: 420 };
const TOPO_VIEW = { width: 760, height: 420 };

const KRUSKAL_NODES: GraphNode[] = [
  { id: "A", x: 110, y: 110 },
  { id: "B", x: 280, y: 78 },
  { id: "C", x: 210, y: 270 },
  { id: "D", x: 470, y: 235 },
  { id: "E", x: 650, y: 112 },
  { id: "F", x: 625, y: 330 },
];

const KRUSKAL_EDGES: WeightedEdge[] = [
  { id: "A-C", from: "A", to: "C", weight: 1 },
  { id: "A-B", from: "A", to: "B", weight: 2 },
  { id: "B-C", from: "B", to: "C", weight: 3 },
  { id: "E-F", from: "E", to: "F", weight: 4 },
  { id: "D-F", from: "D", to: "F", weight: 5 },
  { id: "C-D", from: "C", to: "D", weight: 6 },
  { id: "C-E", from: "C", to: "E", weight: 7 },
  { id: "B-D", from: "B", to: "D", weight: 8 },
  { id: "D-E", from: "D", to: "E", weight: 9 },
];

const TOPO_NODES: GraphNode[] = [
  { id: "A", x: 110, y: 210 },
  { id: "B", x: 290, y: 102 },
  { id: "C", x: 290, y: 318 },
  { id: "D", x: 470, y: 210 },
  { id: "E", x: 650, y: 102 },
  { id: "F", x: 650, y: 318 },
];

const TOPO_EDGES: DirectedEdge[] = [
  { id: "A-B", from: "A", to: "B" },
  { id: "A-C", from: "A", to: "C" },
  { id: "B-D", from: "B", to: "D" },
  { id: "C-D", from: "C", to: "D" },
  { id: "D-E", from: "D", to: "E" },
  { id: "B-E", from: "B", to: "E" },
  { id: "C-F", from: "C", to: "F" },
  { id: "E-F", from: "E", to: "F" },
];

const KRUSKAL_SORTED_EDGES = [...KRUSKAL_EDGES].sort((a, b) => a.weight - b.weight);

const TOPO_INITIAL_IN_DEGREE = TOPO_NODES.reduce<Record<NodeId, number>>((acc, node) => {
  acc[node.id] = 0;
  return acc;
}, {} as Record<NodeId, number>);

for (const edge of TOPO_EDGES) {
  TOPO_INITIAL_IN_DEGREE[edge.to] += 1;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildNodeMap(nodes: GraphNode[]) {
  return nodes.reduce<Record<NodeId, GraphNode>>((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<NodeId, GraphNode>);
}

function createParentMap(nodes: GraphNode[]) {
  return nodes.reduce<Record<string, string>>((acc, node) => {
    acc[node.id] = node.id;
    return acc;
  }, {});
}

function createRankMap(nodes: GraphNode[]) {
  return nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.id] = 0;
    return acc;
  }, {});
}

function findRoot(parents: Record<string, string>, nodeId: string) {
  let current = nodeId;

  while (parents[current] !== current) {
    current = parents[current];
  }

  let walker = nodeId;
  while (parents[walker] !== walker) {
    const next = parents[walker];
    parents[walker] = current;
    walker = next;
  }

  return current;
}

function unionNodes(
  parents: Record<string, string>,
  ranks: Record<string, number>,
  from: string,
  to: string
) {
  const rootFrom = findRoot(parents, from);
  const rootTo = findRoot(parents, to);

  if (rootFrom === rootTo) {
    return false;
  }

  if (ranks[rootFrom] < ranks[rootTo]) {
    parents[rootFrom] = rootTo;
  } else if (ranks[rootFrom] > ranks[rootTo]) {
    parents[rootTo] = rootFrom;
  } else {
    parents[rootTo] = rootFrom;
    ranks[rootFrom] += 1;
  }

  return true;
}

function getUnionSets(nodes: GraphNode[], parents: Record<string, string>) {
  const snapshot = { ...parents };
  const groups = nodes.reduce<Record<string, string[]>>((acc, node) => {
    const root = findRoot(snapshot, node.id);
    acc[root] = [...(acc[root] ?? []), node.id];
    return acc;
  }, {});

  return Object.values(groups)
    .map((group) => group.sort())
    .sort((left, right) => left[0].localeCompare(right[0]));
}

function getLineGeometry(from: GraphNode, to: GraphNode, offset = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;

  const x1 = from.x + unitX * NODE_RADIUS;
  const y1 = from.y + unitY * NODE_RADIUS;
  const x2 = to.x - unitX * NODE_RADIUS;
  const y2 = to.y - unitY * NODE_RADIUS;
  const midX = (x1 + x2) / 2 - unitY * offset;
  const midY = (y1 + y2) / 2 + unitX * offset;

  return { x1, y1, x2, y2, midX, midY };
}

export function AdvancedGraphVisualizer() {
  const [activeTab, setActiveTab] = useState<TabKey>("kruskal");
  const [kruskalNodes, setKruskalNodes] = useState<GraphNode[]>(() => KRUSKAL_NODES);
  const [topoNodes, setTopoNodes] = useState<GraphNode[]>(() => TOPO_NODES);

  const [kruskalCurrentEdge, setKruskalCurrentEdge] = useState<string | null>(null);
  const [kruskalDecision, setKruskalDecision] = useState<"checking" | "accepted" | "rejected" | null>(null);
  const [kruskalMstEdges, setKruskalMstEdges] = useState<string[]>([]);
  const [kruskalRejectedEdges, setKruskalRejectedEdges] = useState<string[]>([]);
  const [kruskalParents, setKruskalParents] = useState<Record<string, string>>(() => createParentMap(KRUSKAL_NODES));
  const [kruskalCurrentIndex, setKruskalCurrentIndex] = useState(-1);
  const [kruskalTotalWeight, setKruskalTotalWeight] = useState(0);
  const [kruskalMessage, setKruskalMessage] = useState(
    "Sort edges by weight, then add each one unless it creates a cycle."
  );
  const [kruskalIsRunning, setKruskalIsRunning] = useState(false);

  const [topoInDegree, setTopoInDegree] = useState<Record<NodeId, number>>({ ...TOPO_INITIAL_IN_DEGREE });
  const [topoReady, setTopoReady] = useState<NodeId[]>(["A"]);
  const [topoProcessing, setTopoProcessing] = useState<NodeId | null>(null);
  const [topoDone, setTopoDone] = useState<NodeId[]>([]);
  const [topoRemovedEdges, setTopoRemovedEdges] = useState<string[]>([]);
  const [topoMessage, setTopoMessage] = useState(
    "Kahn's algorithm repeatedly removes courses whose in-degree is 0."
  );
  const [topoIsRunning, setTopoIsRunning] = useState(false);

  const kruskalNodeMap = useMemo(() => buildNodeMap(kruskalNodes), [kruskalNodes]);
  const topoNodeMap = useMemo(() => buildNodeMap(topoNodes), [topoNodes]);
  const isAnyRunning = kruskalIsRunning || topoIsRunning;

  const handleKruskalNodeDrag = useCallback((nodeId: string, { dx, dy }: CanvasDragPayload) => {
    setKruskalNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              x: clamp(node.x + dx, NODE_RADIUS + 20, KRUSKAL_VIEW.width - NODE_RADIUS - 20),
              y: clamp(node.y + dy, NODE_RADIUS + 20, KRUSKAL_VIEW.height - NODE_RADIUS - 20),
            }
          : node
      )
    );
  }, []);

  const handleTopoNodeDrag = useCallback((nodeId: string, { dx, dy }: CanvasDragPayload) => {
    setTopoNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              x: clamp(node.x + dx, NODE_RADIUS + 20, TOPO_VIEW.width - NODE_RADIUS - 20),
              y: clamp(node.y + dy, NODE_RADIUS + 20, TOPO_VIEW.height - NODE_RADIUS - 20),
            }
          : node
      )
    );
  }, []);

  const resetKruskal = () => {
    setKruskalCurrentEdge(null);
    setKruskalDecision(null);
    setKruskalMstEdges([]);
    setKruskalRejectedEdges([]);
    setKruskalParents(createParentMap(KRUSKAL_NODES));
    setKruskalCurrentIndex(-1);
    setKruskalTotalWeight(0);
    setKruskalMessage("Sort edges by weight, then add each one unless it creates a cycle.");
  };

  const runKruskal = async () => {
    if (isAnyRunning) {
      return;
    }

    resetKruskal();
    setKruskalIsRunning(true);

    let parents = createParentMap(KRUSKAL_NODES);
    const ranks = createRankMap(KRUSKAL_NODES);
    const mstEdges: string[] = [];
    const rejectedEdges: string[] = [];
    let totalWeight = 0;

    for (let index = 0; index < KRUSKAL_SORTED_EDGES.length; index += 1) {
      const edge = KRUSKAL_SORTED_EDGES[index];
      setKruskalCurrentIndex(index);
      setKruskalCurrentEdge(edge.id);
      setKruskalDecision("checking");
      setKruskalMessage(`Checking ${edge.from}-${edge.to} (weight ${edge.weight}) against the current forest.`);
      await sleep(850);

      const nextParents = { ...parents };
      const canUseEdge = unionNodes(nextParents, ranks, edge.from, edge.to);

      if (canUseEdge) {
        parents = nextParents;
        totalWeight += edge.weight;
        mstEdges.push(edge.id);
        setKruskalParents({ ...nextParents });
        setKruskalMstEdges([...mstEdges]);
        setKruskalTotalWeight(totalWeight);
        setKruskalDecision("accepted");
        setKruskalMessage(`Accepted ${edge.from}-${edge.to}; it connects two different sets.`);
      } else {
        rejectedEdges.push(edge.id);
        setKruskalRejectedEdges([...rejectedEdges]);
        setKruskalDecision("rejected");
        setKruskalMessage(`Rejected ${edge.from}-${edge.to}; it would close a cycle.`);
      }

      await sleep(1000);

      if (mstEdges.length === KRUSKAL_NODES.length - 1) {
        break;
      }
    }

    setKruskalCurrentEdge(null);
    setKruskalDecision(null);
    setKruskalCurrentIndex(-1);
    setKruskalMessage(`MST complete with total weight ${totalWeight}.`);
    setKruskalIsRunning(false);
  };

  const resetTopological = () => {
    setTopoInDegree({ ...TOPO_INITIAL_IN_DEGREE });
    setTopoReady(["A"]);
    setTopoProcessing(null);
    setTopoDone([]);
    setTopoRemovedEdges([]);
    setTopoMessage("Kahn's algorithm repeatedly removes courses whose in-degree is 0.");
  };

  const runTopologicalSort = async () => {
    if (isAnyRunning) {
      return;
    }

    resetTopological();
    setTopoIsRunning(true);

    const inDegree = { ...TOPO_INITIAL_IN_DEGREE };
    const removedEdges: string[] = [];
    const result: NodeId[] = [];
    const processed = new Set<NodeId>();
    const queue = TOPO_NODES.map((node) => node.id).filter((id) => inDegree[id] === 0);

    setTopoReady([...queue]);
    await sleep(700);

    while (queue.length > 0) {
      queue.sort();
      setTopoReady([...queue]);
      setTopoMessage(`Ready courses: ${queue.join(", ")}. Pick the next node with in-degree 0.`);
      await sleep(650);

      const current = queue.shift() as NodeId;
      setTopoReady([...queue]);
      setTopoProcessing(current);
      setTopoMessage(`${current} has in-degree 0, so it is appended to the result.`);
      await sleep(750);

      result.push(current);
      processed.add(current);
      setTopoDone([...result]);

      const outgoingEdges = TOPO_EDGES.filter((edge) => edge.from === current);
      for (const edge of outgoingEdges) {
        removedEdges.push(edge.id);
        inDegree[edge.to] -= 1;
        setTopoRemovedEdges([...removedEdges]);
        setTopoInDegree({ ...inDegree });
        setTopoMessage(`Removing ${edge.from}→${edge.to} drops ${edge.to}'s in-degree to ${inDegree[edge.to]}.`);
        await sleep(650);

        if (inDegree[edge.to] === 0 && !processed.has(edge.to) && !queue.includes(edge.to)) {
          queue.push(edge.to);
          queue.sort();
          setTopoReady([...queue]);
          await sleep(350);
        }
      }

      setTopoProcessing(null);
      await sleep(300);
    }

    setTopoReady([]);
    setTopoMessage(`Topological order complete: ${result.join(" → ")}.`);
    setTopoIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Advanced Graph Algorithms</h3>
          <p className="mt-1 text-sm text-gray-400">
            Watch Kruskal&apos;s MST and Kahn&apos;s topological sort unfold step by step.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1">
          {[
            { key: "kruskal" as const, label: "Kruskal's MST" },
            { key: "topological" as const, label: "Topological Sort" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: isAnyRunning ? 1 : 1.02 }}
                whileTap={{ scale: isAnyRunning ? 1 : 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                disabled={isAnyRunning}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {activeTab === "kruskal" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-medium text-white">Kruskal&apos;s Minimum Spanning Tree</h4>
                <p className="mt-1 text-sm text-gray-400">Pick the lightest remaining edge and skip any cycle.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
                  Total MST weight: <span className="font-semibold text-white">{kruskalTotalWeight}</span>
                </div>
                <motion.button
                  whileHover={{ scale: kruskalIsRunning ? 1 : 1.04 }}
                  whileTap={{ scale: kruskalIsRunning ? 1 : 0.96 }}
                  onClick={() => void runKruskal()}
                  disabled={kruskalIsRunning}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {kruskalIsRunning ? "Finding..." : "Find MST"}
                </motion.button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">{kruskalMessage}</div>

            <InteractiveCanvas canvasClassName="h-[390px]" onNodeDrag={handleKruskalNodeDrag}>
              {() => (
                <div className="relative h-[420px] w-[760px]">
                  <svg
                    width={KRUSKAL_VIEW.width}
                    height={KRUSKAL_VIEW.height}
                    viewBox={`0 0 ${KRUSKAL_VIEW.width} ${KRUSKAL_VIEW.height}`}
                    className="absolute inset-0 h-full w-full"
                  >
                    {KRUSKAL_EDGES.map((edge) => {
                      const geometry = getLineGeometry(kruskalNodeMap[edge.from], kruskalNodeMap[edge.to], 24);
                      const isCurrent = kruskalCurrentEdge === edge.id;
                      const isMst = kruskalMstEdges.includes(edge.id);
                      const isRejected = kruskalRejectedEdges.includes(edge.id);

                      let stroke = "rgba(148,163,184,0.6)";
                      let strokeWidth = 2.4;
                      let dashArray: string | undefined;

                      if (isCurrent && kruskalDecision === "checking") {
                        stroke = "#60a5fa";
                        strokeWidth = 3.6;
                      } else if (isMst) {
                        stroke = "#4ade80";
                        strokeWidth = 3.8;
                      } else if (isRejected) {
                        stroke = "#f87171";
                        strokeWidth = 2.8;
                        dashArray = "6,6";
                      }

                      return (
                        <g key={edge.id}>
                          <motion.line
                            x1={geometry.x1}
                            y1={geometry.y1}
                            x2={geometry.x2}
                            y2={geometry.y2}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: isRejected ? [0.95, 0.4, 0.95] : 1 }}
                            transition={{ duration: isRejected ? 0.45 : 0.4 }}
                          />
                          <g>
                            <rect
                              x={geometry.midX - 14}
                              y={geometry.midY - 12}
                              width="28"
                              height="24"
                              rx="12"
                              fill="rgba(17,24,39,0.96)"
                              stroke="rgba(255,255,255,0.12)"
                            />
                            <text
                              x={geometry.midX}
                              y={geometry.midY + 4}
                              textAnchor="middle"
                              fill="#e5e7eb"
                              fontSize="12"
                              fontWeight="700"
                            >
                              {edge.weight}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>

                  {kruskalNodes.map((node) => {
                    const inMst = kruskalMstEdges.some((edgeId) => edgeId.includes(node.id));
                    const isProcessing = kruskalCurrentEdge?.includes(node.id) && kruskalDecision === "checking";
                    return (
                      <motion.div
                        key={node.id}
                        data-draggable
                        data-node-id={node.id}
                        className={`${NODE_CLASS} ${
                          inMst
                            ? "border-green-400 bg-green-500/20"
                            : isProcessing
                              ? "border-blue-400 bg-blue-500/20"
                              : "border-purple-400/60 bg-gray-800/95"
                        }`}
                        style={{ left: node.x, top: node.y }}
                        animate={{ scale: isProcessing ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.45 }}
                      >
                        {node.id}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </InteractiveCanvas>

            <div>
              <div className="mb-3 text-sm font-medium text-white">Union-Find sets</div>
              <div className="flex flex-wrap gap-3">
                {getUnionSets(KRUSKAL_NODES, kruskalParents).map((group) => (
                  <motion.div
                    key={group.join("-")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200"
                  >
                    {`{ ${group.join(", ")} }`}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="font-medium text-white">Sorted edge list</h5>
              <span className="text-xs text-gray-400">Weight order</span>
            </div>
            <div className="space-y-2">
              {KRUSKAL_SORTED_EDGES.map((edge, index) => {
                const isCurrent = kruskalCurrentEdge === edge.id;
                const isAccepted = kruskalMstEdges.includes(edge.id);
                const isRejected = kruskalRejectedEdges.includes(edge.id);

                return (
                  <motion.div
                    key={edge.id}
                    animate={{
                      borderColor: isAccepted
                        ? "rgba(74, 222, 128, 0.45)"
                        : isRejected
                          ? "rgba(248, 113, 113, 0.45)"
                          : isCurrent
                            ? "rgba(96, 165, 250, 0.55)"
                            : "rgba(255,255,255,0.08)",
                    }}
                    className="rounded-xl border bg-gray-900/80 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-mono text-white">
                        {edge.from} — {edge.to}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-300">w = {edge.weight}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {isAccepted
                        ? "Added to MST"
                        : isRejected
                          ? "Rejected: cycle detected"
                          : isCurrent
                            ? "Currently being checked"
                            : index < kruskalCurrentIndex
                              ? "Skipped after MST completed"
                              : "Waiting"}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-medium text-white">Topological Sort with Kahn&apos;s Algorithm</h4>
                <p className="mt-1 text-sm text-gray-400">Process the DAG by repeatedly removing zero in-degree nodes.</p>
              </div>

              <motion.button
                whileHover={{ scale: topoIsRunning ? 1 : 1.04 }}
                whileTap={{ scale: topoIsRunning ? 1 : 0.96 }}
                onClick={() => void runTopologicalSort()}
                disabled={topoIsRunning}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {topoIsRunning ? "Sorting..." : "Sort"}
              </motion.button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">{topoMessage}</div>

            <InteractiveCanvas canvasClassName="h-[390px]" onNodeDrag={handleTopoNodeDrag}>
              {() => (
                <div className="relative h-[420px] w-[760px]">
                  <svg
                    width={TOPO_VIEW.width}
                    height={TOPO_VIEW.height}
                    viewBox={`0 0 ${TOPO_VIEW.width} ${TOPO_VIEW.height}`}
                    className="absolute inset-0 h-full w-full"
                  >
                    <defs>
                      <marker
                        id="advanced-topo-arrow"
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

                    {TOPO_EDGES.map((edge) => {
                      const geometry = getLineGeometry(topoNodeMap[edge.from], topoNodeMap[edge.to], 0);
                      const isRemoved = topoRemovedEdges.includes(edge.id);
                      const isActive = topoProcessing === edge.from && !isRemoved;

                      return (
                        <motion.line
                          key={edge.id}
                          x1={geometry.x1}
                          y1={geometry.y1}
                          x2={geometry.x2}
                          y2={geometry.y2}
                          markerEnd="url(#advanced-topo-arrow)"
                          stroke={isActive ? "#60a5fa" : "rgba(156,163,175,0.9)"}
                          strokeWidth={isActive ? 3.2 : 2.4}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: 1,
                            opacity: isRemoved ? 0.18 : 1,
                          }}
                          transition={{ duration: 0.45 }}
                        />
                      );
                    })}
                  </svg>

                  {topoNodes.map((node) => {
                    const isDone = topoDone.includes(node.id);
                    const isProcessing = topoProcessing === node.id;
                    const isReady = topoReady.includes(node.id) && !isDone;
                    return (
                      <motion.div
                        key={node.id}
                        data-draggable
                        data-node-id={node.id}
                        className={`${NODE_CLASS} ${
                          isDone
                            ? "border-green-400 bg-green-500/20"
                            : isProcessing || isReady
                              ? "border-blue-400 bg-blue-500/20"
                              : "border-purple-400/60 bg-gray-800/95"
                        }`}
                        style={{ left: node.x, top: node.y }}
                        animate={{ scale: isProcessing || isReady ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {node.id}
                        <span className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-black/90 px-1.5 py-0.5 text-[11px] text-gray-200">
                          {topoInDegree[node.id]}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </InteractiveCanvas>

            <div>
              <div className="mb-3 text-sm font-medium text-white">Result order</div>
              <div className="flex min-h-16 flex-wrap gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                {topoDone.length === 0 ? (
                  <span className="text-sm text-gray-500">The sorted order will build here.</span>
                ) : (
                  topoDone.map((node, index) => (
                    <motion.div
                      key={`${node}-${index}`}
                      initial={{ opacity: 0, y: -24, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/20 font-bold text-white"
                    >
                      {node}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <h5 className="font-medium text-white">In-degree tracker</h5>
              <p className="mt-1 text-xs text-gray-400">Blue nodes are ready to process because their in-degree is 0.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TOPO_NODES.map((node) => {
                const isReady = topoReady.includes(node.id) && !topoDone.includes(node.id);
                const isDone = topoDone.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border px-3 py-3 text-sm ${
                      isDone
                        ? "border-green-500/30 bg-green-500/10 text-green-200"
                        : isReady
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                          : "border-white/10 bg-gray-900/70 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Course {node.id}</span>
                      <span className="font-mono">{topoInDegree[node.id]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">Ready queue</div>
              <div className="flex min-h-14 flex-wrap gap-2 rounded-xl border border-white/10 bg-gray-900/70 p-3">
                {topoReady.length === 0 ? (
                  <span className="text-sm text-gray-500">Queue is empty.</span>
                ) : (
                  topoReady.map((node) => (
                    <motion.div
                      key={node}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm text-blue-200"
                    >
                      {node}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
