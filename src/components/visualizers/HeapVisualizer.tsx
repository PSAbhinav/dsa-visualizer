"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type HeapItem = {
  id: number;
  value: number;
};

type HeapTab = "insert" | "extract" | "build";

const DEFAULT_HEAP_VALUES = [50, 30, 40, 10, 20, 35, 25];
const TREE_WIDTH = 760;
const TREE_HEIGHT = 320;
const NODE_SIZE = 40;
const TAB_OPTIONS: { id: HeapTab; label: string; description: string }[] = [
  {
    id: "insert",
    label: "Insert",
    description: "Add a new value at the end, then bubble it up until the max-heap property is restored.",
  },
  {
    id: "extract",
    label: "Extract Max",
    description: "Remove the root, move the last element to the top, then sift it down.",
  },
  {
    id: "build",
    label: "Build Heap",
    description: "Transform an arbitrary array into a max-heap by heapifying from the bottom up.",
  },
];

let nextHeapNodeId = 0;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createHeap(values: number[]): HeapItem[] {
  return values.map((value) => ({ id: nextHeapNodeId++, value }));
}

function swapItems(items: HeapItem[], firstIndex: number, secondIndex: number) {
  const nextItems = [...items];
  [nextItems[firstIndex], nextItems[secondIndex]] = [nextItems[secondIndex], nextItems[firstIndex]];
  return nextItems;
}

function getTreePosition(index: number) {
  const level = Math.floor(Math.log2(index + 1));
  const nodesOnLevel = 2 ** level;
  const indexInLevel = index - (nodesOnLevel - 1);

  return {
    x: ((indexInLevel + 1) * TREE_WIDTH) / (nodesOnLevel + 1),
    y: 44 + level * 86,
  };
}

