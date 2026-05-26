"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type MatrixTab = "spiral" | "diagonal" | "rotation";
type Cell = { row: number; col: number };

const MATRIX = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
];

const emptyRotation = () => Array.from({ length: 4 }, () => Array<number | null>(4).fill(null));

const TAB_COPY: Record<MatrixTab, string> = {
  spiral: "Spiral order walks the matrix boundaries and peels inward.",
  diagonal: "Diagonal traversal groups cells by row + column and sweeps across each diagonal.",
  rotation: "Rotation maps each cell (r, c) to (c, n - 1 - r) in the new matrix.",
};

export function MatrixVisualizer() {
  const [tab, setTab] = useState<MatrixTab>("spiral");
  const [speed, setSpeed] = useState(55);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visited, setVisited] = useState<Cell[]>([]);
  const [current, setCurrent] = useState<Cell | null>(null);
  const [source, setSource] = useState<Cell | null>(null);
  const [destination, setDestination] = useState<Cell | null>(null);
  const [rotated, setRotated] = useState<(number | null)[][]>(() => emptyRotation());
  const [status, setStatus] = useState(TAB_COPY.spiral);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const resetVisuals = useCallback(() => {
    setVisited([]);
    setCurrent(null);
    setSource(null);
    setDestination(null);
    setRotated(emptyRotation());
  }, []);

  const handleTabChange = useCallback(
    (nextTab: MatrixTab) => {
      if (isAnimating || nextTab === tab) return;
      resetVisuals();
      setStatus(TAB_COPY[nextTab]);
      setTab(nextTab);
    },
    [isAnimating, resetVisuals, tab]
  );

  const spiralOrder = useCallback(() => {
    const order: Cell[] = [];
    let top = 0;
    let bottom = MATRIX.length - 1;
    let left = 0;
    let right = MATRIX[0].length - 1;

    while (top <= bottom && left <= right) {
      for (let col = left; col <= right; col++) order.push({ row: top, col });
      top += 1;
      for (let row = top; row <= bottom; row++) order.push({ row, col: right });
      right -= 1;
      if (top <= bottom) for (let col = right; col >= left; col--) order.push({ row: bottom, col });
      bottom -= 1;
      if (left <= right) for (let row = bottom; row >= top; row--) order.push({ row, col: left });
      left += 1;
    }

    return order;
  }, []);

  const diagonalOrder = useCallback(() => {
    const order: Cell[] = [];
    for (let sum = 0; sum <= 6; sum++) {
      const diagonal: Cell[] = [];
      for (let row = 0; row < 4; row++) {
        const col = sum - row;
        if (col >= 0 && col < 4) diagonal.push({ row, col });
      }
      if (sum % 2 === 0) diagonal.reverse();
      order.push(...diagonal);
    }
    return order;
  }, []);

  const rotationPairs = useCallback(
    () =>
      MATRIX.flatMap((row, sourceRow) =>
        row.map((_, sourceCol) => ({
          from: { row: sourceRow, col: sourceCol },
          to: { row: sourceCol, col: MATRIX.length - 1 - sourceRow },
        }))
      ),
    []
  );

  const run = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    resetVisuals();
    const delay = Math.max(120, 900 - speed * 7);

    if (tab === "rotation") {
      const nextGrid = emptyRotation();
      for (const pair of rotationPairs()) {
        setSource(pair.from);
        setDestination(pair.to);
        nextGrid[pair.to.row][pair.to.col] = MATRIX[pair.from.row][pair.from.col];
        setRotated(nextGrid.map((gridRow) => [...gridRow]));
        setStatus(
          `Move ${MATRIX[pair.from.row][pair.from.col]} from (${pair.from.row}, ${pair.from.col}) to (${pair.to.row}, ${pair.to.col}).`
        );
        await wait(delay);
      }
      setSource(null);
      setDestination(null);
      setStatus("Rotation complete. Every source cell has landed in its rotated destination.");
      setIsAnimating(false);
      return;
    }

    const order = tab === "spiral" ? spiralOrder() : diagonalOrder();
    const trail: Cell[] = [];

    for (const cell of order) {
      trail.push(cell);
      setVisited([...trail]);
      setCurrent(cell);
      setStatus(`Visit value ${MATRIX[cell.row][cell.col]} at (${cell.row}, ${cell.col}).`);
      await wait(delay);
    }

    setCurrent(null);
    setStatus(`Traversal complete. Order: ${order.map((cell) => MATRIX[cell.row][cell.col]).join(" → ")}.`);
    setIsAnimating(false);
  }, [diagonalOrder, isAnimating, resetVisuals, rotationPairs, speed, spiralOrder, tab, wait]);

  const visitNumber = (row: number, col: number) => visited.findIndex((cell) => cell.row === row && cell.col === col) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-purple-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Matrix Patterns</h3>
          <p className="text-sm text-gray-400">Trace traversals and rotations on a 4×4 grid.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["spiral", "Spiral"],
            ["diagonal", "Diagonal"],
            ["rotation", "Rotate 90°"],
          ] as const).map(([id, label]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(id)}
              disabled={isAnimating}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                tab === id
                  ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                  : "border-white/10 bg-gray-800 text-gray-400 hover:text-white"
              } disabled:opacity-50`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-4 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-[1fr_auto]">
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
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={run}
          disabled={isAnimating}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {isAnimating ? "Animating..." : "Play Pattern"}
        </motion.button>
      </div>

      <div className={`grid gap-5 ${tab === "rotation" ? "lg:grid-cols-2" : "lg:grid-cols-[1fr_280px]"}`}>
        {[{ title: "Matrix", values: MATRIX }, ...(tab === "rotation" ? [{ title: "Rotated", values: rotated }] : [])].map((grid) => (
          <div key={grid.title} className="rounded-2xl border border-white/5 bg-gray-800/50 p-4">
            <div className="mb-3 text-sm font-medium text-purple-200">{grid.title}</div>
            <div className="grid grid-cols-4 gap-3">
              {grid.values.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                  const isCurrent = current?.row === rowIndex && current.col === colIndex;
                  const isVisited = visited.some((cell) => cell.row === rowIndex && cell.col === colIndex);
                  const isSource = source?.row === rowIndex && source.col === colIndex;
                  const isDestination = destination?.row === rowIndex && destination.col === colIndex;

                  return (
                    <motion.div
                      key={`${grid.title}-${rowIndex}-${colIndex}`}
                      layout
                      animate={{ scale: isCurrent || isSource || isDestination ? 1.06 : 1 }}
                      className={`relative flex aspect-square items-center justify-center rounded-2xl border text-xl font-bold ${
                        isSource
                          ? "border-yellow-300/50 bg-yellow-400/20 text-yellow-100"
                          : isDestination
                          ? "border-green-400/50 bg-green-500/20 text-green-100"
                          : isCurrent
                          ? "border-blue-400/50 bg-blue-500/20 text-blue-100"
                          : isVisited
                          ? "border-purple-400/40 bg-purple-500/15 text-white"
                          : "border-white/5 bg-gray-900 text-gray-200"
                      }`}
                    >
                      {value ?? "·"}
                      {tab !== "rotation" && isVisited ? (
                        <span className="absolute right-2 top-2 text-[10px] text-purple-200">#{visitNumber(rowIndex, colIndex)}</span>
                      ) : null}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        ))}

        {tab !== "rotation" ? (
          <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4">
            <div className="mb-3 text-sm font-medium text-purple-200">Traversal trail</div>
            <div className="flex flex-wrap gap-2">
              {visited.map((cell, index) => (
                <motion.div
                  key={`${cell.row}-${cell.col}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-sm text-white"
                >
                  {MATRIX[cell.row][cell.col]}
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-purple-300">Step:</span> {status}
      </div>
    </motion.div>
  );
}
