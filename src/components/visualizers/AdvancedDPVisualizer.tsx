"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Tab = "knapsack" | "bitmask";
type KnapsackDecision = "unfilled" | "base" | "include" | "exclude";

type KnapsackCell = {
  value: number | null;
  decision: KnapsackDecision;
};

type KnapsackStep = {
  row: number;
  col: number;
  title: string;
  detail: string;
  include: number | null;
  exclude: number | null;
  chosen: "include" | "exclude" | "base" | null;
};

type KnapsackResult = {
  maxValue: number;
  selectedItems: number[];
};

type City = {
  label: string;
  x: number;
  y: number;
};

type TspStep = {
  mask: number;
  city: number;
  cost: number;
  fromMask: number | null;
  fromCity: number | null;
  description: string;
};

type TspData = {
  steps: TspStep[];
  optimalCost: number;
  optimalPath: number[];
  optimalEndCity: number;
};

const KNAPSACK_ITEMS = [
  { weight: 2, value: 3 },
  { weight: 3, value: 4 },
  { weight: 4, value: 5 },
  { weight: 5, value: 6 },
] as const;

const KNAPSACK_CAPACITY = 8;

const CITIES: City[] = [
  { label: "A", x: 150, y: 44 },
  { label: "B", x: 52, y: 142 },
  { label: "C", x: 248, y: 142 },
  { label: "D", x: 150, y: 242 },
];

const DISTANCES = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
] as const;

const GRAPH_EDGES = [
  { from: 0, to: 1, weight: 10 },
  { from: 0, to: 2, weight: 15 },
  { from: 0, to: 3, weight: 20 },
  { from: 1, to: 2, weight: 35 },
  { from: 1, to: 3, weight: 25 },
  { from: 2, to: 3, weight: 30 },
] as const;

const TSP_SAMPLE_MASKS = [1, 3, 7, 15];
const TSP_MASKS = Array.from({ length: 1 << CITIES.length }, (_, mask) => mask).filter((mask) => (mask & 1) === 1);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const formatMask = (mask: number) => mask.toString(2).padStart(CITIES.length, "0");
const popcount = (mask: number) => mask.toString(2).replaceAll("0", "").length;
const edgeKey = (from: number, to: number) => [from, to].sort((a, b) => a - b).join("-");
const getVisitedCities = (mask: number) => CITIES.filter((_, index) => (mask & (1 << index)) !== 0).map((city) => city.label);

const createKnapsackTable = (): KnapsackCell[][] =>
  Array.from({ length: KNAPSACK_ITEMS.length + 1 }, () =>
    Array.from({ length: KNAPSACK_CAPACITY + 1 }, () => ({ value: null, decision: "unfilled" as KnapsackDecision }))
  );

const cloneKnapsackTable = (table: KnapsackCell[][]) => table.map((row) => row.map((cell) => ({ ...cell })));

const createTspTable = (): (number | null)[][] =>
  Array.from({ length: 1 << CITIES.length }, () => Array.from({ length: CITIES.length }, () => null as number | null));

const cloneTspTable = (table: (number | null)[][]) => table.map((row) => [...row]);

