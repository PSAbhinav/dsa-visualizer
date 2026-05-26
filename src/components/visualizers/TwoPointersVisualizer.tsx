"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type PointerTab = "container" | "window";

const CONTAINER_HEIGHTS = [1, 8, 6, 2, 5, 4, 8, 3, 7];
const WINDOW_VALUES = [2, 1, 5, 1, 3, 2, 4, 2];

const TAB_COPY: Record<PointerTab, string> = {
  container: "Start with the widest container and move the shorter wall inward.",
  window: "Expand the window until the target is met, then shrink from the left to improve it.",
};

export function TwoPointersVisualizer() {
  const [tab, setTab] = useState<PointerTab>("container");
  const [speed, setSpeed] = useState(55);
  const [target, setTarget] = useState("8");
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(CONTAINER_HEIGHTS.length - 1);
  const [currentMetric, setCurrentMetric] = useState(0);
  const [bestMetric, setBestMetric] = useState(0);
  const [bestRange, setBestRange] = useState<[number, number] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [status, setStatus] = useState(TAB_COPY.container);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const resetVisuals = useCallback(() => {
    setLeft(0);
    setRight(tab === "container" ? CONTAINER_HEIGHTS.length - 1 : 0);
    setCurrentMetric(0);
    setBestMetric(0);
    setBestRange(null);
  }, [tab]);

  const handleTabChange = useCallback(
    (nextTab: PointerTab) => {
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

    if (tab === "container") {
      let l = 0;
      let r = CONTAINER_HEIGHTS.length - 1;
      let bestArea = 0;
      let bestPair: [number, number] | null = null;

      while (l < r) {
        const area = Math.min(CONTAINER_HEIGHTS[l], CONTAINER_HEIGHTS[r]) * (r - l);
        setLeft(l);
        setRight(r);
        setCurrentMetric(area);
        setStatus(`Width ${r - l} × height ${Math.min(CONTAINER_HEIGHTS[l], CONTAINER_HEIGHTS[r])} = area ${area}.`);

        if (area > bestArea) {
          bestArea = area;
          bestPair = [l, r];
          setBestMetric(bestArea);
          setBestRange(bestPair);
        }

        await wait(delay);
        if (CONTAINER_HEIGHTS[l] <= CONTAINER_HEIGHTS[r]) l += 1;
        else r -= 1;
      }

      setStatus(`Best container uses indices ${bestPair?.[0] ?? 0} and ${bestPair?.[1] ?? 0} with area ${bestArea}.`);
      setIsAnimating(false);
      return;
    }

    const goal = Math.max(1, Number(target) || 1);
    let l = 0;
    let sum = 0;
    let bestLength = Number.POSITIVE_INFINITY;
    let bestWindow: [number, number] | null = null;

    for (let r = 0; r < WINDOW_VALUES.length; r++) {
      sum += WINDOW_VALUES[r];
      setLeft(l);
      setRight(r);
      setCurrentMetric(sum);
      setStatus(`Include ${WINDOW_VALUES[r]}. Window sum grows to ${sum}.`);
      await wait(delay);

      while (sum >= goal) {
        if (r - l + 1 < bestLength) {
          bestLength = r - l + 1;
          bestWindow = [l, r];
          setBestMetric(bestLength);
          setBestRange(bestWindow);
        }

        setStatus(`Window sum ${sum} meets target ${goal}, so shrink from the left.`);
        await wait(Math.max(100, delay / 2));
        sum -= WINDOW_VALUES[l];
        l += 1;
        setLeft(l);
        setCurrentMetric(sum);
      }
    }

    setStatus(
      bestWindow
        ? `Shortest qualifying window is [${bestWindow[0]}, ${bestWindow[1]}] with length ${bestLength}.`
        : `No contiguous window reaches target sum ${goal}.`
    );
    setIsAnimating(false);
  }, [isAnimating, resetVisuals, speed, tab, target, wait]);

  const values = tab === "container" ? CONTAINER_HEIGHTS : WINDOW_VALUES;
  const maxValue = Math.max(...values);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-green-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Two Pointers & Sliding Window</h3>
          <p className="text-sm text-gray-400">Watch left and right pointers squeeze the search space.</p>
        </div>
        <div className="flex gap-2">
          {([
            ["container", "Container"],
            ["window", "Sliding Window"],
          ] as const).map(([id, label]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(id)}
              disabled={isAnimating}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                tab === id
                  ? "border-green-400/40 bg-green-500/20 text-green-200"
                  : "border-white/10 bg-gray-800 text-gray-400 hover:text-white"
              } disabled:opacity-50`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-4 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-[1fr_auto_auto]">
        {tab === "window" ? (
          <input
            type="number"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-green-400/40"
            placeholder="Target sum"
          />
        ) : (
          <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-gray-300">
            Problem: Container With Most Water
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={run}
          disabled={isAnimating}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
        >
          {isAnimating ? "Animating..." : "Run"}
        </motion.button>
        <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white">
          {tab === "container" ? `Best area: ${bestMetric}` : `Best length: ${bestRange ? bestMetric : "—"}`}
        </div>
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

      <div className="mb-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4">
        <div className="flex h-72 items-end justify-between gap-2">
          {values.map((value, index) => {
            const inWindow = index >= left && index <= right;
            const isBest = bestRange ? index >= bestRange[0] && index <= bestRange[1] : false;
            const isLeft = index === left;
            const isRight = index === right;

            return (
              <div key={`${value}-${index}`} className="relative flex flex-1 flex-col items-center justify-end">
                {isLeft ? <span className="mb-2 rounded-full bg-blue-500 px-2 py-1 text-[10px] font-semibold text-white">L</span> : <div className="mb-2 h-6" />}
                {isRight ? <span className="mb-2 rounded-full bg-green-500 px-2 py-1 text-[10px] font-semibold text-white">R</span> : <div className="mb-2 h-6" />}
                <motion.div
                  layout
                  animate={{ scaleY: inWindow ? 1.03 : 1 }}
                  className={`flex w-full items-end justify-center rounded-t-2xl border text-sm font-semibold ${
                    isLeft
                      ? "border-blue-400/50 bg-blue-500/30 text-blue-100"
                      : isRight
                      ? "border-green-400/50 bg-green-500/30 text-green-100"
                      : isBest
                      ? "border-purple-400/40 bg-purple-500/20 text-white"
                      : inWindow
                      ? "border-white/10 bg-gray-700 text-white"
                      : "border-white/5 bg-gray-900 text-gray-300"
                  }`}
                  style={{ height: `${(value / maxValue) * 190 + 40}px` }}
                >
                  {value}
                </motion.div>
                <div className="mt-2 text-xs text-gray-500">{index}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
          <span className="font-semibold text-green-300">Current metric:</span> {currentMetric}
        </div>
        <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
          <span className="font-semibold text-green-300">Step:</span> {status}
        </div>
      </div>
    </motion.div>
  );
}
