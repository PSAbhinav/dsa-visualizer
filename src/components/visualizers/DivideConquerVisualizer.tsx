"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Phase = "idle" | "split" | "base" | "merge";

type TreeNode = {
  id: string;
  values: number[];
  depth: number;
  x: number;
  y: number;
  left?: TreeNode;
  right?: TreeNode;
};

type NodeState = {
  visible: boolean;
  phase: Phase;
  values: number[];
};

type Step = {
  activeId: string;
  message: string;
  states: Record<string, NodeState>;
};

const TREE_WIDTH = 760;
const LEVEL_HEIGHT = 86;
const DEFAULT_ARRAY = [38, 12, 27, 43, 3, 9, 82, 10];
const COLORS: Record<Phase, string> = {
  idle: "border-white/10 bg-gray-800/90",
  split: "border-red-400 bg-red-500/10",
  base: "border-yellow-400 bg-yellow-500/10",
  merge: "border-emerald-400 bg-emerald-500/10",
};

function mergeValues(left: number[], right: number[]) {
  const merged: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return [...merged, ...left.slice(leftIndex), ...right.slice(rightIndex)];
}

function buildTree(values: number[], start: number, end: number, depth: number, minX: number, maxX: number): TreeNode {
  const slice = values.slice(start, end + 1);
  const node: TreeNode = {
    id: `${start}-${end}`,
    values: slice,
    depth,
    x: (minX + maxX) / 2,
    y: 54 + depth * LEVEL_HEIGHT,
  };

  if (start < end) {
    const mid = Math.floor((start + end) / 2);
    node.left = buildTree(values, start, mid, depth + 1, minX, node.x);
    node.right = buildTree(values, mid + 1, end, depth + 1, node.x, maxX);
  }

  return node;
}

function flattenTree(node: TreeNode): TreeNode[] {
  return [node, ...(node.left ? flattenTree(node.left) : []), ...(node.right ? flattenTree(node.right) : [])];
}

function cloneStates(states: Record<string, NodeState>) {
  return Object.fromEntries(
    Object.entries(states).map(([key, value]) => [key, { ...value, values: [...value.values] }])
  ) as Record<string, NodeState>;
}

function buildSteps(root: TreeNode) {
  const nodes = flattenTree(root);
  const states = nodes.reduce<Record<string, NodeState>>((accumulator, node, index) => {
    accumulator[node.id] = {
      visible: index === 0,
      phase: "idle",
      values: [...node.values],
    };
    return accumulator;
  }, {});
  const steps: Step[] = [{ activeId: root.id, message: "Start with the full array and split it into smaller subproblems.", states: cloneStates(states) }];

  const walk = (node: TreeNode): number[] => {
    states[node.id] = { visible: true, phase: "split", values: [...node.values] };
    steps.push({ activeId: node.id, message: `Split [${node.values.join(", ")}] into two halves.`, states: cloneStates(states) });

    if (!node.left || !node.right) {
      states[node.id] = { visible: true, phase: "base", values: [...node.values] };
      steps.push({ activeId: node.id, message: `Base case reached with [${node.values.join(", ")}].`, states: cloneStates(states) });
      return [...node.values];
    }

    states[node.left.id] = { visible: true, phase: "idle", values: [...node.left.values] };
    states[node.right.id] = { visible: true, phase: "idle", values: [...node.right.values] };
    steps.push({ activeId: node.id, message: "Recursive calls fan out to the left and right halves.", states: cloneStates(states) });

    const leftSorted = walk(node.left);
    const rightSorted = walk(node.right);
    const merged = mergeValues(leftSorted, rightSorted);
    states[node.id] = { visible: true, phase: "merge", values: merged };
    steps.push({ activeId: node.id, message: `Merge ${leftSorted.join(", ")} and ${rightSorted.join(", ")} into ${merged.join(", ")}.`, states: cloneStates(states) });

    return merged;
  };

  walk(root);
  return steps;
}

