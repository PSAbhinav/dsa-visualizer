"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function QueueVisualizer() {
  const [queue, setQueue] = useState<number[]>([15, 42, 8, 23]);
  const [newValue, setNewValue] = useState("");
  const [dequeuedValue, setDequeuedValue] = useState<number | null>(null);

  const enqueue = () => {
    if (!newValue) return;
    setQueue([...queue, parseInt(newValue)]);
    setNewValue("");
  };

  const dequeue = () => {
    if (queue.length === 0) return;
    setDequeuedValue(queue[0]);
    setQueue(queue.slice(1));
    setTimeout(() => setDequeuedValue(null), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Queue Visualization (FIFO)</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={dequeue}
          disabled={queue.length === 0}
          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 disabled:opacity-50"
        >
          Dequeue
        </motion.button>
      </div>

      {/* Enqueue input */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enqueue()}
          placeholder="Enqueue value..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm border border-white/10 focus:border-purple-500 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={enqueue}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500"
        >
          Enqueue
        </motion.button>
      </div>

      {/* Dequeued notification */}
      <AnimatePresence>
        {dequeuedValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-center"
          >
            <span className="text-red-300 text-sm">Dequeued: <strong>{dequeuedValue}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue visualization */}
      <div className="flex items-center overflow-x-auto pb-4">
        <div className="text-green-400 text-xs font-mono mr-3 shrink-0">
          FRONT →
        </div>
        <div className="flex gap-2">
          <AnimatePresence>
            {queue.map((value, index) => (
              <motion.div
                key={`${value}-${index}`}
                initial={{ opacity: 0, scale: 0, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`px-5 py-4 rounded-xl border-2 transition-colors ${
                  index === 0
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-white/10 bg-purple-500/10"
                }`}
              >
                <span className="text-white font-mono font-bold">{value}</span>
                {index === 0 && (
                  <div className="text-green-400 text-[9px] text-center mt-1">FRONT</div>
                )}
                {index === queue.length - 1 && (
                  <div className="text-purple-400 text-[9px] text-center mt-1">REAR</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="text-purple-400 text-xs font-mono ml-3 shrink-0">
          ← REAR
        </div>
      </div>

      {queue.length === 0 && (
        <div className="h-20 flex items-center justify-center">
          <span className="text-gray-500 text-sm italic">Queue is empty</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-900/50 rounded-xl">
        <p className="text-gray-400 text-xs">
          💡 FIFO: First element enqueued is the first to be dequeued. Like a line at a store!
        </p>
      </div>
    </motion.div>
  );
}