function buildTspData(): TspData {
  const fullMask = (1 << CITIES.length) - 1;
  const dp = createTspTable();
  const parent = Array.from({ length: 1 << CITIES.length }, () =>
    Array.from({ length: CITIES.length }, () => null as number | null)
  );
  const steps: TspStep[] = [
    {
      mask: 1,
      city: 0,
      cost: 0,
      fromMask: null,
      fromCity: null,
      description: "Start from city A with bitmask 0001.",
    },
  ];

  dp[1][0] = 0;

  for (let subsetSize = 2; subsetSize <= CITIES.length; subsetSize++) {
    for (const mask of TSP_MASKS.filter((value) => popcount(value) === subsetSize)) {
      for (let city = 1; city < CITIES.length; city++) {
        if ((mask & (1 << city)) === 0) continue;

        const prevMask = mask ^ (1 << city);
        let bestCost = Number.POSITIVE_INFINITY;
        let bestPrevCity: number | null = null;

        for (let prevCity = 0; prevCity < CITIES.length; prevCity++) {
          if ((prevMask & (1 << prevCity)) === 0) continue;
          const prevCost = dp[prevMask][prevCity];
          if (prevCost === null) continue;

          const candidate = prevCost + DISTANCES[prevCity][city];
          if (candidate < bestCost) {
            bestCost = candidate;
            bestPrevCity = prevCity;
          }
        }

        if (bestPrevCity !== null) {
          dp[mask][city] = bestCost;
          parent[mask][city] = bestPrevCity;
          steps.push({
            mask,
            city,
            cost: bestCost,
            fromMask: prevMask,
            fromCity: bestPrevCity,
            description: `${formatMask(prevMask)} → ${formatMask(mask)} by adding ${CITIES[city].label} from ${CITIES[bestPrevCity].label}. Cost = ${bestCost}.`,
          });
        }
      }
    }
  }

  let optimalCost = Number.POSITIVE_INFINITY;
  let optimalEndCity = 0;

  for (let city = 1; city < CITIES.length; city++) {
    const pathCost = dp[fullMask][city];
    if (pathCost === null) continue;

    const totalCost = pathCost + DISTANCES[city][0];
    if (totalCost < optimalCost) {
      optimalCost = totalCost;
      optimalEndCity = city;
    }
  }

  const reversedPath = [optimalEndCity];
  let currentMask = fullMask;
  let currentCity = optimalEndCity;

  while (currentMask !== 1) {
    const prevCity = parent[currentMask][currentCity];
    if (prevCity === null) break;

    currentMask ^= 1 << currentCity;
    currentCity = prevCity;

    if (currentCity !== 0) {
      reversedPath.push(currentCity);
    }
  }

  return {
    steps,
    optimalCost,
    optimalPath: [0, ...reversedPath.reverse(), 0],
    optimalEndCity,
  };
}

const TSP_DATA = buildTspData();

