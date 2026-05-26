"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "factorial" | "nqueens";

type FactorialFrame = {
  value: number;
  result?: number;
  resolved: boolean;
};

type FactorialStep = {
  frames: FactorialFrame[];
  message: string;
};

type QueenPosition = {
  row: number;
  col: number;
};

type NQueensStep = {
  board: number[];
  currentRow: number;
  candidate?: QueenPosition;
  highlightSafe?: QueenPosition;
  conflictCells: QueenPosition[];
  attackPath: QueenPosition[];
  removedQueen?: QueenPosition;
  solved?: boolean;
  message: string;
};

const BOARD_SIZES = [4, 5, 6, 7, 8] as const;

function cloneFrames(frames: FactorialFrame[]) {
  return frames.map((frame) => ({ ...frame }));
}

function buildFactorialSteps(n: number): FactorialStep[] {
  const frames: FactorialFrame[] = [];
  const steps: FactorialStep[] = [];

  for (let value = n; value >= 1; value -= 1) {
    frames.push({ value, resolved: false });
    steps.push({
      frames: cloneFrames(frames),
      message: `Calling factorial(${value})`,
    });
  }

  let runningResult = 1;

  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const value = frames[index].value;
    runningResult = value === 1 ? 1 : runningResult * value;
    frames[index] = { value, resolved: true, result: runningResult };

    steps.push({
      frames: cloneFrames(frames),
      message:
        index === frames.length - 1
          ? "Base case reached: factorial(1) = 1"
          : `Returning ${runningResult} to factorial(${value + 1})`,
    });
  }

  return steps;
}

