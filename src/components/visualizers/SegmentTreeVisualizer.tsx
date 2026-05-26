"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type TreeNode = { id: string; left: number; right: number; value: number; level: number };

const SOURCE = [2, 1, 5, 3, 4, 7, 6, 8];

function buildTreeData() {
  const rows: TreeNode[][] = [];
  const buildOrder: string[] = [];
  const map: Record<string, TreeNode> = {};

  const visit = (left: number, right: number, level: number): TreeNode => {
    const id = `${left}-${right}`;
    let value = 0;

    if (left === right) {
      value = SOURCE[left];
    } else {
      const mid = Math.floor((left + right) / 2);
      value = visit(left, mid, level + 1).value + visit(mid + 1, right, level + 1).value;
    }

    const node = { id, left, right, value, level };
    rows[level] = [...(rows[level] ?? []), node];
    map[id] = node;
    buildOrder.push(id);
    return node;
  };

  visit(0, SOURCE.length - 1, 0);
  rows.forEach((row) => row.sort((a, b) => a.left - b.left));
  return { rows, buildOrder, map };
}

const TREE = buildTreeData();

export function SegmentTreeVisualizer() {
  const [speed, setSpeed] = useState(55);
  const [queryLeft, setQueryLeft] = useState("2");
  const [queryRight, setQueryRight] = useState("5");
  const [builtIds, setBuiltIds] = useState<string[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [querySum, setQuerySum] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [status, setStatus] = useState("Build the segment tree bottom-up, then traverse only the segments needed for a range query.");

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const resetHighlights = useCallback(() => {
    setVisitedIds([]);
    setCurrentId(null);
    setQuerySum(null);
  }, []);

  const build = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    resetHighlights();
    const delay = Math.max(120, 900 - speed * 7);
    const nextBuilt: string[] = [];

    for (const id of TREE.buildOrder) {
      nextBuilt.push(id);
      setBuiltIds([...nextBuilt]);
      setCurrentId(id);
      setStatus(`Compute node [${id.replace("-", ", ")}] from its covered segment.`);
      await wait(delay);
    }

    setCurrentId(null);
    setStatus("Build complete. Each internal node stores the sum of its children.");
    setIsAnimating(false);
  }, [isAnimating, resetHighlights, speed, wait]);

  const query = useCallback(async () => {
    if (isAnimating || builtIds.length !== TREE.buildOrder.length) return;
    setIsAnimating(true);
    resetHighlights();
    const delay = Math.max(120, 900 - speed * 7);
    const left = Math.max(0, Math.min(SOURCE.length - 1, Number(queryLeft) || 0));
    const right = Math.max(left, Math.min(SOURCE.length - 1, Number(queryRight) || 0));
    const seen: string[] = [];

    const traverse = async (nodeLeft: number, nodeRight: number): Promise<number> => {
      const id = `${nodeLeft}-${nodeRight}`;
      seen.push(id);
      setVisitedIds([...seen]);
      setCurrentId(id);
      setStatus(`Visit segment [${nodeLeft}, ${nodeRight}] while answering query [${left}, ${right}].`);
      await wait(delay);

      if (right < nodeLeft || left > nodeRight) {
        return 0;
      }

      if (left <= nodeLeft && nodeRight <= right) {
        setStatus(`Segment [${nodeLeft}, ${nodeRight}] fits completely, so take ${TREE.map[id].value}.`);
        await wait(Math.max(100, delay / 2));
        return TREE.map[id].value;
      }

      const mid = Math.floor((nodeLeft + nodeRight) / 2);
      return (await traverse(nodeLeft, mid)) + (await traverse(mid + 1, nodeRight));
    };

    const sum = await traverse(0, SOURCE.length - 1);
    setCurrentId(null);
    setQuerySum(sum);
    setStatus(`Range sum for [${left}, ${right}] is ${sum}. Only relevant branches were explored.`);
    setIsAnimating(false);
  }, [builtIds.length, isAnimating, queryLeft, queryRight, resetHighlights, speed, wait]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-purple-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Segment Tree</h3>
          <p className="text-sm text-gray-400">Build segment sums, then trace how range queries skip irrelevant nodes.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800 px-4 py-2 text-sm text-white">
          Query result: {querySum ?? "—"}
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-[auto_auto_auto_auto_1fr]">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={build}
          disabled={isAnimating}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
        >
          Build
        </motion.button>
        <input
          type="number"
          min={0}
          max={SOURCE.length - 1}
          value={queryLeft}
          onChange={(event) => setQueryLeft(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-purple-400/40"
        />
        <input
          type="number"
          min={0}
          max={SOURCE.length - 1}
          value={queryRight}
          onChange={(event) => setQueryRight(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-purple-400/40"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={query}
          disabled={isAnimating || builtIds.length !== TREE.buildOrder.length}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
        >
          Query Range
        </motion.button>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>Animation speed</span>
            <span>{speed}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/5 bg-gray-800/50 p-4">
        {TREE.rows.map((row, level) => (
          <div key={level} className="flex flex-wrap justify-center gap-3">
            {row.map((node) => {
              const isBuilt = builtIds.includes(node.id);
              const isVisited = visitedIds.includes(node.id);
              const isCurrent = currentId === node.id;

              return (
                <motion.div
                  key={node.id}
                  layout
                  animate={{ scale: isCurrent ? 1.06 : 1, opacity: isBuilt ? 1 : 0.4 }}
                  className={`min-w-[112px] rounded-2xl border p-3 text-center ${
                    isCurrent
                      ? "border-yellow-300/50 bg-yellow-400/20 text-yellow-100"
                      : isVisited
                      ? "border-green-400/40 bg-green-500/20 text-green-100"
                      : isBuilt
                      ? "border-purple-400/40 bg-purple-500/15 text-white"
                      : "border-white/5 bg-gray-900 text-gray-500"
                  }`}
                >
                  <div className="text-xs text-gray-400">[{node.left}, {node.right}]</div>
                  <div className="mt-1 text-2xl font-bold">{isBuilt ? node.value : "?"}</div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4">
        <div className="mb-3 text-sm font-medium text-purple-200">Source array</div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {SOURCE.map((value, index) => {
            const inQuery = index >= Math.max(0, Number(queryLeft) || 0) && index <= Math.max(Number(queryLeft) || 0, Number(queryRight) || 0);
            return (
              <div
                key={index}
                className={`rounded-xl border p-3 text-center ${
                  inQuery ? "border-green-400/40 bg-green-500/15 text-green-100" : "border-white/5 bg-gray-900 text-white"
                }`}
              >
                <div className="text-xs text-gray-400">#{index}</div>
                <div className="text-xl font-bold">{value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-purple-300">Step:</span> {status}
      </div>
    </motion.div>
  );
}
