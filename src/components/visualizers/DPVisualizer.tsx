"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function DPVisualizer() {
  const [n, setN] = useState(8);
  const [cells, setCells] = useState<{ value: number; highlighted: boolean }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const runFibonacci = async () => {
    setIsAnimating(true);
    const dp: { value: number; highlighted: boolean }[] = [];

    // Base cases
    dp.push({ value: 0, highlighted: true });
    setCells([...dp]);
    setCurrentStep("Base case: fib(0) = 0");
    await new Promise((r) => setTimeout(r, 600));

    dp.push({ value: 1, highlighted: true });
    setCells([...dp]);
    setCurrentStep("Base case: fib(1) = 1");
    await new Promise((r) => setTimeout(r, 600));

    dp[0].highlighted = false;
    dp[1].highlighted = false;

    for (let i = 2; i <= n; i++) {
      dp[i - 2] = { ...dp[i - 2], highlighted: true };
      dp[i - 1] = { ...dp[i - 1], highlighted: true };
      setCells([...dp]);
      setCurrentStep(`Computing: fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${dp[i - 1].value} + ${dp[i - 2].value}`);
      await new Promise((r) => setTimeout(r, 800));

      dp.push({ value: dp[i - 1].value + dp[i - 2].value, highlighted: true });
      dp[i - 2] = { ...dp[i - 2], highlighted: false };
      dp[i - 1] = { ...dp[i - 1], highlighted: false };
      setCells([...dp]);
      await new Promise((r) => setTimeout(r, 400));
      dp[i] = { ...dp[i], highlighted: false };
      setCells([...dp]);
    }

    // Highlight final answer
    dp[n] = { ...dp[n], highlighted: true };
    setCells([...dp]);
    setCurrentStep(`✅ Result: fib(${n}) = ${dp[n].value}`);
    setIsAnimating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">DP: Fibonacci (Tabulation)</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runFibonacci}
          disabled={isAnimating}
          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50"
        >
          {isAnimating ? "Computing..." : "Run DP"}
        </motion.button>
      </div>

      {/* N selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-400 text-sm">n =</span>
        <input
          type="range"
          min={3}
          max={12}
          value={n}
          onChange={(e) => { setN(Number(e.target.value)); setCells([]); }}
          disabled={isAnimating}
          className="flex-1"
        />
        <span className="text-white font-mono text-sm w-6">{n}</span>
      </div>

      {/* Step description */}
      {currentStep && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
        >
          <span className="text-purple-300 text-sm font-mono">{currentStep}</span>
        </motion.div>
      )}

      {/* DP Table */}
      <div className="flex flex-wrap gap-2 items-end">
        {cells.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              borderColor: cell.highlighted ? "rgba(234, 179, 8, 0.5)" : "rgba(255,255,255,0.1)",
              backgroundColor: cell.highlighted ? "rgba(234, 179, 8, 0.1)" : "rgba(147, 51, 234, 0.1)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center border rounded-lg p-3 min-w-[50px]"
          >
            <span className="text-gray-500 text-[10px] font-mono mb-1">dp[{i}]</span>
            <span className="text-white font-mono font-bold text-lg">{cell.value}</span>
          </motion.div>
        ))}
      </div>

      {cells.length === 0 && (
        <div className="h-32 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Click &quot;Run DP&quot; to visualize Fibonacci computation</span>
        </div>
      )}

      {/* Explanation */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-xl">
        <p className="text-gray-400 text-xs">
          💡 Each cell stores a previously computed value, avoiding redundant recalculations. 
          Yellow = currently being used in computation.
        </p>
      </div>
    </motion.div>
  );
}