function uniquePositions(positions: QueenPosition[]) {
  const seen = new Set<string>();

  return positions.filter((position) => {
    const key = `${position.row}-${position.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildAttackPath(from: QueenPosition, to: QueenPosition) {
  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  const path: QueenPosition[] = [];

  let row = from.row;
  let col = from.col;

  while (true) {
    path.push({ row, col });
    if (row === to.row && col === to.col) break;
    row += rowStep;
    col += colStep;
  }

  return path;
}

function analyzeQueenSafety(board: number[], row: number, col: number) {
  const candidate = { row, col };
  const conflicts: QueenPosition[] = [candidate];
  const attackPath: QueenPosition[] = [candidate];

  for (let previousRow = 0; previousRow < row; previousRow += 1) {
    const previousCol = board[previousRow];
    if (previousCol === -1) continue;

    const sameColumn = previousCol === col;
    const sameDiagonal = Math.abs(previousCol - col) === Math.abs(previousRow - row);

    if (sameColumn || sameDiagonal) {
      const attacker = { row: previousRow, col: previousCol };
      conflicts.push(attacker);
      attackPath.push(...buildAttackPath(attacker, candidate));
    }
  }

  return {
    safe: conflicts.length === 1,
    conflicts: uniquePositions(conflicts),
    attackPath: uniquePositions(attackPath),
  };
}

function buildNQueensSteps(size: number): NQueensStep[] {
  const board = Array.from({ length: size }, () => -1);
  const steps: NQueensStep[] = [];

  const pushStep = (step: Omit<NQueensStep, "board">) => {
    steps.push({ ...step, board: [...board] });
  };

  const solve = (row: number): boolean => {
    if (row === size) {
      pushStep({
        currentRow: size,
        conflictCells: [],
        attackPath: [],
        solved: true,
        message: `Solution found for ${size}-Queens!`,
      });
      return true;
    }

    for (let col = 0; col < size; col += 1) {
      pushStep({
        currentRow: row,
        candidate: { row, col },
        conflictCells: [],
        attackPath: [],
        message: `Trying row ${row + 1}, column ${col + 1}`,
      });

      const analysis = analyzeQueenSafety(board, row, col);

      if (analysis.safe) {
        board[row] = col;
        pushStep({
          currentRow: row,
          highlightSafe: { row, col },
          conflictCells: [],
          attackPath: [],
          message: `Placed queen at (${row + 1}, ${col + 1})`,
        });

        if (solve(row + 1)) {
          return true;
        }

        board[row] = -1;
        pushStep({
          currentRow: row,
          removedQueen: { row, col },
          conflictCells: [{ row, col }],
          attackPath: [{ row, col }],
          message: `Backtracking from row ${row + 1}`,
        });
      } else {
        pushStep({
          currentRow: row,
          candidate: { row, col },
          conflictCells: analysis.conflicts,
          attackPath: analysis.attackPath,
          message: `Conflict detected at (${row + 1}, ${col + 1})`,
        });
      }
    }

    return false;
  };

  pushStep({
    currentRow: 0,
    conflictCells: [],
    attackPath: [],
    message: `Starting ${size}-Queens backtracking`,
  });

  solve(0);

  return steps;
}

function hasPosition(positions: QueenPosition[], row: number, col: number) {
  return positions.some((position) => position.row === row && position.col === col);
}

export function RecursionVisualizer() {
  const [activeTab, setActiveTab] = useState<Tab>("factorial");
  const [factorialN, setFactorialN] = useState(5);
  const [factorialSteps, setFactorialSteps] = useState<FactorialStep[]>([]);
  const [factorialStepIndex, setFactorialStepIndex] = useState(-1);
  const [factorialIsAuto, setFactorialIsAuto] = useState(false);
  const [factorialTimers, setFactorialTimers] = useState<number[]>([]);

  const [boardSize, setBoardSize] = useState<(typeof BOARD_SIZES)[number]>(4);
  const [queenSteps, setQueenSteps] = useState<NQueensStep[]>([]);
  const [queenStepIndex, setQueenStepIndex] = useState(-1);
  const [queenIsAuto, setQueenIsAuto] = useState(false);
  const [queenTimers, setQueenTimers] = useState<number[]>([]);

  const currentFactorialStep = factorialSteps[factorialStepIndex];
  const currentQueenStep = queenSteps[queenStepIndex];
  const displayedBoard = currentQueenStep?.board ?? Array.from({ length: boardSize }, () => -1);

  const clearTimers = (timerIds: number[]) => {
    timerIds.forEach((timerId) => window.clearTimeout(timerId));
  };

  const resetFactorial = () => {
    clearTimers(factorialTimers);
    setFactorialTimers([]);
    setFactorialIsAuto(false);
    setFactorialSteps([]);
    setFactorialStepIndex(-1);
  };

  const runFactorialAuto = () => {
    clearTimers(factorialTimers);
    const steps = buildFactorialSteps(factorialN);
    setFactorialSteps(steps);
    setFactorialStepIndex(-1);
    setFactorialIsAuto(true);

    const timers = steps.map((_, index) =>
      window.setTimeout(() => {
        setFactorialStepIndex(index);
        if (index === steps.length - 1) {
          setFactorialIsAuto(false);
          setFactorialTimers([]);
        }
      }, index * 700)
    );

    setFactorialTimers(timers);
  };

  const stepFactorial = () => {
    if (factorialIsAuto) return;

    const steps = factorialSteps.length > 0 ? factorialSteps : buildFactorialSteps(factorialN);
    if (factorialSteps.length === 0) {
      setFactorialSteps(steps);
    }

    setFactorialStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
  };

  const resetQueens = (nextSize?: (typeof BOARD_SIZES)[number]) => {
    clearTimers(queenTimers);
    setQueenTimers([]);
    setQueenIsAuto(false);
    setQueenSteps([]);
    setQueenStepIndex(-1);
    if (nextSize) {
      setBoardSize(nextSize);
    }
  };

  const playQueenSteps = (steps: NQueensStep[], startIndex: number) => {
    if (startIndex >= steps.length) return;

    setQueenIsAuto(true);

    const timers = steps.slice(startIndex).map((_, offset) =>
      window.setTimeout(() => {
        const nextIndex = startIndex + offset;
        setQueenStepIndex(nextIndex);
        if (nextIndex === steps.length - 1) {
          setQueenIsAuto(false);
          setQueenTimers([]);
        }
      }, offset * 600)
    );

    setQueenTimers(timers);
  };

  const solveQueens = () => {
    clearTimers(queenTimers);
    const steps = buildNQueensSteps(boardSize);
    setQueenSteps(steps);
    setQueenStepIndex(-1);
    playQueenSteps(steps, 0);
  };

  const stepQueens = () => {
    if (queenIsAuto) return;

    const steps = queenSteps.length > 0 ? queenSteps : buildNQueensSteps(boardSize);
    if (queenSteps.length === 0) {
      setQueenSteps(steps);
    }

    setQueenStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
  };

  const toggleQueensAuto = () => {
    if (queenIsAuto) {
      clearTimers(queenTimers);
      setQueenTimers([]);
      setQueenIsAuto(false);
      return;
    }

    const steps = queenSteps.length > 0 ? queenSteps : buildNQueensSteps(boardSize);
    if (queenSteps.length === 0) {
      setQueenSteps(steps);
    }

    playQueenSteps(steps, queenStepIndex + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-white font-semibold text-xl">Recursion &amp; Backtracking</h3>
          <p className="text-sm text-gray-400">Watch recursion stack frames grow and see backtracking explore the chessboard.</p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          {[
            { key: "factorial" as const, label: "Factorial (Call Stack)" },
            { key: "nqueens" as const, label: "N-Queens" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                activeTab === tab.key ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "factorial" ? (
          <motion.div
            key="factorial"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span>Input n</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={factorialN}
                  onChange={(event) => {
                    const nextValue = Math.min(8, Math.max(1, Number(event.target.value) || 1));
                    resetFactorial();
                    setFactorialN(nextValue);
                  }}
                  className="w-28 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={runFactorialAuto}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500"
                >
                  Calculate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={stepFactorial}
                  disabled={factorialIsAuto}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Step
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={resetFactorial}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                >
                  Reset
                </motion.button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                  <span>Call stack</span>
                  <span>Top resolves first</span>
                </div>
                <div className="min-h-[320px] rounded-xl border border-white/10 bg-gray-950/60 p-4">
                  <div className="mb-3 text-xs text-gray-500">Top ↑</div>
                  <div className="flex min-h-[250px] flex-col-reverse gap-3 justify-start">
                    <AnimatePresence initial={false}>
                      {currentFactorialStep?.frames.map((frame) => (
                        <motion.div
                          key={frame.value}
                          layout
                          initial={{ opacity: 0, x: 60 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: frame.resolved ? [1, 1.03, 1] : 1,
                          }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.35 }}
                          className={`p-3 rounded-lg border text-sm font-mono ${
                            frame.resolved
                              ? "border-green-500/30 bg-green-500/10 text-green-300"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {frame.resolved ? `factorial(${frame.value}) = ${frame.result}` : `factorial(${frame.value})`}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">Bottom</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Current action</div>
                  <p className="mt-2 text-sm text-gray-200">
                    {currentFactorialStep?.message ?? "Choose Calculate for autoplay or Step through the recursion manually."}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Frames shown</span>
                    <span className="font-mono text-white">{currentFactorialStep?.frames.length ?? 0}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                    <span>Resolved calls</span>
                    <span className="font-mono text-white">
                      {currentFactorialStep?.frames.filter((frame) => frame.resolved).length ?? 0}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                    <span>Final value</span>
                    <span className="font-mono text-green-300">
                      {currentFactorialStep?.frames[0]?.resolved ? currentFactorialStep.frames[0].result : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="nqueens"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span>Board size</span>
                <select
                  value={boardSize}
                  onChange={(event) => resetQueens(Number(event.target.value) as (typeof BOARD_SIZES)[number])}
                  className="w-28 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-white outline-none focus:border-purple-500"
                >
                  {BOARD_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} × {size}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={solveQueens}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500"
                >
                  Solve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={stepQueens}
                  disabled={queenIsAuto}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Step
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={toggleQueensAuto}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-amber-400"
                >
                  {queenIsAuto ? "Pause" : "Auto"}
                </motion.button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div
                  className="mx-auto grid w-fit overflow-hidden rounded-xl border border-white/10"
                  style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 2.5rem))` }}
                >
                  {displayedBoard.map((queenColumn, row) =>
                    displayedBoard.map((_, col) => {
                      const isPlacedQueen = queenColumn === col;
                      const isCandidate = currentQueenStep?.candidate?.row === row && currentQueenStep.candidate.col === col && !isPlacedQueen;
                      const isSafe = currentQueenStep?.highlightSafe?.row === row && currentQueenStep.highlightSafe.col === col;
                      const isConflict = hasPosition(currentQueenStep?.conflictCells ?? [], row, col);
                      const isAttackPath = hasPosition(currentQueenStep?.attackPath ?? [], row, col);
                      const isRemoved = currentQueenStep?.removedQueen?.row === row && currentQueenStep.removedQueen.col === col;

                      const highlightClass = currentQueenStep?.solved && isPlacedQueen
                        ? "ring-2 ring-yellow-400/70 bg-yellow-500/20"
                        : isConflict || isRemoved
                        ? "ring-2 ring-red-400/60 bg-red-500/20"
                        : isSafe
                        ? "ring-2 ring-green-400/60 bg-green-500/20"
                        : isCandidate
                        ? "ring-2 ring-yellow-300/60 bg-yellow-500/20"
                        : isAttackPath
                        ? "bg-red-500/10"
                        : "";

                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`w-10 h-10 flex items-center justify-center border border-white/10 ${(row + col) % 2 === 0 ? "bg-gray-800" : "bg-gray-700"} relative ${highlightClass}`}
                        >
                          <AnimatePresence mode="popLayout" initial={false}>
                            {isPlacedQueen && (
                              <motion.span
                                key={`queen-${row}-${col}`}
                                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                                animate={{
                                  opacity: 1,
                                  scale: currentQueenStep?.solved ? [1, 1.2, 1] : 1,
                                  y: 0,
                                }}
                                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                transition={{ duration: 0.28 }}
                                className={`text-lg ${
                                  currentQueenStep?.solved
                                    ? "text-yellow-300"
                                    : isSafe
                                    ? "text-green-300"
                                    : "text-purple-300"
                                }`}
                              >
                                ♛
                              </motion.span>
                            )}
                            {isCandidate && (
                              <motion.span
                                key={`candidate-${row}-${col}-${isConflict ? "conflict" : "try"}`}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1.05 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.2 }}
                                className={`text-lg ${isConflict ? "text-red-300" : "text-yellow-300"}`}
                              >
                                ♛
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Step count</div>
                      <div className="mt-1 font-mono text-white">{Math.max(queenStepIndex + 1, 0)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Current row</div>
                      <div className="mt-1 font-mono text-white">
                        {currentQueenStep?.solved ? "Complete" : (currentQueenStep?.currentRow ?? 0) + 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">What&apos;s happening</div>
                  <p className="mt-2 text-sm text-gray-200">
                    {currentQueenStep?.message ?? "Use Solve for autoplay, Step for manual progress, or Auto to continue from the current state."}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" />
                      <span>Trying queen placement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-green-400" />
                      <span>Safe queen placement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-red-400" />
                      <span>Conflict / backtracking path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-yellow-300" />
                      <span>Celebration when solved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
