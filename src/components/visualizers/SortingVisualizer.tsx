"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function SortingVisualizer() {
  const [array, setArray] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => Math.floor(Math.random() * 90) + 10)
  );
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<"merge" | "quick" | "bubble" | "insertion">("merge");
  const [speed, setSpeed] = useState(20);

  const maxVal = Math.max(...array);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const reset = () => {
    setArray(Array.from({ length: 30 }, () => Math.floor(Math.random() * 90) + 10));
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setIsRunning(false);
  };

  const bubbleSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(speed);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setSwapping([j, j + 1]);
          setArray([...arr]);
          await sleep(speed);
          setSwapping([]);
        }
      }
      setSorted((prev) => [...prev, arr.length - 1 - i]);
    }
    setSorted(arr.map((_, i) => i));
  };

  const insertionSort = async () => {
    const arr = [...array];
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      setComparing([i]);
      await sleep(speed);
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        setSwapping([j, j + 1]);
        setArray([...arr]);
        await sleep(speed);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSwapping([]);
      await sleep(speed);
    }
    setSorted(arr.map((_, i) => i));
  };

  const mergeSort = async () => {
    const arr = [...array];

    const merge = async (start: number, mid: number, end: number) => {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        setComparing([start + i, mid + 1 + j]);
        await sleep(speed);
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        setArray([...arr]);
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        setArray([...arr]);
        await sleep(speed);
        i++;
        k++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        setArray([...arr]);
        await sleep(speed);
        j++;
        k++;
      }
    };

    const sort = async (start: number, end: number) => {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      await sort(start, mid);
      await sort(mid + 1, end);
      await merge(start, mid, end);
    };

    await sort(0, arr.length - 1);
    setSorted(arr.map((_, i) => i));
  };

  const quickSort = async () => {
    const arr = [...array];

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        setComparing([j, high]);
        await sleep(speed);
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setSwapping([i, j]);
          setArray([...arr]);
          await sleep(speed);
          setSwapping([]);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      await sleep(speed);
      return i + 1;
    };

    const sort = async (low: number, high: number) => {
      if (low < high) {
        const pi = await partition(low, high);
        setSorted((prev) => [...prev, pi]);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      } else if (low === high) {
        setSorted((prev) => [...prev, low]);
      }
    };

    await sort(0, arr.length - 1);
    setSorted(arr.map((_, i) => i));
  };

  const runSort = async () => {
    setIsRunning(true);
    setComparing([]);
    setSwapping([]);
    setSorted([]);

    switch (algorithm) {
      case "bubble": await bubbleSort(); break;
      case "insertion": await insertionSort(); break;
      case "merge": await mergeSort(); break;
      case "quick": await quickSort(); break;
    }

    setComparing([]);
    setSwapping([]);
    setIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-white font-semibold text-lg">Sorting Algorithms</h3>
        <div className="flex flex-wrap gap-2">
          {(["bubble", "insertion", "merge", "quick"] as const).map((algo) => (
            <motion.button
              key={algo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isRunning && setAlgorithm(algo)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                algorithm === algo
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-gray-700/50 text-gray-400 border border-white/5 hover:border-white/10 hover:text-white"
              }`}
            >
              {algo === "bubble" ? "Bubble Sort" : algo === "insertion" ? "Insertion Sort" : algo === "merge" ? "Merge Sort" : "Quick Sort"}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-gray-600 text-white text-sm disabled:opacity-50"
          >
            Randomize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runSort}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50"
          >
            {isRunning ? "Sorting..." : "Sort!"}
          </motion.button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-400 text-xs">Speed:</span>
        <input
          type="range"
          min={5}
          max={100}
          value={100 - speed}
          onChange={(e) => setSpeed(100 - Number(e.target.value))}
          className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Bars */}
      <div className="flex items-end justify-center gap-[2px] h-64">
        {array.map((value, index) => (
          <motion.div
            key={index}
            className={`flex-1 rounded-t-sm transition-colors duration-100 ${
              sorted.includes(index)
                ? "bg-green-500"
                : swapping.includes(index)
                ? "bg-red-500"
                : comparing.includes(index)
                ? "bg-yellow-400"
                : "bg-purple-500"
            }`}
            style={{ height: `${(value / maxVal) * 100}%` }}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-500" />
          <span className="text-gray-400 text-xs">Unsorted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
          <span className="text-gray-400 text-xs">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-gray-400 text-xs">Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-gray-400 text-xs">Sorted</span>
        </div>
      </div>
    </motion.div>
  );
}
