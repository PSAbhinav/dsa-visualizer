"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type BitOperation = "AND" | "OR" | "XOR" | "LSHIFT" | "RSHIFT";

const getOperationStatus = (operation: BitOperation): string => {
  switch (operation) {
    case "AND":
      return "AND keeps a bit only when both inputs have a 1.";
    case "OR":
      return "OR sets a bit whenever either input contributes a 1.";
    case "XOR":
      return "XOR highlights the positions where the two inputs differ.";
    case "LSHIFT":
      return "Left shift moves bits toward higher significance and fills from the right with 0s.";
    case "RSHIFT":
      return "Right shift moves bits toward lower significance and fills from the left with 0s.";
  }
};

export function BitManipVisualizer() {
  const [a, setA] = useState("29");
  const [b, setB] = useState("13");
  const [operation, setOperation] = useState<BitOperation>("XOR");
  const [speed, setSpeed] = useState(55);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeBit, setActiveBit] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<string[]>(() => Array(8).fill("•"));
  const [status, setStatus] = useState(getOperationStatus("XOR"));

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const toBits = useCallback((value: number) => (value & 255).toString(2).padStart(8, "0"), []);

  const computeResult = useCallback((left: number, right: number, op: BitOperation) => {
    switch (op) {
      case "AND":
        return left & right;
      case "OR":
        return left | right;
      case "XOR":
        return left ^ right;
      case "LSHIFT":
        return (left << (right & 7)) & 255;
      case "RSHIFT":
        return (left & 255) >> (right & 7);
      default:
        return left;
    }
  }, []);

  const resetPreview = useCallback(
    (nextOperation: BitOperation = operation) => {
      setRevealed(Array(8).fill("•"));
      setActiveBit(null);
      setStatus(getOperationStatus(nextOperation));
    },
    [operation]
  );

  const run = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const left = Number(a) || 0;
    const right = Number(b) || 0;
    const leftBits = toBits(left);
    const rightBits = toBits(right);
    const resultBits = toBits(computeResult(left, right, operation));
    const next = Array(8).fill("•");
    const delay = Math.max(120, 900 - speed * 7);

    for (let index = 0; index < 8; index++) {
      next[index] = resultBits[index];
      setRevealed([...next]);
      setActiveBit(index);
      setStatus(
        operation === "LSHIFT" || operation === "RSHIFT"
          ? `Reveal result bit ${index}. Shift amount is ${right & 7}, so positions slide before zero-filling.`
          : `Bit ${index}: ${leftBits[index]} ${operation} ${rightBits[index]} = ${resultBits[index]}.`
      );
      await wait(delay);
    }

    setActiveBit(null);
    setStatus(`Final result: ${left} ${operation === "LSHIFT" ? "<<" : operation === "RSHIFT" ? ">>" : operation} ${right} = ${computeResult(left, right, operation)}.`);
    setIsAnimating(false);
  }, [a, b, computeResult, isAnimating, operation, speed, toBits, wait]);

  const leftValue = Number(a) || 0;
  const rightValue = Number(b) || 0;
  const result = computeResult(leftValue, rightValue, operation);
  const leftBits = toBits(leftValue);
  const rightBits = toBits(rightValue);
  const resultBits = toBits(result);

  const changed = (index: number) => resultBits[index] !== leftBits[index] || (operation !== "LSHIFT" && operation !== "RSHIFT" && resultBits[index] !== rightBits[index]);

  const renderRow = (label: string, bits: string, tone: string, preview = false) => (
    <div className="grid gap-3 md:grid-cols-[90px_1fr] md:items-center">
      <div className={`text-sm font-semibold ${tone}`}>{label}</div>
      <div className="grid grid-cols-8 gap-2">
        {bits.split("").map((bit, index) => (
          <motion.div
            key={`${label}-${index}`}
            layout
            animate={{ scale: activeBit === index ? 1.06 : 1 }}
            className={`flex aspect-square items-center justify-center rounded-xl border text-lg font-bold ${
              activeBit === index
                ? "border-yellow-300/50 bg-yellow-400/20 text-yellow-100"
                : preview && revealed[index] !== "•"
                ? changed(index)
                  ? "border-green-400/40 bg-green-500/20 text-green-100"
                  : "border-blue-400/40 bg-blue-500/20 text-blue-100"
                : "border-white/10 bg-gray-900 text-white"
            }`}
          >
            {preview ? revealed[index] : bit}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-blue-950/20"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Bit Manipulation</h3>
          <p className="text-sm text-gray-400">Reveal the output one bit at a time for classic bitwise operations.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={run}
          disabled={isAnimating}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isAnimating ? "Animating..." : "Animate Bits"}
        </motion.button>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-4">
        <input
          type="number"
          value={a}
          onChange={(event) => {
            setA(event.target.value);
            resetPreview();
          }}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40"
          placeholder="A"
        />
        <input
          type="number"
          value={b}
          onChange={(event) => {
            setB(event.target.value);
            resetPreview();
          }}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40"
          placeholder={operation === "LSHIFT" || operation === "RSHIFT" ? "Shift amount" : "B"}
        />
        <select
          value={operation}
          onChange={(event) => {
            const nextOperation = event.target.value as BitOperation;
            setOperation(nextOperation);
            resetPreview(nextOperation);
          }}
          className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40"
        >
          {(["AND", "OR", "XOR", "LSHIFT", "RSHIFT"] as const).map((op) => (
            <option key={op} value={op}>
              {op === "LSHIFT" ? "Left Shift" : op === "RSHIFT" ? "Right Shift" : op}
            </option>
          ))}
        </select>
        <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white">Decimal result: {result}</div>
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
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-500"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-white/5 bg-gray-800/50 p-4">
        {renderRow("A", leftBits, "text-blue-200")}
        {renderRow(operation === "LSHIFT" || operation === "RSHIFT" ? "Shift" : "B", rightBits, "text-purple-200")}
        {renderRow("Result", resultBits, "text-green-200", true)}
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300">
        <span className="font-semibold text-blue-300">Step:</span> {status}
      </div>
    </motion.div>
  );
}
