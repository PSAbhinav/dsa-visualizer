"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

const COLORS = [
  "from-purple-500 to-violet-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
];

const INITIAL_PARENT = Array.from({ length: 8 }, (_, index) => index);
const INITIAL_SIZE = Array.from({ length: 8 }, () => 1);

const rootOf = (parent: number[], value: number) => {
  let current = value;
  while (parent[current] !== current) current = parent[current];
  return current;
};

export function DisjointSetVisualizer() {
  const [parent, setParent] = useState<number[]>(() => [...INITIAL_PARENT]);
  const [size, setSize] = useState<number[]>(() => [...INITIAL_SIZE]);
  const [unionA, setUnionA] = useState("1");
  const [unionB, setUnionB] = useState("5");
  const [findValue, setFindValue] = useState("5");
  const [speed, setSpeed] = useState(55);
  const [isAnimating, setIsAnimating] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const [highlightRoots, setHighlightRoots] = useState<number[]>([]);
  const [status, setStatus] = useState("Every node begins in its own set. Use union to merge sets and find to chase a root.");

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const reset = useCallback(() => {
    if (isAnimating) return;
    setParent([...INITIAL_PARENT]);
    setSize([...INITIAL_SIZE]);
    setPath([]);
    setHighlightRoots([]);
    setStatus("Reset to eight singleton sets.");
  }, [isAnimating]);

  const handleFind = useCallback(async () => {
    if (isAnimating) return;
    const start = Math.max(0, Math.min(parent.length - 1, Number(findValue) || 0));
    const nextParent = [...parent];
    const trail = [start];
    setIsAnimating(true);
    setPath(trail);
    setHighlightRoots([]);
    setStatus(`Start find(${start}) and follow parent links until a root points to itself.`);
    await wait(Math.max(120, 900 - speed * 7));

    let current = start;
    while (nextParent[current] !== current) {
      current = nextParent[current];
      trail.push(current);
      setPath([...trail]);
      setStatus(`Move from the previous node to parent ${current}.`);
      await wait(Math.max(120, 900 - speed * 7));
    }

    for (const node of trail) nextParent[node] = current;
    setParent(nextParent);
    setHighlightRoots([current]);
    setStatus(`Root is ${current}. Path compression now points ${trail.join(" → ")} directly to it.`);
    setIsAnimating(false);
  }, [findValue, isAnimating, parent, speed, wait]);

  const handleUnion = useCallback(async () => {
    if (isAnimating) return;
    const first = Math.max(0, Math.min(parent.length - 1, Number(unionA) || 0));
    const second = Math.max(0, Math.min(parent.length - 1, Number(unionB) || 0));
    const nextParent = [...parent];
    const nextSize = [...size];
    const rootA = rootOf(nextParent, first);
    const rootB = rootOf(nextParent, second);

    setIsAnimating(true);
    setPath([]);
    setHighlightRoots([rootA, rootB]);
    setStatus(`Union(${first}, ${second}) compares roots ${rootA} and ${rootB}.`);
    await wait(Math.max(120, 900 - speed * 7));

    if (rootA === rootB) {
      setStatus(`Nodes ${first} and ${second} already belong to the same set rooted at ${rootA}.`);
      setIsAnimating(false);
      return;
    }

    const [bigRoot, smallRoot] = nextSize[rootA] >= nextSize[rootB] ? [rootA, rootB] : [rootB, rootA];
    nextParent[smallRoot] = bigRoot;
    nextSize[bigRoot] += nextSize[smallRoot];
    setParent(nextParent);
    setSize(nextSize);
    setHighlightRoots([bigRoot]);
    setStatus(`Attach root ${smallRoot} under ${bigRoot}. The merged set size becomes ${nextSize[bigRoot]}.`);
    setIsAnimating(false);
  }, [isAnimating, parent, size, speed, unionA, unionB, wait]);

  const groups = Object.entries(
    parent.reduce<Record<string, number[]>>((acc, _, node) => {
      const root = rootOf(parent, node);
      acc[root] = [...(acc[root] ?? []), node];
      return acc;
    }, {})
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-green-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Disjoint Set Union</h3>
          <p className="text-sm text-gray-400">Merge components with union-by-size and trace roots with path compression.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          disabled={isAnimating}
          className="rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
        >
          Reset
        </motion.button>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/5 bg-gray-800/60 p-4 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
        <input
          type="number"
          min={0}
          max={7}
          value={unionA}
          onChange={(event) => setUnionA(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-green-400/40"
          placeholder="a"
        />
        <input
          type="number"
          min={0}
          max={7}
          value={unionB}
          onChange={(event) => setUnionB(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-green-400/40"
          placeholder="b"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleUnion}
          disabled={isAnimating}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
        >
          Union(a, b)
        </motion.button>
        <input
          type="number"
          min={0}
          max={7}
          value={findValue}
          onChange={(event) => setFindValue(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-green-400/40"
          placeholder="x"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleFind}
          disabled={isAnimating}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Find(x)
        </motion.button>
      </div>

      <div className="mb-5 rounded-2xl border border-white/5 bg-gray-800/70 p-4">
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
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-green-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map(([root, nodes], index) => (
          <motion.div
            key={root}
            layout
            className={`rounded-2xl border border-white/5 bg-gradient-to-br ${COLORS[index % COLORS.length]} p-[1px]`}
          >
            <div className="rounded-[15px] bg-gray-900/95 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-white">
                <span>Root {root}</span>
                <span className="text-gray-300">Size {size[Number(root)]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {nodes.map((node) => {
                  const highlighted = path.includes(node);
                  const rootGlow = highlightRoots.includes(node);
                  return (
                    <motion.div
                      key={node}
                      layout
                      animate={{ scale: highlighted || rootGlow ? 1.05 : 1 }}
                      className={`rounded-2xl border p-3 ${
                        rootGlow
                          ? "border-green-400/50 bg-green-500/20"
                          : highlighted
                          ? "border-yellow-300/50 bg-yellow-400/20"
                          : "border-white/10 bg-gray-800"
                      }`}
                    >
                      <div className="text-xl font-bold text-white">{node}</div>
                      <div className="mt-2 space-y-1 text-xs text-gray-300">
                        <div>parent: {parent[node]}</div>
                        <div>size: {size[rootOf(parent, node)]}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-green-300">Step:</span> {status}
      </div>
    </motion.div>
  );
}
