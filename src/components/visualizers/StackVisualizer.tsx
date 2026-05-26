"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function StackVisualizer() {
  const [stack, setStack] = useState<number[]>([10, 25, 7, 42]);
  const [newValue, setNewValue] = useState("");
  const [poppedValue, setPoppedValue] = useState<number | null>(null);
  const [isPeeking, setIsPeeking] = useState(false);

  const push = () => {
    if (!newValue) return;
    setStack([...stack, parseInt(newValue)]);
    setNewValue("");
  };

  const pop = () => {
    if (stack.length === 0) return;
    const value = stack[stack.length - 1];
    setPoppedValue(value);
    setStack(stack.slice(0, -1));
    setTimeout(() => setPoppedValue(null), 1500);
  };

  const peek = () => {
    setIsPeeking(true);
    setTimeout(() => setIsPeeking(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Stack Visualization (LIFO)</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={peek}
            disabled={stack.length === 0}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
          >
            Peek
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={pop}
            disabled={stack.length === 0}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 disabled:opacity-50"
          >
            Pop
          </motion.button>
        </div>
      </div>

      {/* Push input */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push()}
          placeholder="Push value..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm border border-white/10 focus:border-purple-500 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={push}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500"
        >
          Push
        </motion.button>
      </div>

      {/* Popped value notification */}
      <AnimatePresence>
        {poppedValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-center"
          >
            <span className="text-red-300 text-sm">Popped: <strong>{poppedValue}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stack visualization */}
      <div className="flex flex-col items-center">
        <div className="text-gray-400 text-xs mb-2">← TOP</div>
        <div className="w-48 border-l-2 border-r-2 border-b-2 border-white/20 rounded-b-lg p-2 min-h-[200px] flex flex-col-reverse gap-1">
          <AnimatePresence>
            {stack.map((value, index) => (
              <motion.div
                key={`${value}-${index}`}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  backgroundColor:
                    isPeeking && index === stack.length - 1
                      ? "rgba(59, 130, 246, 0.3)"
                      : "rgba(147, 51, 234, 0.2)",
                  borderColor:
                    isPeeking && index === stack.length - 1
                      ? "rgba(59, 130, 246, 0.5)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full py-3 rounded-lg border text-center relative"
              >
                <span className="text-white font-mono font-bold">{value}</span>
                {index === stack.length - 1 && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -right-16 top-1/2 -translate-y-1/2 text-purple-400 text-xs"
                  >
                    ← TOP
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {stack.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-sm italic">Stack is empty</span>
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs mt-2">BOTTOM</div>
      </div>
    </motion.div>
  );
}
