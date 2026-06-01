"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { InteractiveCanvas, type CanvasDragPayload } from "./InteractiveCanvas";
import { VisualizationStepPanel, type StepTone, type VisualizationStep } from "./VisualizationStepPanel";

type TreeNode = {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
};

type PositionedTreeNode = {
  value: number;
  x: number;
  y: number;
  left?: PositionedTreeNode;
  right?: PositionedTreeNode;
};

type TreeEdge = {
  from: PositionedTreeNode;
  to: PositionedTreeNode;
};

const TREE_WIDTH = 920;
const TREE_HEIGHT = 520;
const TREE_SIDE_PADDING = 80;
const TREE_TOP_PADDING = 70;
const TREE_LEVEL_GAP = 110;
const NODE_RADIUS = 28;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function insertBST(root: TreeNode | undefined, value: number): TreeNode {
  if (!root) {
    return { value };
  }

  if (value < root.value) {
    return { ...root, left: insertBST(root.left, value) };
  }

  return { ...root, right: insertBST(root.right, value) };
}

function layoutTree(node: TreeNode | undefined, left: number, right: number, depth: number): PositionedTreeNode | undefined {
  if (!node) {
    return undefined;
  }

  const midpoint = (left + right) / 2;
  const inset = Math.max((right - left) * 0.08, 34);

  return {
    value: node.value,
    x: midpoint,
    y: TREE_TOP_PADDING + depth * TREE_LEVEL_GAP,
    left: layoutTree(node.left, left, midpoint - inset, depth + 1),
    right: layoutTree(node.right, midpoint + inset, right, depth + 1),
  };
}

function applyPositionOverrides(
  node: PositionedTreeNode | undefined,
  overrides: Record<string, { x: number; y: number }>
): PositionedTreeNode | undefined {
  if (!node) {
    return undefined;
  }

  const key = String(node.value);
  const override = overrides[key];

  return {
    value: node.value,
    x: override?.x ?? node.x,
    y: override?.y ?? node.y,
    left: applyPositionOverrides(node.left, overrides),
    right: applyPositionOverrides(node.right, overrides),
  };
}

function flattenTree(node: PositionedTreeNode | undefined): PositionedTreeNode[] {
  if (!node) {
    return [];
  }

  return [node, ...flattenTree(node.left), ...flattenTree(node.right)];
}

function getEdges(node: PositionedTreeNode | undefined): TreeEdge[] {
  if (!node) {
    return [];
  }

  const edges: TreeEdge[] = [];

  if (node.left) {
    edges.push({ from: node, to: node.left }, ...getEdges(node.left));
  }

  if (node.right) {
    edges.push({ from: node, to: node.right }, ...getEdges(node.right));
  }

  return edges;
}

function getEdgeGeometry(from: PositionedTreeNode, to: PositionedTreeNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;

  return {
    x1: from.x + unitX * (NODE_RADIUS * 0.35),
    y1: from.y + unitY * NODE_RADIUS,
    x2: to.x - unitX * (NODE_RADIUS * 0.25),
    y2: to.y - unitY * NODE_RADIUS,
  };
}

