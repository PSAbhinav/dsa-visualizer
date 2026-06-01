"use client";

import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { VisualizationStepPanel, type StepTone, type VisualizationStep } from "./VisualizationStepPanel";

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
  const [currentAction, setCurrentAction] = useState("Inspect how each node stores data and a pointer to the next node.");
  const [currentNodeValue, setCurrentNodeValue] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [stepLog, setStepLog] = useState<VisualizationStep[]>([]);
  const stepCounterRef = useRef(0);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addStep = useCallback((action: string, explanation: string, tone: StepTone) => {
    stepCounterRef.current += 1;
    const stepNumber = stepCounterRef.current;

    setStepLog((previous) => [
      ...previous,
      {
        id: `linked-list-step-${stepNumber}`,
        stepNumber,
        action,
        explanation,
        tone,
      },
    ]);
  }, []);

  const addDivider = useCallback((action: string, explanation: string, tone: StepTone = "round") => {
    setStepLog((previous) => [
      ...previous,
      {
        id: `linked-list-divider-${previous.length}-${Date.now()}`,
        action,
        explanation,
        tone,
        isDivider: true,
      },
    ]);
  }, []);

  const clearLog = useCallback(() => {
    stepCounterRef.current = 0;
    setStepLog([]);
  }, []);

  const addNode = () => {
    if (!newValue) {
      return;
    }

    const value = Number.parseInt(newValue, 10);
    if (Number.isNaN(value)) {
      return;
    }

    const nextNodes = [...nodes, { value, id: `n${Date.now()}` }];
    const previousTail = nodes.at(-1);

    if (previousTail) {
      addStep(
        `Traverse to tail ${previousTail.value}`,
        "Appending to a linked list means finding the current tail so its next pointer can be updated.",
        "traverse"
      );
      addStep(
        `Redirect ${previousTail.value}.next to ${value}`,
        `Only the old tail's pointer changes, which is why linked lists excel when inserts can be done with a pointer reference.`,
        "pointer"
      );
    } else {
      addStep(
        `Insert ${value} as head`,
        "An empty list has no head, so the new node becomes both the head and the tail.",
        "insert"
      );
    }

    addStep(
      `Append node ${value}`,
      `The new node stores ${value} and its next pointer is NULL because nothing comes after the tail yet.`,
      "insert"
    );

    setNodes(nextNodes);
    setHighlightedIndex(nextNodes.length - 1);
    setCurrentNodeValue(value);
    setCurrentPath(nextNodes.map((node) => node.value));
    setCurrentAction(`Appended ${value} at the tail.`);
    setNewValue("");
  };

  const removeNode = (index: number) => {
    if (isReversing) {
      return;
    }

    const removedNode = nodes[index];
    if (!removedNode) {
      return;
    }

    const previousNode = nodes[index - 1];
    const nextNode = nodes[index + 1];
    const nextNodes = nodes.filter((_, currentIndex) => currentIndex !== index);

    const nextHighlightIndex = nextNodes.length > 0 ? Math.min(index, nextNodes.length - 1) : null;

    setCurrentNodeValue(removedNode.value);
    setCurrentAction(`Removing node ${removedNode.value}.`);

    if (previousNode) {
      addStep(
        `Traverse to ${previousNode.value}`,
        "To delete a middle node, the list needs the node before it so the next pointer can be rewired safely.",
        "traverse"
      );
      addStep(
        `Set ${previousNode.value}.next to ${nextNode ? nextNode.value : "NULL"}`,
        `${removedNode.value} is bypassed, so it is no longer reachable from the head pointer.`,
        "pointer"
      );
    } else {
      addStep(
        `Move head to ${nextNode ? nextNode.value : "NULL"}`,
        "Deleting the first node changes the head pointer because the list must now start at the next node.",
        "delete"
      );
    }

    addStep(
      `Remove node ${removedNode.value}`,
      `The node's data disappears from the chain, but the rest of the list stays intact because only pointer references changed.`,
      "delete"
    );

    setNodes(nextNodes);
    setCurrentPath(nextNodes.map((node) => node.value));
    setHighlightedIndex(nextHighlightIndex);
    setCurrentNodeValue(nextHighlightIndex !== null ? nextNodes[nextHighlightIndex].value : null);
  };

  const reverseList = async () => {
    if (isReversing) {
      return;
    }

    setIsReversing(true);
    setCurrentAction("Reversing the list one pointer at a time.");
    addDivider(
      "Reversal started",
      "A linked-list reversal must remember where the rest of the list goes before flipping each next pointer, otherwise the remaining nodes would be lost.",
      "round"
    );

    const originalNodes = [...nodes];
    let previousNode: ListNode | null = null;

    for (let index = 0; index < originalNodes.length; index += 1) {
      const currentNode = originalNodes[index];
      setHighlightedIndex(index);
      setCurrentNodeValue(currentNode.value);
      setCurrentPath(originalNodes.slice(0, index + 1).map((node) => node.value));
      addStep(
        `Visit node ${currentNode.value}`,
        "The algorithm advances one node at a time so it never loses track of the remaining unreversed portion.",
        "traverse"
      );
      await sleep(400);
      addStep(
        `Redirect ${currentNode.value}.next to ${previousNode ? previousNode.value : "NULL"}`,
        previousNode
          ? `Pointing ${currentNode.value} back to ${previousNode.value} flips this link while preserving the already reversed prefix.`
          : "The old head becomes the new tail, so its next pointer must become NULL.",
        "pointer"
      );
      await sleep(400);
      previousNode = currentNode;
    }

    const reversedNodes = [...originalNodes].reverse();
    setNodes(reversedNodes);
    setHighlightedIndex(0);
    setCurrentNodeValue(reversedNodes[0]?.value ?? null);
    setCurrentPath(reversedNodes.map((node) => node.value));
    addDivider(
      "Reversal complete",
      `The head now points to ${reversedNodes[0]?.value ?? "NULL"} because every next pointer was flipped in sequence from front to back.`,
      "sorted"
    );
    await sleep(400);
    setHighlightedIndex(null);
    setCurrentNodeValue(null);
    setCurrentAction("Reverse complete.");
    setIsReversing(false);
  };

  const headValue = nodes[0]?.value ?? "NULL";
  const tailValue = nodes.at(-1)?.value ?? "NULL";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Linked List Visualization</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => void reverseList()}
          disabled={isReversing}
          className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white transition-all hover:bg-purple-500 disabled:opacity-50"
        >
          {isReversing ? "Reversing..." : "Reverse"}
        </motion.button>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="number"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          placeholder="Value"
          className="flex-1 rounded-lg border border-white/10 bg-gray-700 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addNode}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500"
        >
          Add
        </motion.button>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-4">
        <div className="mr-2 shrink-0 font-mono text-xs text-purple-400">HEAD →</div>
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex shrink-0 items-center"
          >
            <motion.div
              animate={{
                borderColor: highlightedIndex === index ? "#eab308" : "rgba(255,255,255,0.1)",
                backgroundColor: highlightedIndex === index ? "rgba(234,179,8,0.1)" : "rgba(107,33,168,0.2)",
              }}
              className="group relative flex cursor-pointer items-center overflow-hidden rounded-xl border-2"
              onClick={() => removeNode(index)}
            >
              <div className="border-r border-white/10 px-4 py-3">
                <span className="font-mono font-bold text-white">{node.value}</span>
              </div>
              <div className="px-3 py-3">
                <span className="font-mono text-xs text-purple-400">next</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/0 opacity-0 transition-colors group-hover:bg-red-500/20 group-hover:opacity-100">
                <span className="text-xs font-bold text-red-400">✕</span>
              </div>
            </motion.div>
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
        <div className="ml-2 shrink-0 font-mono text-xs text-red-400">→ NULL</div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Current action</div>
          <div className="mt-2 text-sm font-medium text-white">{currentAction}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Focused node</div>
          <div className="mt-2 text-sm font-medium text-white">{currentNodeValue ?? "None"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Head / tail</div>
          <div className="mt-2 text-sm font-medium text-white">{headValue} → {tailValue}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Traversal path</div>
          <div className="mt-2 text-sm font-medium text-white">{currentPath.length > 0 ? currentPath.join(" → ") : "No active traversal"}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-900/50 p-3">
        <p className="text-xs text-gray-400">
          💡 Click a node to remove it. Each explanation shows how traversal and pointer updates keep the chain connected.
        </p>
      </div>

      <VisualizationStepPanel
        entries={stepLog}
        onClear={clearLog}
        emptyMessage="Add, remove, or reverse nodes to see traversal and pointer-change explanations appear here."
      />
    </motion.div>
  );
}