export function HeapVisualizer() {
  const [activeTab, setActiveTab] = useState<HeapTab>("insert");
  const [heap, setHeap] = useState<HeapItem[]>(() => createHeap(DEFAULT_HEAP_VALUES));
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [swapIds, setSwapIds] = useState<number[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [lastExtracted, setLastExtracted] = useState<number | null>(null);
  const [status, setStatus] = useState(
    "Max-heap property: every parent node should be greater than or equal to its children."
  );

  const clearHighlights = () => {
    setCurrentId(null);
    setCompareIds([]);
    setSwapIds([]);
    setRemovingId(null);
  };

  const focusIndices = (items: HeapItem[], currentIndex: number, childIndices: number[] = []) => {
    setCurrentId(items[currentIndex]?.id ?? null);
    setCompareIds(
      childIndices
        .filter((index) => index >= 0 && index < items.length)
        .map((index) => items[index].id)
    );
  };

  const siftDown = async (items: HeapItem[], startIndex: number) => {
    let nextItems = [...items];
    let currentIndex = startIndex;

    while (currentIndex < nextItems.length) {
      const leftChildIndex = currentIndex * 2 + 1;
      const rightChildIndex = currentIndex * 2 + 2;

      if (leftChildIndex >= nextItems.length) {
        setCurrentId(nextItems[currentIndex]?.id ?? null);
        setCompareIds([]);
        setStatus(`${nextItems[currentIndex]?.value ?? "Node"} reached a leaf, so this branch already satisfies the heap property.`);
        await sleep(600);
        break;
      }

      const childIndices = [leftChildIndex, rightChildIndex].filter((index) => index < nextItems.length);
      focusIndices(nextItems, currentIndex, childIndices);

      const largestChildIndex =
        rightChildIndex < nextItems.length && nextItems[rightChildIndex].value > nextItems[leftChildIndex].value
          ? rightChildIndex
          : leftChildIndex;

      const parentValue = nextItems[currentIndex].value;
      const childValues = childIndices.map((index) => nextItems[index].value).join(" and ");
      setStatus(`Compare parent ${parentValue} with child${childIndices.length > 1 ? "ren" : ""} ${childValues}.`);
      await sleep(700);

      if (nextItems[currentIndex].value >= nextItems[largestChildIndex].value) {
        setStatus(
          `Parent ${nextItems[currentIndex].value} is already greater than or equal to its largest child ${nextItems[largestChildIndex].value}.`
        );
        await sleep(700);
        break;
      }

      setSwapIds([nextItems[currentIndex].id, nextItems[largestChildIndex].id]);
      setStatus(
        `Swap ${nextItems[currentIndex].value} with the larger child ${nextItems[largestChildIndex].value} to restore the max-heap property.`
      );
      await sleep(300);

      nextItems = swapItems(nextItems, currentIndex, largestChildIndex);
      setHeap(nextItems);
      await sleep(900);

      setSwapIds([]);
      currentIndex = largestChildIndex;
    }

    return nextItems;
  };

  const handleInsert = async () => {
    if (isAnimating || inputValue.trim() === "") return;

    const parsedValue = Number.parseInt(inputValue, 10);
    if (Number.isNaN(parsedValue)) return;

    setIsAnimating(true);
    setLastExtracted(null);
    clearHighlights();

    let nextItems = [...heap, { id: nextHeapNodeId++, value: parsedValue }];
    setHeap(nextItems);
    setInputValue("");
    setCurrentId(nextItems[nextItems.length - 1].id);
    setStatus(`Inserted ${parsedValue} at the end of the array. Bubble it up while child > parent.`);
    await sleep(850);

    let currentIndex = nextItems.length - 1;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      focusIndices(nextItems, currentIndex, [parentIndex]);
      setStatus(`Compare child ${nextItems[currentIndex].value} with parent ${nextItems[parentIndex].value}.`);
      await sleep(700);

      if (nextItems[parentIndex].value >= nextItems[currentIndex].value) {
        setStatus(
          `Parent ${nextItems[parentIndex].value} is already greater than or equal to child ${nextItems[currentIndex].value}.`
        );
        await sleep(700);
        break;
      }

      setSwapIds([nextItems[currentIndex].id, nextItems[parentIndex].id]);
      setStatus(`Swap ${nextItems[currentIndex].value} upward because it is larger than ${nextItems[parentIndex].value}.`);
      await sleep(300);

      nextItems = swapItems(nextItems, currentIndex, parentIndex);
      setHeap(nextItems);
      await sleep(900);

      setSwapIds([]);
      currentIndex = parentIndex;
    }

    setCurrentId(nextItems[currentIndex]?.id ?? null);
    setCompareIds([]);
    setStatus("Insert complete. Every parent node is again greater than or equal to its children.");
    await sleep(700);

    clearHighlights();
    setIsAnimating(false);
  };

  const handleExtract = async () => {
    if (isAnimating || heap.length === 0) return;

    setIsAnimating(true);
    clearHighlights();

    const extractedRoot = heap[0];
    setLastExtracted(extractedRoot.value);
    setRemovingId(extractedRoot.id);
    setCurrentId(extractedRoot.id);
    setStatus(`Extracting ${extractedRoot.value} from the root of the max-heap.`);
    await sleep(750);

    if (heap.length === 1) {
      setHeap([]);
      setStatus(`Removed ${extractedRoot.value}. The heap is now empty.`);
      await sleep(700);
      clearHighlights();
      setIsAnimating(false);
      return;
    }

    const lastItem = heap[heap.length - 1];
    let nextItems = heap.slice(0, -1);
    nextItems[0] = lastItem;

    setRemovingId(null);
    setHeap(nextItems);
    setCurrentId(lastItem.id);
    setStatus(`Moved the last element ${lastItem.value} to the root. Now sift it down.`);
    await sleep(900);

    nextItems = await siftDown(nextItems, 0);
    setHeap(nextItems);
    setCompareIds([]);
    setStatus(`Extract complete. Removed ${extractedRoot.value} and restored the max-heap property.`);
    await sleep(700);

    clearHighlights();
    setIsAnimating(false);
  };

  const handleRandomize = () => {
    if (isAnimating) return;

    const randomValues = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 10);
    setHeap(createHeap(randomValues));
    setLastExtracted(null);
    clearHighlights();
    setStatus("Random array created. Click Heapify to transform it into a max-heap.");
  };

  const handleHeapify = async () => {
    if (isAnimating || heap.length < 2) return;

    setIsAnimating(true);
    setLastExtracted(null);
    clearHighlights();

    let nextItems = [...heap];
    setStatus("Heapify starts at the last internal node and sifts each subtree down.");
    await sleep(700);

    for (let index = Math.floor(nextItems.length / 2) - 1; index >= 0; index -= 1) {
      focusIndices(nextItems, index, [index * 2 + 1, index * 2 + 2]);
      setStatus(`Heapifying subtree rooted at index ${index} with value ${nextItems[index].value}.`);
      await sleep(700);
      nextItems = await siftDown(nextItems, index);
    }

    setHeap(nextItems);
    setStatus("Heapify complete. The array now satisfies the max-heap property everywhere.");
    await sleep(700);

    clearHighlights();
    setIsAnimating(false);
  };

  const isValidHeap = heap.every((item, index) => {
    if (index === 0) return true;
    return heap[Math.floor((index - 1) / 2)].value >= item.value;
  });

  const focusedIndex = currentId === null ? -1 : heap.findIndex((item) => item.id === currentId);
  const focusedParentIndex = focusedIndex > 0 ? Math.floor((focusedIndex - 1) / 2) : -1;
  const focusedLeftIndex = focusedIndex >= 0 ? focusedIndex * 2 + 1 : -1;
  const focusedRightIndex = focusedIndex >= 0 ? focusedIndex * 2 + 2 : -1;

  const relationLabelForIndex = (index: number) => {
    if (index === focusedIndex) return "CURRENT";
    if (index === focusedParentIndex) return "PARENT";
    if (index === focusedLeftIndex) return "LEFT";
    if (index === focusedRightIndex) return "RIGHT";
    if (index === 0) return "ROOT";
    return "";
  };

  const toneForItem = (itemId: number, index: number) => {
    if (removingId === itemId) {
      return "border-slate-500 bg-slate-500/20";
    }
    if (swapIds.includes(itemId)) {
      return "border-red-400 bg-red-500/30";
    }
    if (currentId === itemId) {
      return "border-sky-400 bg-sky-500/20";
    }
    if (compareIds.includes(itemId)) {
      return "border-emerald-400 bg-emerald-500/20";
    }
    if (index === 0) {
      return "border-amber-400 bg-amber-500/20";
    }
    return "border-white/15 bg-white/5";
  };

  const tabDescription = TAB_OPTIONS.find((option) => option.id === activeTab)?.description ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-white font-semibold text-xl">Heap Visualization</h3>
          <p className="text-sm text-gray-400 mt-1">Max-heap / priority queue operations with synchronized array and tree views.</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
          Heap property: parent ≥ children
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TAB_OPTIONS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: isAnimating ? 1 : 1.03 }}
            whileTap={{ scale: isAnimating ? 1 : 0.97 }}
            onClick={() => {
              if (isAnimating) return;
              setActiveTab(tab.id);
              setStatus(tab.description);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              activeTab === tab.id
                ? "bg-blue-500/20 border-blue-400 text-blue-200"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            } ${isAnimating ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white">{TAB_OPTIONS.find((tab) => tab.id === activeTab)?.label}</p>
            <p className="text-xs text-gray-400 mt-1">{tabDescription}</p>
          </div>

          {activeTab === "insert" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="number"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleInsert();
                  }
                }}
                disabled={isAnimating}
                placeholder="Value to insert"
                className="w-full sm:w-40 rounded-xl border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-400 disabled:opacity-60"
              />
              <motion.button
                whileHover={{ scale: isAnimating ? 1 : 1.03 }}
                whileTap={{ scale: isAnimating ? 1 : 0.97 }}
                onClick={() => void handleInsert()}
                disabled={isAnimating}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                Insert
              </motion.button>
            </div>
          )}

          {activeTab === "extract" && (
            <motion.button
              whileHover={{ scale: isAnimating ? 1 : 1.03 }}
              whileTap={{ scale: isAnimating ? 1 : 0.97 }}
              onClick={() => void handleExtract()}
              disabled={isAnimating || heap.length === 0}
              className="px-4 py-2 rounded-xl bg-amber-500 text-gray-950 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
            >
              Extract Max
            </motion.button>
          )}

          {activeTab === "build" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: isAnimating ? 1 : 1.03 }}
                whileTap={{ scale: isAnimating ? 1 : 0.97 }}
                onClick={handleRandomize}
                disabled={isAnimating}
                className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
              >
                Randomize
              </motion.button>
              <motion.button
                whileHover={{ scale: isAnimating ? 1 : 1.03 }}
                whileTap={{ scale: isAnimating ? 1 : 0.97 }}
                onClick={() => void handleHeapify()}
                disabled={isAnimating || heap.length < 2}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                Heapify
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 mb-5 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Algorithm step</p>
          <p className="text-sm text-gray-100 leading-6">{status}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 min-w-[220px]">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Status</p>
          <p className={`text-sm font-medium ${isValidHeap ? "text-emerald-300" : "text-amber-300"}`}>
            {isValidHeap ? "Heap property currently satisfied" : "Heap property violated — run Heapify"}
          </p>
          {lastExtracted !== null && <p className="text-xs text-gray-400 mt-2">Last extracted root: {lastExtracted}</p>}
          <p className="text-xs text-gray-500 mt-2">Size: {heap.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-white font-medium">Array Representation</h4>
          <span className="text-xs text-gray-400">Index i → left child 2i+1, right child 2i+2</span>
        </div>

        {heap.length === 0 ? (
          <div className="h-24 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-sm text-gray-500">
            Heap is empty.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3 items-start">
              {heap.map((item, index) => {
                const relationLabel = relationLabelForIndex(index);
                const tone = toneForItem(item.id, index);
                const isSwapping = swapIds.includes(item.id);
                const isRemoving = removingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={false}
                    animate={{
                      scale: isSwapping ? [1, 1.08, 1] : currentId === item.id ? 1.04 : 1,
                      opacity: isRemoving ? 0.2 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                    className={`w-20 shrink-0 rounded-2xl border-2 px-3 py-3 text-center ${tone}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.16em] text-gray-400">i={index}</div>
                    <div className="text-xl font-bold text-white mt-1">{item.value}</div>
                    <div className={`text-[10px] font-semibold mt-2 ${relationLabel ? "text-gray-200" : "text-gray-500"}`}>
                      {relationLabel || "NODE"}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {focusedIndex >= 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
            Focused index {focusedIndex}
            {focusedParentIndex >= 0 ? ` • parent: ${focusedParentIndex}` : " • parent: none"}
            {focusedLeftIndex < heap.length ? ` • left: ${focusedLeftIndex}` : " • left: none"}
            {focusedRightIndex < heap.length ? ` • right: ${focusedRightIndex}` : " • right: none"}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-white font-medium">Tree Representation</h4>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Root</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" />Current</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Compared</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Swap</span>
          </div>
        </div>

        {heap.length === 0 ? (
          <div className="h-[320px] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-sm text-gray-500">
            No nodes to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="relative mx-auto h-[320px] min-w-[760px]">
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`} fill="none">
                {heap.map((item, index) => {
                  if (index === 0) return null;

                  const parentIndex = Math.floor((index - 1) / 2);
                  const parentPosition = getTreePosition(parentIndex);
                  const childPosition = getTreePosition(index);
                  const edgeIsActive =
                    currentId === item.id ||
                    currentId === heap[parentIndex]?.id ||
                    compareIds.includes(item.id) ||
                    compareIds.includes(heap[parentIndex]?.id ?? -1);

                  return (
                    <motion.path
                      key={`${heap[parentIndex].id}-${item.id}`}
                      initial={{ pathLength: 0, opacity: 0.2 }}
                      animate={{ pathLength: 1, opacity: edgeIsActive ? 0.95 : 0.45 }}
                      transition={{ duration: 0.4 }}
                      d={`M ${parentPosition.x} ${parentPosition.y + NODE_SIZE / 2 - 2} Q ${(parentPosition.x + childPosition.x) / 2} ${(parentPosition.y + childPosition.y) / 2 - 18} ${childPosition.x} ${childPosition.y - NODE_SIZE / 2 + 2}`}
                      stroke={edgeIsActive ? "rgba(96, 165, 250, 0.9)" : "rgba(255, 255, 255, 0.18)"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {heap.map((item, index) => {
                const position = getTreePosition(index);
                const relationLabel = relationLabelForIndex(index);
                const tone = toneForItem(item.id, index);
                const isSwapping = swapIds.includes(item.id);
                const isRemoving = removingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{
                      left: position.x - NODE_SIZE / 2,
                      top: position.y - NODE_SIZE / 2,
                      scale: isSwapping ? [1, 1.1, 1] : currentId === item.id ? 1.05 : 1,
                      opacity: isRemoving ? 0.2 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="absolute flex flex-col items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-white font-bold text-sm ${tone}`}
                    >
                      {item.value}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-400">
                      {relationLabel || `i=${index}`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