export function BinaryTreeVisualizer() {
  const [tree, setTree] = useState<TreeNode | undefined>(() => {
    let root: TreeNode | undefined;
    [50, 30, 70, 20, 40, 60, 80].forEach((value) => {
      root = insertBST(root, value);
    });
    return root;
  });
  const [newValue, setNewValue] = useState("");
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [currentAction, setCurrentAction] = useState("Insert nodes or start an inorder traversal to study BST behavior.");
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [stepLog, setStepLog] = useState<VisualizationStep[]>([]);
  const stepCounterRef = useRef(0);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addStep = useCallback((action: string, explanation: string, tone: StepTone) => {
    stepCounterRef.current += 1;
    const stepNumber = stepCounterRef.current;

    setStepLog((previous) => [
      ...previous,
      {
        id: `tree-step-${stepNumber}`,
        stepNumber,
        action,
        explanation,
        tone,
      },
    ]);
  }, []);

  const addDivider = useCallback((action: string, explanation: string, tone: StepTone = "round") => {
    setStepLog((previous) => [
      ...previous,
      {
        id: `tree-divider-${previous.length}-${Date.now()}`,
        action,
        explanation,
        tone,
        isDivider: true,
      },
    ]);
  }, []);

  const clearLog = useCallback(() => {
    stepCounterRef.current = 0;
    setStepLog([]);
  }, []);

  const baseTree = useMemo(
    () => layoutTree(tree, TREE_SIDE_PADDING, TREE_WIDTH - TREE_SIDE_PADDING, 0),
    [tree]
  );
  const positionedTree = useMemo(
    () => applyPositionOverrides(baseTree, positionOverrides),
    [baseTree, positionOverrides]
  );
  const nodes = useMemo(() => flattenTree(positionedTree), [positionedTree]);
  const edges = useMemo(() => getEdges(positionedTree), [positionedTree]);
  const nodeMap = useMemo(
    () =>
      nodes.reduce<Record<string, { x: number; y: number }>>((accumulator, node) => {
        accumulator[String(node.value)] = { x: node.x, y: node.y };
        return accumulator;
      }, {}),
    [nodes]
  );

  const insertValue = () => {
    if (!newValue || isAnimating) {
      return;
    }

    const parsedValue = Number.parseInt(newValue, 10);
    if (Number.isNaN(parsedValue)) {
      return;
    }

    const path: number[] = [];
    let current = tree;
    let parentValue: number | null = null;
    let direction: "left" | "right" | "root" = "root";

    while (current) {
      path.push(current.value);
      parentValue = current.value;

      if (parsedValue < current.value) {
        addStep(
          `Compare ${parsedValue} with ${current.value}`,
          `${parsedValue} is smaller, so BST rules move left to keep smaller values on the left side of each node.`,
          "compare"
        );
        direction = "left";
        current = current.left;
      } else {
        addStep(
          `Compare ${parsedValue} with ${current.value}`,
          `${parsedValue} is greater than or equal to ${current.value}, so BST rules move right to preserve sorted order.`,
          "compare"
        );
        direction = "right";
        current = current.right;
      }
    }

    if (!tree) {
      addStep(
        `Insert ${parsedValue} as root`,
        "The tree was empty, so the new value becomes the root and every future search will start here.",
        "insert"
      );
    } else {
      addStep(
        `Insert ${parsedValue} as ${direction} child of ${parentValue}`,
        `This is the first empty ${direction} branch on the search path, so the binary-search-tree ordering remains valid.`,
        "insert"
      );
    }

    setTree((currentTree) => insertBST(currentTree, parsedValue));
    setPositionOverrides({});
    setNewValue("");
    setHighlightedNodes(new Set([...path, parsedValue]));
    setCurrentNode(parsedValue);
    setCurrentPath([...path, parsedValue]);
    setCurrentDepth(path.length);
    setCurrentAction(`Inserted ${parsedValue} by following the BST comparison path.`);
  };

  const inorderTraversal = useCallback(async () => {
    if (!tree || isAnimating) {
      return;
    }

    setIsAnimating(true);
    setTraversalResult([]);
    setHighlightedNodes(new Set());
    setCurrentNode(null);
    setCurrentPath([]);
    setCurrentDepth(0);
    setCurrentAction("Running inorder traversal (Left → Node → Right).");
    addDivider(
      "Inorder traversal started",
      "In a binary search tree, visiting Left → Node → Right returns values in sorted order because every left subtree holds smaller values and every right subtree holds larger ones.",
      "round"
    );

    const result: number[] = [];

    const traverse = async (node: TreeNode | undefined, path: number[]): Promise<void> => {
      if (!node) {
        return;
      }

      const nextPath = [...path, node.value];
      setCurrentNode(node.value);
      setCurrentPath(nextPath);
      setCurrentDepth(path.length);

      if (node.left) {
        setHighlightedNodes(new Set([node.value, node.left.value]));
        addStep(
          `Traverse left from ${node.value}`,
          `Inorder always explores the left subtree first because those values must appear before ${node.value} in sorted order.`,
          "traverse"
        );
        await sleep(450);
      }

      await traverse(node.left, nextPath);

      result.push(node.value);
      setHighlightedNodes(new Set([node.value]));
      setTraversalResult([...result]);
      setCurrentNode(node.value);
      setCurrentPath(nextPath);
      addStep(
        `Visit ${node.value}`,
        `After the left subtree is finished, ${node.value} becomes the next smallest remaining value to output.`,
        "visit"
      );
      await sleep(600);

      if (node.right) {
        setHighlightedNodes(new Set([node.value, node.right.value]));
        addStep(
          `Traverse right from ${node.value}`,
          `Now the traversal explores the right subtree, where every value is larger than ${node.value}.`,
          "explore"
        );
        await sleep(450);
      }

      await traverse(node.right, nextPath);
    };

    await traverse(tree, []);
    setHighlightedNodes(new Set(result));
    setCurrentNode(null);
    setCurrentPath([]);
    setCurrentDepth(0);
    setCurrentAction("Traversal complete.");
    addDivider(
      "Inorder traversal complete",
      `Visited nodes in order: [${result.join(", ")}]. The sequence is sorted because the BST always stores smaller values left and larger values right.`,
      "sorted"
    );
    setIsAnimating(false);
  }, [addDivider, addStep, isAnimating, tree]);

  const handleNodeDrag = useCallback(
    (nodeId: string, { dx, dy }: CanvasDragPayload) => {
      setPositionOverrides((currentOverrides) => {
        const currentPosition = currentOverrides[nodeId] ?? nodeMap[nodeId];
        if (!currentPosition) {
          return currentOverrides;
        }

        return {
          ...currentOverrides,
          [nodeId]: {
            x: clamp(currentPosition.x + dx, NODE_RADIUS + 20, TREE_WIDTH - NODE_RADIUS - 20),
            y: clamp(currentPosition.y + dy, NODE_RADIUS + 20, TREE_HEIGHT - NODE_RADIUS - 20),
          },
        };
      });
    },
    [nodeMap]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Binary Search Tree</h3>
          <p className="mt-1 text-sm text-gray-400">Drag nodes to inspect relationships or zoom into deeper levels of the tree.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => void inorderTraversal()}
          disabled={isAnimating}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnimating ? "Traversing..." : "Inorder Traversal"}
        </motion.button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="number"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && insertValue()}
          placeholder="Insert value..."
          className="flex-1 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={insertValue}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
        >
          Insert
        </motion.button>
      </div>

      {traversalResult.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3"
        >
          <span className="font-mono text-sm text-purple-200">Inorder: [{traversalResult.join(", ")}]</span>
        </motion.div>
      )}

      <InteractiveCanvas canvasClassName="h-[440px]" onNodeDrag={handleNodeDrag}>
        {() => (
          <div className="relative h-[520px] w-[920px]">
            <svg width={TREE_WIDTH} height={TREE_HEIGHT} viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`} className="h-full w-full">
              {edges.map((edge, index) => {
                const geometry = getEdgeGeometry(edge.from, edge.to);
                return (
                  <motion.line
                    key={`${edge.from.value}-${edge.to.value}`}
                    x1={geometry.x1}
                    y1={geometry.y1}
                    x2={geometry.x2}
                    y2={geometry.y2}
                    stroke="rgba(168,85,247,0.45)"
                    strokeWidth={2.6}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                  />
                );
              })}

              {nodes.map((node, index) => {
                const isHighlighted = highlightedNodes.has(node.value);
                return (
                  <motion.g
                    key={node.value}
                    data-draggable
                    data-node-id={String(node.value)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: isHighlighted ? [1, 1.08, 1] : 1 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    style={{ cursor: "grab", transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS}
                      fill={isHighlighted ? "rgba(250,204,21,0.28)" : "rgba(107,33,168,0.28)"}
                      stroke={isHighlighted ? "#facc15" : "#a855f7"}
                      strokeWidth={2.6}
                    />
                    <text
                      x={node.x}
                      y={node.y + 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize="15"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {node.value}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>
        )}
      </InteractiveCanvas>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-800/70 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Current action</div>
          <div className="mt-2 text-sm font-medium text-white">{currentAction}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/70 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Focused node</div>
          <div className="mt-2 text-sm font-medium text-white">{currentNode ?? "None"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/70 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Depth / level</div>
          <div className="mt-2 text-sm font-medium text-white">{currentDepth}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/70 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Traversal path</div>
          <div className="mt-2 text-sm font-medium text-white">{currentPath.length > 0 ? currentPath.join(" → ") : "No active path"}</div>
        </div>
      </div>

      <VisualizationStepPanel
        entries={stepLog}
        onClear={clearLog}
        emptyMessage="Insert a value or run inorder traversal to see how the tree chooses paths and visits nodes."
      />
    </motion.div>
  );
}
