"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type SearchMode = "binary" | "linear";

const INITIAL_ARRAY = [6, 10, 15, 19, 24, 30, 35, 41, 48, 54, 61, 69];
const MODE_COPY: Record<SearchMode, string> = {
  binary: "Binary search halves the active range to zero in on the target.",
  linear: "Linear search checks each value from left to right until it finds the target.",
};

const generateArray = () => {
  let value = 4;
  return Array.from({ length: 12 }, () => {
    value += Math.floor(Math.random() * 5) + 2;
    return value;
  });
};

export function SearchingVisualizer() {
  const [array, setArray] = useState<number[]>(INITIAL_ARRAY);
  const [mode, setMode] = useState<SearchMode>("binary");
  const [target, setTarget] = useState(String(INITIAL_ARRAY[Math.floor(INITIAL_ARRAY.length / 2)]));
  const [speed, setSpeed] = useState(55);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 11]);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [status, setStatus] = useState(MODE_COPY.binary);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const resetHighlights = useCallback(() => {
    setCurrentIndex(null);
    setFoundIndex(null);
    setEliminated([]);
    setRange([0, array.length - 1]);
  }, [array.length]);

  const regenerate = useCallback(() => {
    if (isSearching) return;
    const next = generateArray();
    setArray(next);
    setTarget(String(next[Math.floor(next.length / 2)]));
    setCurrentIndex(null);
    setFoundIndex(null);
    setEliminated([]);
    setRange([0, next.length - 1]);
    setStatus("Fresh sorted array ready. Pick a target and watch the search path.");
  }, [isSearching]);

  const handleModeChange = useCallback(
    (nextMode: SearchMode) => {
      if (isSearching || nextMode === mode) return;
      resetHighlights();
      setStatus(MODE_COPY[nextMode]);
      setMode(nextMode);
    },
    [isSearching, mode, resetHighlights]
  );

  const runSearch = useCallback(async () => {
    if (isSearching) return;

    const value = Number(target);
    if (Number.isNaN(value)) {
      setStatus("Enter a valid number target first.");
      return;
    }

    setIsSearching(true);
    resetHighlights();
    const delay = Math.max(120, 900 - speed * 7);

    if (mode === "linear") {
      const seen: number[] = [];
      for (let index = 0; index < array.length; index++) {
        setCurrentIndex(index);
        setRange([index, array.length - 1]);
        setStatus(`Checking index ${index}: is ${array[index]} equal to ${value}?`);
        await wait(delay);

        if (array[index] === value) {
          setFoundIndex(index);
          setStatus(`Found ${value} at index ${index} after scanning ${index + 1} item(s).`);
          setIsSearching(false);
          return;
        }

        seen.push(index);
        setEliminated([...seen]);
      }

      setStatus(`${value} is not in the array, so every element was eliminated.`);
      setIsSearching(false);
      return;
    }

    let left = 0;
    let right = array.length - 1;
    const removed = new Set<number>();

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setRange([left, right]);
      setCurrentIndex(mid);
      setStatus(`Middle index ${mid} holds ${array[mid]}. Compare it with ${value}.`);
      await wait(delay);

      if (array[mid] === value) {
        setFoundIndex(mid);
        setRange([mid, mid]);
        setStatus(`Found ${value} at index ${mid}. Every step cut the search space in half.`);
        setIsSearching(false);
        return;
      }

      if (array[mid] < value) {
        for (let index = left; index <= mid; index++) removed.add(index);
        left = mid + 1;
        setStatus(`${array[mid]} is too small, so discard the left half and continue right.`);
      } else {
        for (let index = mid; index <= right; index++) removed.add(index);
        right = mid - 1;
        setStatus(`${array[mid]} is too large, so discard the right half and continue left.`);
      }

      setEliminated([...removed]);
      await wait(Math.max(100, delay / 2));
    }

    setRange([Math.max(0, left), Math.max(0, right)]);
    setStatus(`${value} is not present. The active range collapsed and the search ends.`);
    setIsSearching(false);
  }, [array, isSearching, mode, resetHighlights, speed, target, wait]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-purple-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Searching Algorithms</h3>
          <p className="text-sm text-gray-400">Track which elements are tested, discarded, or found.</p>
        </div>
        <div className="flex gap-2">
          {(["binary", "linear"] as const).map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleModeChange(option)}
              disabled={isSearching}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                mode === option
                  ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                  : "border-white/10 bg-gray-800 text-gray-400 hover:text-white"
              } disabled:opacity-50`}
            >
              {option === "binary" ? "Binary Search" : "Linear Search"}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          type="number"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="rounded-xl border border-white/10 bg-gray-800 px-4 py-2.5 text-white outline-none ring-0 transition focus:border-purple-400/40"
          placeholder="Target value"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={runSearch}
          disabled={isSearching}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={regenerate}
          disabled={isSearching}
          className="rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
        >
          New Array
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
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
        />
      </div>

      <div className="mb-5 rounded-2xl border border-white/5 bg-gray-800/60 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span>Active range</span>
          <span>
            [{Math.max(0, range[0])}, {Math.max(range[0], range[1])}]
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {array.map((value, index) => {
            const inRange = index >= range[0] && index <= range[1];
            const isEliminated = eliminated.includes(index);
            const isCurrent = currentIndex === index;
            const isFound = foundIndex === index;

            return (
              <motion.div
                key={`${value}-${index}`}
                layout
                animate={{ scale: isCurrent ? 1.06 : 1, opacity: isEliminated ? 0.5 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`rounded-2xl border p-3 text-center ${
                  isFound
                    ? "border-green-400/50 bg-green-500/20 text-green-200"
                    : isCurrent
                    ? "border-yellow-300/50 bg-yellow-400/20 text-yellow-100"
                    : isEliminated
                    ? "border-red-400/40 bg-red-500/20 text-red-200"
                    : inRange
                    ? "border-purple-400/30 bg-purple-500/10 text-white"
                    : "border-white/5 bg-gray-900 text-gray-500"
                }`}
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Index {index}</div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-purple-300">Step:</span> {status}
      </div>
    </motion.div>
  );
}
