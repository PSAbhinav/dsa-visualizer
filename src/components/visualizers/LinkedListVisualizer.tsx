"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ListNode {
  value: number;
  id: string;
}

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<ListNode[]>([
    { value: 5, id: "n1" },
    { value: 12, id: "n2" },
    { value: 8, id: "n3" },
    { value: 23, id: "n4" },
    { value: 15, id: "n5" },
  ]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [newValue, setNewValue] = useState("");

  const addNode = () => {
    if (!newValue) return;
    setNodes([...nodes, { value: parseInt(newValue), id: `n${Date.now()}` }]);
    setNewValue("");
  };

  const removeNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index));
  };

  const reverseList = async () => {
    setIsReversing(true);
    const reversed = [...nodes].reverse();
    for (let i = 0; i < nodes.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setHighlightedIndex(i);
    }
    await new Promise((r) => setTimeout(r, 400));
    setNodes(reversed);
    setHighlightedIndex(null);
    setIsReversing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Linked List Visualization</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reverseList}
          disabled={isReversing}
          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50 transition-all"
        >
          {isReversing ? "Reversing..." : "Reverse"}
        </motion.button>
      </div>

      {/* Add node */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm border border-white/10 focus:border-purple-500 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addNode}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500"
        >
          Add
        </motion.button>
      </div>

      {/* Linked list visualization */}
      <div className="flex items-center overflow-x-auto pb-4 gap-0">
        <div className="text-purple-400 text-xs font-mono mr-2 shrink-0">HEAD →</div>
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex items-center shrink-0"
          >
            <motion.div
              animate={{
                borderColor: highlightedIndex === index ? "#eab308" : "rgba(255,255,255,0.1)",
                backgroundColor: highlightedIndex === index ? "rgba(234,179,8,0.1)" : "rgba(107,33,168,0.2)",
              }}
              className="relative flex items-center border-2 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => removeNode(index)}
            >
              {/* Data section */}
              <div className="px-4 py-3 border-r border-white/10">
                <span className="text-white font-mono font-bold">{node.value}</span>
              </div>
              {/* Pointer section */}
              <div className="px-3 py-3">
                <span className="text-purple-400 text-xs font-mono">next</span>
              </div>
              {/* Delete overlay */}
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-red-400 text-xs font-bold">✕</span>
              </div>
            </motion.div>
            {/* Arrow */}
            {index < nodes.length - 1 && (
              <motion.div
                animate={{ color: highlightedIndex === index ? "#eab308" : "#9ca3af" }}
                className="mx-1 text-lg font-bold"
              >
                →
              </motion.div>
            )}
          </motion.div>
        ))}
        <div className="text-red-400 text-xs font-mono ml-2 shrink-0">→ NULL</div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-xl">
        <p className="text-gray-400 text-xs">
          💡 Click on a node to remove it. Each node stores data and a pointer to the next node.
        </p>
      </div>
    </motion.div>
  );
}
