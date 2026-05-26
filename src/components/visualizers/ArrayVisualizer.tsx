"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ArrayVisualizerProps {
  initialArray?: number[];
}

export function ArrayVisualizer({ initialArray }: ArrayVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray || [38, 27, 43, 3, 9, 82, 10, 64, 15, 51]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const maxVal = Math.max(...array);

  const resetArray = () => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    const newArr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 10);
    setArray(newArr);
    setComparing([]);
    setSorted([]);
    setIsRunning(false);
  };

  const bubbleSort = async () => {
    setIsRunning(true);
    setSorted([]);
    const arr = [...array];
    const animations: { arr: number[]; comparing: number[]; sorted: number[] }[] = [];

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        animations.push({ arr: [...arr], comparing: [j, j + 1], sorted: [] });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          animations.push({ arr: [...arr], comparing: [j, j + 1], sorted: [] });
        }
      }
      animations.push({ arr: [...arr], comparing: [], sorted: Array.from({ length: i + 1 }, (_, k) => arr.length - 1 - k) });
    }
    animations.push({ arr: [...arr], comparing: [], sorted: arr.map((_, i) => i) });

    animations.forEach((frame, idx) => {
      const t = setTimeout(() => {
        setArray(frame.arr);
        setComparing(frame.comparing);
        setSorted(frame.sorted);
        if (idx === animations.length - 1) setIsRunning(false);
      }, idx * speed);
      timeoutRef.current.push(t);
    });
  };

  useEffect(() => {
    return () => timeoutRef.current.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Array Visualization</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetArray}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 disabled:opacity-50 transition-all"
          >
            Randomize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={bubbleSort}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50 transition-all"
          >
            {isRunning ? "Sorting..." : "Sort"}
          </motion.button>
        </div>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-400 text-xs">Speed:</span>
        <input
          type="range"
          min={50}
          max={500}
          value={500 - speed}
          onChange={(e) => setSpeed(500 - Number(e.target.value))}
          className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <span className="text-gray-400 text-xs">{speed < 150 ? "Fast" : speed < 300 ? "Medium" : "Slow"}</span>
      </div>

      {/* Array bars */}
      <div className="flex items-end justify-center gap-1 h-64 px-4">
        {array.map((value, index) => (
          <motion.div
            key={index}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex-1 rounded-t-md flex flex-col items-center justify-end"
            style={{ height: `${(value / maxVal) * 100}%` }}
          >
            <motion.div
              className={`w-full h-full rounded-t-md transition-colors duration-200 ${
                sorted.includes(index)
                  ? "bg-gradient-to-t from-green-600 to-green-400"
                  : comparing.includes(index)
                  ? "bg-gradient-to-t from-yellow-600 to-yellow-400"
                  : "bg-gradient-to-t from-purple-700 to-purple-400"
              }`}
              animate={{
                scale: comparing.includes(index) ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            <span className="absolute -bottom-5 text-[10px] text-gray-400">{value}</span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-purple-500" />
          <span className="text-gray-400 text-xs">Unsorted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span className="text-gray-400 text-xs">Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-gray-400 text-xs">Sorted</span>
        </div>
      </div>
    </motion.div>
  );
}
