"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type GreedyTab = "activity" | "knapsack";

type Activity = { id: string; start: number; end: number };
type Item = { id: string; weight: number; value: number };

const ACTIVITIES: Activity[] = [
  { id: "A", start: 1, end: 4 },
  { id: "B", start: 3, end: 5 },
  { id: "C", start: 0, end: 6 },
  { id: "D", start: 5, end: 7 },
  { id: "E", start: 8, end: 9 },
  { id: "F", start: 5, end: 9 },
  { id: "G", start: 6, end: 10 },
];

const ITEMS: Item[] = [
  { id: "Gold", weight: 10, value: 60 },
  { id: "Ruby", weight: 20, value: 100 },
  { id: "Emerald", weight: 30, value: 120 },
  { id: "Pearl", weight: 5, value: 40 },
];

const TAB_COPY: Record<GreedyTab, string> = {
  activity: "Choose the next activity that finishes earliest and still fits.",
  knapsack: "Take the best value-to-weight ratio first, then use any remaining capacity fractionally.",
};

export function GreedyVisualizer() {
  const [tab, setTab] = useState<GreedyTab>("activity");
  const [speed, setSpeed] = useState(55);
  const [capacity, setCapacity] = useState("35");
  const [isAnimating, setIsAnimating] = useState(false);
  const [status, setStatus] = useState(TAB_COPY.activity);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [fractions, setFractions] = useState<Record<string, number>>({});
  const [fill, setFill] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const resetVisuals = useCallback(() => {
    setCurrentId(null);
    setSelected([]);
    setRejected([]);
    setFractions({});
    setFill(0);
    setTotalValue(0);
  }, []);

  const handleTabChange = useCallback(
    (nextTab: GreedyTab) => {
      if (isAnimating || nextTab === tab) return;
      resetVisuals();
      setStatus(TAB_COPY[nextTab]);
      setTab(nextTab);
    },
    [isAnimating, resetVisuals, tab]
  );

  const run = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    resetVisuals();
    const delay = Math.max(120, 900 - speed * 7);

    if (tab === "activity") {
      const chosen: string[] = [];
      const skipped: string[] = [];
      let lastEnd = -1;

      for (const activity of [...ACTIVITIES].sort((a, b) => a.end - b.end)) {
        setCurrentId(activity.id);
        setStatus(`Consider ${activity.id} = [${activity.start}, ${activity.end}] against current finish time ${lastEnd}.`);
        await wait(delay);

        if (activity.start >= lastEnd) {
          chosen.push(activity.id);
          lastEnd = activity.end;
          setSelected([...chosen]);
          setStatus(`Select ${activity.id}; it leaves the schedule as open as possible.`);
        } else {
          skipped.push(activity.id);
          setRejected([...skipped]);
          setStatus(`Skip ${activity.id}; it overlaps with the last chosen activity.`);
        }

        await wait(Math.max(100, delay / 2));
      }

      setCurrentId(null);
      setStatus(`Selected set: ${chosen.join(", ")}. Earliest finishing activities maximize the count.`);
      setIsAnimating(false);
      return;
    }

    const maxCapacity = Math.max(1, Number(capacity) || 1);
    let remaining = maxCapacity;
    let collectedValue = 0;
    const nextFractions: Record<string, number> = {};

    for (const item of [...ITEMS].sort((a, b) => b.value / b.weight - a.value / a.weight)) {
      if (remaining <= 0) break;
      const fraction = Math.min(1, remaining / item.weight);
      nextFractions[item.id] = fraction;
      remaining -= item.weight * fraction;
      collectedValue += item.value * fraction;
      setCurrentId(item.id);
      setFractions({ ...nextFractions });
      setFill(((maxCapacity - remaining) / maxCapacity) * 100);
      setTotalValue(collectedValue);
      setStatus(
        fraction === 1
          ? `Take all of ${item.id}; its ratio is one of the highest available.`
          : `Only ${Math.round(fraction * 100)}% of ${item.id} fits, so fill the remaining space fractionally.`
      );
      await wait(delay);
    }

    const finalFill = ((maxCapacity - remaining) / maxCapacity) * 100;
    setCurrentId(null);
    setFill(finalFill);
    setStatus(`Knapsack filled to ${Math.round(finalFill)}% with total value ${collectedValue.toFixed(1)}.`);
    setIsAnimating(false);
  }, [capacity, isAnimating, resetVisuals, speed, tab, wait]);

  const timeScale = 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-yellow-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Greedy Algorithms</h3>
          <p className="text-sm text-gray-400">See how locally optimal choices stack into efficient global solutions.</p>
        </div>
        <div className="flex gap-2">
          {([
            ["activity", "Activity Selection"],
            ["knapsack", "Fractional Knapsack"],
          ] as const).map(([id, label]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(id)}
              disabled={isAnimating}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                tab === id
                  ? "border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
                  : "border-white/10 bg-gray-800 text-gray-400 hover:text-white"
              } disabled:opacity-50`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-4 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-[1fr_auto]">
        {tab === "knapsack" ? (
          <input
            type="number"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-yellow-400/40"
            placeholder="Knapsack capacity"
          />
        ) : (
          <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-gray-300">
            Heuristic: sort by finish time, accept when non-overlapping.
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={run}
          disabled={isAnimating}
          className="rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-yellow-400 disabled:opacity-50"
        >
          {isAnimating ? "Animating..." : "Run Greedy"}
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
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-yellow-400"
        />
      </div>

      {tab === "activity" ? (
        <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4">
          <div className="mb-4 flex justify-between text-xs text-gray-500">
            {Array.from({ length: timeScale + 1 }, (_, index) => (
              <span key={index}>{index}</span>
            ))}
          </div>
          <div className="space-y-3">
            {[...ACTIVITIES].sort((a, b) => a.start - b.start).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-10 text-sm font-semibold text-gray-300">{activity.id}</div>
                <div className="relative h-10 flex-1 rounded-full bg-gray-900">
                  <motion.div
                    layout
                    className={`absolute top-1.5 flex h-7 items-center justify-center rounded-full border text-sm font-medium ${
                      currentId === activity.id
                        ? "border-yellow-300/50 bg-yellow-400/20 text-yellow-100"
                        : selected.includes(activity.id)
                        ? "border-green-400/40 bg-green-500/20 text-green-200"
                        : rejected.includes(activity.id)
                        ? "border-red-400/40 bg-red-500/20 text-red-200"
                        : "border-white/10 bg-gray-800 text-gray-300"
                    }`}
                    style={{ left: `${(activity.start / timeScale) * 100}%`, width: `${((activity.end - activity.start) / timeScale) * 100}%` }}
                  >
                    {activity.start}–{activity.end}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-3">
            {ITEMS.map((item) => {
              const ratio = (item.value / item.weight).toFixed(2);
              const fraction = fractions[item.id] ?? 0;
              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`rounded-2xl border p-4 ${
                    currentId === item.id
                      ? "border-yellow-300/50 bg-yellow-400/15"
                      : fraction > 0
                      ? "border-green-400/40 bg-green-500/15"
                      : "border-white/5 bg-gray-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-white">{item.id}</div>
                      <div className="text-sm text-gray-400">w={item.weight}, v={item.value}, ratio={ratio}</div>
                    </div>
                    <div className="rounded-full bg-gray-900 px-3 py-1 text-sm text-white">{Math.round(fraction * 100)}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4">
            <div className="mb-3 text-sm font-medium text-yellow-200">Knapsack fill</div>
            <div className="mb-4 h-40 overflow-hidden rounded-2xl border border-white/10 bg-gray-900">
              <motion.div
                animate={{ height: `${fill}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                className="mt-auto h-full rounded-b-2xl bg-gradient-to-t from-green-500 to-yellow-400"
              />
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div>Capacity used: {fill.toFixed(0)}%</div>
              <div>Total value: {totalValue.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-yellow-200">Step:</span> {status}
      </div>
    </motion.div>
  );
}