export function AdvancedDPVisualizer() {
  const [activeTab, setActiveTab] = useState<Tab>("knapsack");

  const [knapsackTable, setKnapsackTable] = useState<KnapsackCell[][]>(() => createKnapsackTable());
  const [knapsackCurrentCell, setKnapsackCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [knapsackStep, setKnapsackStep] = useState<KnapsackStep | null>(null);
  const [knapsackOptimalCells, setKnapsackOptimalCells] = useState<string[]>([]);
  const [knapsackSelectedItems, setKnapsackSelectedItems] = useState<number[]>([]);
  const [knapsackResult, setKnapsackResult] = useState<KnapsackResult | null>(null);
  const [knapsackAnimating, setKnapsackAnimating] = useState(false);

  const [tspTable, setTspTable] = useState<(number | null)[][]>(() => createTspTable());
  const [tspCurrentStep, setTspCurrentStep] = useState<TspStep | null>(null);
  const [tspSeenMasks, setTspSeenMasks] = useState<number[]>([]);
  const [tspActiveEdges, setTspActiveEdges] = useState<string[]>([]);
  const [tspOptimalEdges, setTspOptimalEdges] = useState<string[]>([]);
  const [tspOptimalPath, setTspOptimalPath] = useState<number[]>([]);
  const [tspResult, setTspResult] = useState("");
  const [tspAnimating, setTspAnimating] = useState(false);

  const solveKnapsack = async () => {
    if (knapsackAnimating) return;

    setKnapsackAnimating(true);
    setKnapsackTable(createKnapsackTable());
    setKnapsackCurrentCell(null);
    setKnapsackStep(null);
    setKnapsackOptimalCells([]);
    setKnapsackSelectedItems([]);
    setKnapsackResult(null);

    const workingTable = createKnapsackTable();

    for (let row = 0; row <= KNAPSACK_ITEMS.length; row++) {
      for (let col = 0; col <= KNAPSACK_CAPACITY; col++) {
        setKnapsackCurrentCell({ row, col });

        if (row === 0 || col === 0) {
          workingTable[row][col] = { value: 0, decision: "base" };
          setKnapsackStep({
            row,
            col,
            title: "Base case",
            detail: `dp[${row}][${col}] = 0 because we have no items or no capacity yet.`,
            include: null,
            exclude: 0,
            chosen: "base",
          });
        } else {
          const item = KNAPSACK_ITEMS[row - 1];
          const exclude = workingTable[row - 1][col].value ?? 0;

          if (item.weight <= col) {
            const include = item.value + (workingTable[row - 1][col - item.weight].value ?? 0);
            const chooseInclude = include > exclude;

            workingTable[row][col] = {
              value: chooseInclude ? include : exclude,
              decision: chooseInclude ? "include" : "exclude",
            };

            setKnapsackStep({
              row,
              col,
              title: `Include item ${row}?`,
              detail: `include = ${item.value} + dp[${row - 1}][${col - item.weight}] = ${include}, exclude = dp[${row - 1}][${col}] = ${exclude}. Choose ${chooseInclude ? "include" : "exclude"}.`,
              include,
              exclude,
              chosen: chooseInclude ? "include" : "exclude",
            });
          } else {
            workingTable[row][col] = { value: exclude, decision: "exclude" };
            setKnapsackStep({
              row,
              col,
              title: `Include item ${row}?`,
              detail: `No — item ${row} has weight ${item.weight}, which is heavier than capacity ${col}. Carry over ${exclude}.`,
              include: null,
              exclude,
              chosen: "exclude",
            });
          }
        }

        setKnapsackTable(cloneKnapsackTable(workingTable));
        await sleep(row === 0 || col === 0 ? 140 : 280);
      }
    }

    setKnapsackCurrentCell(null);

    const optimalCells: string[] = [];
    const selectedItems: number[] = [];
    let row: number = KNAPSACK_ITEMS.length;
    let col: number = KNAPSACK_CAPACITY;

    while (row >= 0 && col >= 0) {
      optimalCells.push(`${row}-${col}`);
      setKnapsackOptimalCells([...optimalCells]);

      if (row === 0 || col === 0) {
        break;
      }

      const cell = workingTable[row][col];
      if (cell.decision === "include") {
        const itemIndex = row - 1;
        const item = KNAPSACK_ITEMS[itemIndex];
        selectedItems.unshift(itemIndex);
        setKnapsackSelectedItems([...selectedItems]);
        setKnapsackStep({
          row,
          col,
          title: "Tracing optimal path",
          detail: `Take item ${row} (w=${item.weight}, v=${item.value}) and move to dp[${row - 1}][${col - item.weight}].`,
          include: cell.value,
          exclude: workingTable[row - 1][col].value ?? 0,
          chosen: "include",
        });
        await sleep(420);
        row -= 1;
        col -= item.weight;
      } else {
        setKnapsackStep({
          row,
          col,
          title: "Tracing optimal path",
          detail: `Skip item ${row} and move straight up to dp[${row - 1}][${col}].`,
          include: null,
          exclude: workingTable[row - 1][col].value ?? 0,
          chosen: "exclude",
        });
        await sleep(420);
        row -= 1;
      }
    }

    const maxValue = workingTable[KNAPSACK_ITEMS.length][KNAPSACK_CAPACITY].value ?? 0;
    setKnapsackSelectedItems(selectedItems);
    setKnapsackResult({ maxValue, selectedItems });
    setKnapsackStep({
      row: KNAPSACK_ITEMS.length,
      col: KNAPSACK_CAPACITY,
      title: "Optimal solution",
      detail: `Maximum value = ${maxValue}. Selected items: ${selectedItems.map((index) => `#${index + 1}`).join(", ") || "none"}.`,
      include: null,
      exclude: null,
      chosen: null,
    });
    setKnapsackAnimating(false);
  };

  const solveTsp = async () => {
    if (tspAnimating) return;

    setTspAnimating(true);
    setTspTable(createTspTable());
    setTspCurrentStep(null);
    setTspSeenMasks([]);
    setTspActiveEdges([]);
    setTspOptimalEdges([]);
    setTspOptimalPath([]);
    setTspResult("");

    const workingTable = createTspTable();
    const seenMasks: number[] = [];

    for (const step of TSP_DATA.steps) {
      workingTable[step.mask][step.city] = step.cost;
      if (!seenMasks.includes(step.mask)) {
        seenMasks.push(step.mask);
      }

      setTspSeenMasks([...seenMasks]);
      setTspTable(cloneTspTable(workingTable));
      setTspCurrentStep(step);
      setTspActiveEdges(step.fromCity === null ? [] : [edgeKey(step.fromCity, step.city)]);
      await sleep(step.fromCity === null ? 500 : 720);
    }

    const optimalEdges: string[] = [];
    const visiblePath = [TSP_DATA.optimalPath[0]];

    for (let index = 0; index < TSP_DATA.optimalPath.length - 1; index++) {
      const from = TSP_DATA.optimalPath[index];
      const to = TSP_DATA.optimalPath[index + 1];
      optimalEdges.push(edgeKey(from, to));
      visiblePath.push(to);

      setTspOptimalEdges([...optimalEdges]);
      setTspOptimalPath([...visiblePath]);
      setTspCurrentStep({
        mask: (1 << CITIES.length) - 1,
        city: to,
        cost: TSP_DATA.optimalCost,
        fromMask: null,
        fromCity: null,
        description: `Tracing optimal tour: ${visiblePath.map((city) => CITIES[city].label).join(" → ")}`,
      });
      await sleep(420);
    }

    setTspActiveEdges([]);
    setTspCurrentStep({
      mask: (1 << CITIES.length) - 1,
      city: TSP_DATA.optimalEndCity,
      cost: TSP_DATA.optimalCost,
      fromMask: null,
      fromCity: null,
      description: `Optimal tour found: ${TSP_DATA.optimalPath.map((city) => CITIES[city].label).join(" → ")} with total cost ${TSP_DATA.optimalCost}.`,
    });
    setTspResult(`${TSP_DATA.optimalPath.map((city) => CITIES[city].label).join(" → ")} (cost ${TSP_DATA.optimalCost})`);
    setTspAnimating(false);
  };

  const getKnapsackCellClass = (row: number, col: number, cell: KnapsackCell) => {
    const key = `${row}-${col}`;

    if (knapsackOptimalCells.includes(key)) {
      return "border-amber-500 bg-amber-500/20 text-amber-300";
    }

    if (knapsackCurrentCell?.row === row && knapsackCurrentCell?.col === col) {
      return "border-blue-500 bg-blue-500/20 text-blue-300";
    }

    if (cell.decision === "unfilled") {
      return "bg-gray-800/50 text-gray-500";
    }

    if (cell.decision === "include") {
      return "border-emerald-500/40 bg-emerald-500/20 text-emerald-300";
    }

    if (cell.decision === "exclude") {
      return "bg-gray-700/80 text-gray-200";
    }

    return "bg-gray-800 text-white";
  };

  const getTspCellClass = (mask: number, city: number, value: number | null) => {
    if (tspCurrentStep?.mask === mask && tspCurrentStep.city === city) {
      return "border-blue-500 bg-blue-500/20 text-blue-300";
    }

    if (mask === (1 << CITIES.length) - 1 && city === TSP_DATA.optimalEndCity && tspResult) {
      return "border-amber-500 bg-amber-500/20 text-amber-300";
    }

    if (value === null) {
      return "bg-gray-800/50 text-gray-500";
    }

    return "bg-gray-800 text-white";
  };

  const isBusy = knapsackAnimating || tspAnimating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">Advanced Dynamic Programming</h3>
          <p className="text-sm text-gray-400">Compare a classic 2D DP table with subset-based bitmask states.</p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-gray-800/70 p-1">
          {([
            ["knapsack", "0/1 Knapsack"],
            ["bitmask", "Bitmask DP"],
          ] as const).map(([tab, label]) => (
            <motion.button
              key={tab}
              whileHover={{ scale: isBusy ? 1 : 1.02 }}
              whileTap={{ scale: isBusy ? 1 : 0.98 }}
              onClick={() => setActiveTab(tab)}
              disabled={isBusy}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-gray-400 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6"
      >
        {activeTab === "knapsack" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-gray-800 px-3 py-1 text-xs font-mono text-gray-300">
                    Capacity = {KNAPSACK_CAPACITY}
                  </span>
                  <span className="rounded-full border border-white/10 bg-gray-800 px-3 py-1 text-xs font-mono text-gray-300">
                    Rows: 0..{KNAPSACK_ITEMS.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {KNAPSACK_ITEMS.map((item, index) => {
                    const selected = knapsackSelectedItems.includes(index);
                    return (
                      <motion.div
                        key={index}
                        layout
                        className={`rounded-xl border p-3 ${
                          selected
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-white/10 bg-gray-800/60"
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Item {index + 1}</div>
                        <div className="mt-2 text-sm text-white">weight: {item.weight}</div>
                        <div className="text-sm text-white">value: {item.value}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: knapsackAnimating ? 1 : 1.03 }}
                whileTap={{ scale: knapsackAnimating ? 1 : 0.97 }}
                onClick={solveKnapsack}
                disabled={knapsackAnimating}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {knapsackAnimating ? "Solving..." : "Solve"}
              </motion.button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-950/50 p-4">
                <div className="mb-2 flex items-center gap-1">
                  <div className="w-14 text-center text-xs font-mono text-gray-500">i \ w</div>
                  {Array.from({ length: KNAPSACK_CAPACITY + 1 }, (_, capacityValue) => (
                    <div key={capacityValue} className="w-10 text-center text-xs font-mono text-gray-400">
                      {capacityValue}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {knapsackTable.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-1">
                      <div className="w-14 text-center text-xs font-mono text-gray-400">{rowIndex}</div>
                      {row.map((cell, colIndex) => (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          layout
                          animate={{ scale: knapsackCurrentCell?.row === rowIndex && knapsackCurrentCell.col === colIndex ? 1.04 : 1 }}
                          className={`w-10 h-10 flex items-center justify-center border border-white/10 text-xs font-mono rounded-md ${getKnapsackCellClass(
                            rowIndex,
                            colIndex,
                            cell
                          )}`}
                        >
                          {cell.value ?? "·"}
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  key={knapsackStep ? `${knapsackStep.row}-${knapsackStep.col}-${knapsackStep.detail}` : "knapsack-empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-gray-800/60 p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Decision</div>
                  <div className="mt-2 text-sm font-semibold text-white">{knapsackStep?.title ?? "Waiting to solve"}</div>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    {knapsackStep?.detail ?? "Click Solve to fill the 2D DP table cell by cell."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
                      include: {knapsackStep?.include ?? "N/A"}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gray-900/70 p-3 text-gray-200">
                      exclude: {knapsackStep?.exclude ?? "N/A"}
                    </div>
                  </div>
                </motion.div>

                <div className="rounded-2xl border border-white/10 bg-gray-800/60 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Legend</div>
                  <div className="grid gap-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-blue-500/30 border border-blue-500" /> Current cell</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-emerald-500/30 border border-emerald-500" /> Include chosen</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-gray-700 border border-white/10" /> Exclude chosen</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-amber-500/30 border border-amber-500" /> Optimal traceback</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gray-800/60 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Final answer</div>
                  <div className="mt-2 text-lg font-semibold text-white">Max value: {knapsackResult?.maxValue ?? "—"}</div>
                  <div className="mt-2 text-sm text-gray-300">
                    Selected items: {knapsackResult ? knapsackResult.selectedItems.map((index) => `#${index + 1}`).join(", ") || "none" : "Not solved yet"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {TSP_SAMPLE_MASKS.map((mask) => {
                    const isCurrent = tspCurrentStep?.mask === mask;
                    const isSeen = tspSeenMasks.includes(mask);
                    return (
                      <motion.div
                        key={mask}
                        layout
                        className={`rounded-full border px-3 py-1 text-xs font-mono ${
                          isCurrent
                            ? "border-blue-500 bg-blue-500/20 text-blue-300"
                            : isSeen
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-gray-800 text-gray-400"
                        }`}
                      >
                        {formatMask(mask)}
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-400">Subset ladder preview: 0001 → 0011 → 0111 → 1111</p>
              </div>

              <motion.button
                whileHover={{ scale: tspAnimating ? 1 : 1.03 }}
                whileTap={{ scale: tspAnimating ? 1 : 0.97 }}
                onClick={solveTsp}
                disabled={tspAnimating}
                className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tspAnimating ? "Solving TSP..." : "Solve TSP"}
              </motion.button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_1.2fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-gray-950/50 p-4">
                  <svg viewBox="0 0 300 286" className="h-[286px] w-full">
                    {GRAPH_EDGES.map((edge) => {
                      const from = CITIES[edge.from];
                      const to = CITIES[edge.to];
                      const key = edgeKey(edge.from, edge.to);
                      const active = tspActiveEdges.includes(key);
                      const optimal = tspOptimalEdges.includes(key);
                      const midX = (from.x + to.x) / 2;
                      const midY = (from.y + to.y) / 2;

                      return (
                        <motion.g key={key}>
                          <motion.line
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            animate={{
                              stroke: optimal ? "#f59e0b" : active ? "#60a5fa" : "rgba(255,255,255,0.22)",
                              strokeWidth: optimal ? 4 : active ? 3 : 1.5,
                            }}
                          />
                          <text x={midX} y={midY - 6} textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="monospace">
                            {edge.weight}
                          </text>
                        </motion.g>
                      );
                    })}

                    {CITIES.map((city, index) => {
                      const current = tspCurrentStep?.city === index;
                      const optimal = tspOptimalPath.includes(index);

                      return (
                        <motion.g key={city.label}>
                          <motion.circle
                            cx={city.x}
                            cy={city.y}
                            r={24}
                            animate={{
                              fill: optimal ? "rgba(245, 158, 11, 0.22)" : current ? "rgba(96, 165, 250, 0.2)" : "rgba(31, 41, 55, 0.9)",
                              stroke: optimal ? "#f59e0b" : current ? "#60a5fa" : "rgba(255,255,255,0.25)",
                              scale: current ? [1, 1.08, 1] : 1,
                            }}
                            transition={{ duration: 0.35 }}
                            strokeWidth="2"
                          />
                          <text x={city.x} y={city.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                            {city.label}
                          </text>
                        </motion.g>
                      );
                    })}
                  </svg>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gray-800/60 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Distance matrix</div>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-12" />
                        {CITIES.map((city) => (
                          <div key={city.label} className="w-10 text-center text-xs font-mono text-gray-400">
                            {city.label}
                          </div>
                        ))}
                      </div>
                      {DISTANCES.map((row, rowIndex) => (
                        <div key={CITIES[rowIndex].label} className="flex items-center gap-1">
                          <div className="w-12 text-center text-xs font-mono text-gray-400">{CITIES[rowIndex].label}</div>
                          {row.map((distance, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="w-10 rounded-md bg-gray-900/70 py-2 text-center text-xs font-mono text-white">
                              {distance}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  key={tspCurrentStep ? `${tspCurrentStep.mask}-${tspCurrentStep.city}-${tspCurrentStep.description}` : "tsp-empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-gray-800/60 p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">Current state</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-gray-900/70 p-3">
                      <div className="text-xs font-mono text-gray-500">bitmask</div>
                      <div className="mt-1 text-lg font-semibold text-white">{tspCurrentStep ? formatMask(tspCurrentStep.mask) : "----"}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gray-900/70 p-3">
                      <div className="text-xs font-mono text-gray-500">visited</div>
                      <div className="mt-1 text-sm text-white">{tspCurrentStep ? getVisitedCities(tspCurrentStep.mask).join(", ") : "—"}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gray-900/70 p-3">
                      <div className="text-xs font-mono text-gray-500">current city</div>
                      <div className="mt-1 text-lg font-semibold text-white">{tspCurrentStep ? CITIES[tspCurrentStep.city].label : "—"}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    {tspCurrentStep?.description ?? "Click Solve TSP to animate subset states and dp[mask][city] transitions."}
                  </p>
                </motion.div>

                <div className="rounded-2xl border border-white/10 bg-gray-950/50 p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {TSP_MASKS.map((mask) => (
                      <span
                        key={mask}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-mono ${
                          tspCurrentStep?.mask === mask
                            ? "border-blue-500 bg-blue-500/20 text-blue-300"
                            : tspSeenMasks.includes(mask)
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-gray-800 text-gray-500"
                        }`}
                      >
                        {formatMask(mask)}
                      </span>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <div className="mb-2 flex items-center gap-1">
                        <div className="w-16 text-center text-xs font-mono text-gray-500">mask</div>
                        {CITIES.map((city) => (
                          <div key={city.label} className="w-14 text-center text-xs font-mono text-gray-400">
                            {city.label}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        {TSP_MASKS.map((mask) => (
                          <div key={mask} className="flex items-center gap-1">
                            <div className="w-16 text-center text-xs font-mono text-gray-400">{formatMask(mask)}</div>
                            {CITIES.map((city, cityIndex) => (
                              <div
                                key={`${mask}-${city.label}`}
                                className={`w-14 h-10 flex items-center justify-center border border-white/10 text-xs font-mono rounded-md ${getTspCellClass(
                                  mask,
                                  cityIndex,
                                  tspTable[mask][cityIndex]
                                )}`}
                              >
                                {tspTable[mask][cityIndex] ?? "·"}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gray-800/60 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Optimal tour</div>
                  <div className="mt-2 text-lg font-semibold text-white">{tspResult || "Not solved yet"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