export function DivideConquerVisualizer() {
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY);
  const [tree, setTree] = useState<TreeNode>(() => buildTree(DEFAULT_ARRAY, 0, DEFAULT_ARRAY.length - 1, 0, 50, TREE_WIDTH - 50));
  const [steps, setSteps] = useState<Step[]>(() => buildSteps(buildTree(DEFAULT_ARRAY, 0, DEFAULT_ARRAY.length - 1, 0, 50, TREE_WIDTH - 50)));
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(680);

  const resetTree = useCallback((nextArray: number[]) => {
    const nextTree = buildTree(nextArray, 0, nextArray.length - 1, 0, 50, TREE_WIDTH - 50);
    setArray(nextArray);
    setTree(nextTree);
    setSteps(buildSteps(nextTree));
    setStepIndex(0);
    setIsRunning(false);
  }, []);

  const randomize = useCallback(() => {
    const nextArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 5);
    resetTree(nextArray);
  }, [resetTree]);

  const runVisualization = useCallback(() => {
    setStepIndex(0);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning || stepIndex >= steps.length - 1) {
      if (isRunning && stepIndex >= steps.length - 1) {
        setIsRunning(false);
      }
      return;
    }

    const timer = window.setTimeout(() => setStepIndex((current) => current + 1), speed);
    return () => window.clearTimeout(timer);
  }, [isRunning, speed, stepIndex, steps.length]);

  const currentStep = steps[stepIndex];
  const nodes = flattenTree(tree);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-white backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Divide &amp; Conquer</h3>
          <p className="mt-1 text-sm text-gray-400">Watch a merge-sort style recursion tree split, hit base cases, and merge upward.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={randomize} disabled={isRunning} className="rounded-lg bg-gray-700 px-3 py-2 text-sm disabled:opacity-50">Randomize</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={runVisualization} disabled={isRunning} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium disabled:opacity-50">{isRunning ? "Running..." : "Run Split & Merge"}</motion.button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-gray-800/70 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-300">
          <span>Input: [{array.join(", ")}]</span>
          <span className="text-purple-300">Step {stepIndex + 1} / {steps.length}</span>
        </div>
        <p className="text-sm text-gray-300">{currentStep.message}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-gray-800/70 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-300"><span className="h-3 w-3 rounded-full bg-red-400" /> Splitting phase</div>
        <div className="flex items-center gap-2 text-xs text-gray-300"><span className="h-3 w-3 rounded-full bg-yellow-400" /> Base case</div>
        <div className="flex items-center gap-2 text-xs text-gray-300"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Merging phase</div>
        <div className="ml-auto flex items-center gap-3 text-sm text-gray-300">
          <span>Speed</span>
          <input type="range" min={200} max={1200} step={50} value={1400 - speed} onChange={(event) => setSpeed(1400 - Number(event.target.value))} className="w-40 accent-purple-500" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-950/70 p-3">
        <div className="relative mx-auto h-[360px] max-w-[760px]">
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${TREE_WIDTH} 360`}>
            {nodes.map((node) => {
              const state = currentStep.states[node.id];
              if (!state?.visible) return null;
              return [node.left, node.right].map((child) => {
                if (!child || !currentStep.states[child.id]?.visible) return null;
                const emphasized = currentStep.activeId === node.id || currentStep.activeId === child.id;
                return (
                  <line
                    key={`${node.id}-${child.id}`}
                    x1={node.x}
                    y1={node.y + 24}
                    x2={child.x}
                    y2={child.y - 24}
                    stroke={emphasized ? "rgba(168,85,247,0.9)" : "rgba(107,114,128,0.55)"}
                    strokeWidth={emphasized ? 3 : 2}
                  />
                );
              });
            })}
          </svg>

          {nodes.map((node) => {
            const state = currentStep.states[node.id];
            if (!state?.visible) return null;
            return (
              <motion.div
                key={node.id}
                animate={{ scale: currentStep.activeId === node.id ? 1.05 : 1 }}
                transition={{ duration: 0.25 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center shadow-lg ${COLORS[state.phase]}`}
                style={{ left: node.x, top: node.y, minWidth: Math.max(92, state.values.length * 34) }}
              >
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">Depth {node.depth}</div>
                <div className="flex justify-center gap-1">
                  {state.values.map((value, index) => (
                    <span key={`${node.id}-${value}-${index}`} className="rounded-md bg-gray-900/80 px-2 py-1 text-xs">{value}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
