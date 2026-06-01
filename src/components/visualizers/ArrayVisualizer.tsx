"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationStepPanel, type StepTone, type VisualizationStep } from "./VisualizationStepPanel";

interface ArrayVisualizerProps {
  initialArray?: number[];
  algorithm?: string;
}

function formatArrayPreview(values: number[]) {
  return `[${values.join(", ")}]`;
}

export function ArrayVisualizer({ initialArray }: ArrayVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray || [38, 27, 43, 3, 9, 82, 10, 64, 15, 51]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [currentPass, setCurrentPass] = useState(0);
  const [currentAction, setCurrentAction] = useState("Explore array operations or start bubble sort.");
  const [stepLog, setStepLog] = useState<VisualizationStep[]>([]);
  const [accessIndex, setAccessIndex] = useState("");
  const [insertIndex, setInsertIndex] = useState("");
  const [insertValue, setInsertValue] = useState("");
  const [deleteIndex, setDeleteIndex] = useState("");
  const stepCounterRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const maxVal = Math.max(...array);

  const clearScheduledTimeouts = () => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  };

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, ms);
      timeoutRef.current.push(timeout);
    });

  const addStep = useCallback((action: string, explanation: string, tone: StepTone) => {
    stepCounterRef.current += 1;
    const stepNumber = stepCounterRef.current;

    setStepLog((previous) => [
      ...previous,
      {
        id: `array-step-${stepNumber}`,
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
        id: `array-divider-${previous.length}-${Date.now()}`,
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

  const resetArray = () => {
    clearScheduledTimeouts();
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 10);
    setArray(newArray);
    setActiveIndices([]);
    setSorted([]);
    setCurrentPass(0);
    setCurrentAction("Generated a new array. Try accessing, inserting, deleting, or sorting it.");
    setIsRunning(false);
    clearLog();
  };

  const bubbleSort = async () => {
    clearScheduledTimeouts();
    setIsRunning(true);
    setSorted([]);
    setCurrentPass(0);
    clearLog();
    addDivider(
      "Bubble sort started",
      "Arrays allow constant-time access by index, which makes adjacent comparisons easy to visualize one pair at a time.",
      "round"
    );

    const arr = [...array];

    for (let i = 0; i < arr.length - 1; i += 1) {
      const round = i + 1;
      let swapped = false;
      setCurrentPass(round);
      setCurrentAction(`Bubble sort pass ${round}`);

      for (let j = 0; j < arr.length - i - 1; j += 1) {
        const left = arr[j];
        const right = arr[j + 1];
        setActiveIndices([j, j + 1]);
        addStep(
          `Compare index ${j} (${left}) and index ${j + 1} (${right})`,
          left > right
            ? `${left} is larger, so these adjacent values are out of order and must be swapped.`
            : `${left} is already no greater than ${right}, so the pair stays in place.`,
          "compare"
        );
        await sleep(speed);

        if (left > right) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          setArray([...arr]);
          addStep(
            `Swap indices ${j} and ${j + 1}`,
            `In an array, swapping happens in place, so only these two slots change. Array: ${formatArrayPreview(arr)}`,
            "swap"
          );
          await sleep(speed);
        }
      }

      const settledIndex = arr.length - 1 - i;
      setSorted((previous) => Array.from(new Set([...previous, settledIndex])));
      addDivider(
        `Pass ${round} complete`,
        `${arr[settledIndex]} is now fixed at the end of the unsorted portion, which is why bubble sort shrinks its search range after each pass.`,
        "sorted"
      );

      if (!swapped) {
        break;
      }
    }

    setArray([...arr]);
    setSorted(arr.map((_, index) => index));
    setActiveIndices([]);
    setCurrentAction("Bubble sort finished.");
    addDivider("Sorting complete", `The full array is now sorted: ${formatArrayPreview(arr)}`, "sorted");
    setIsRunning(false);
  };

  const handleAccess = async () => {
    if (isRunning || accessIndex === "") {
      return;
    }

    const index = Number.parseInt(accessIndex, 10);
    if (Number.isNaN(index) || index < 0 || index >= array.length) {
      return;
    }

    setActiveIndices([index]);
    setCurrentAction(`Accessing index ${index}`);
    addStep(
      `Access index ${index}`,
      `Arrays support O(1) access because the memory location of index ${index} can be computed directly. Value found: ${array[index]}.`,
      "access"
    );
    await sleep(Math.max(180, Math.floor(speed / 2)));
    setActiveIndices([]);
  };

  const handleInsert = () => {
    if (isRunning || insertIndex === "" || insertValue === "") {
      return;
    }

    const targetIndex = Number.parseInt(insertIndex, 10);
    const value = Number.parseInt(insertValue, 10);
    if (Number.isNaN(targetIndex) || Number.isNaN(value)) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(targetIndex, array.length));
    const nextArray = [...array];
    nextArray.splice(clampedIndex, 0, value);
    setArray(nextArray);
    setSorted([]);
    setActiveIndices([clampedIndex]);
    setCurrentPass(0);
    setCurrentAction(`Inserted ${value} at index ${clampedIndex}`);
    addStep(
      `Insert ${value} at index ${clampedIndex}`,
      `Every element from index ${clampedIndex} onward shifts one position right, which is why inserting in the middle of an array costs O(n). Array: ${formatArrayPreview(nextArray)}`,
      "insert"
    );
    setInsertIndex("");
    setInsertValue("");
  };

  const handleDelete = () => {
    if (isRunning || deleteIndex === "") {
      return;
    }

    const index = Number.parseInt(deleteIndex, 10);
    if (Number.isNaN(index) || index < 0 || index >= array.length) {
      return;
    }

    const removedValue = array[index];
    const nextArray = array.filter((_, currentIndex) => currentIndex !== index);
    setArray(nextArray);
    setSorted([]);
    setActiveIndices(index < nextArray.length ? [index] : [Math.max(index - 1, 0)]);
    setCurrentPass(0);
    setCurrentAction(`Deleted index ${index}`);
    addStep(
      `Delete value ${removedValue} from index ${index}`,
      `After deletion, every later element shifts left so the array stays contiguous in memory. That movement is why middle deletions are O(n). Array: ${formatArrayPreview(nextArray)}`,
      "delete"
    );
    setDeleteIndex("");
  };

  useEffect(() => {
    return () => {
      clearScheduledTimeouts();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Array Visualization</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetArray}
            disabled={isRunning}
            className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-all hover:bg-gray-600 disabled:opacity-50"
          >
            Randomize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => void bubbleSort()}
            disabled={isRunning}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white transition-all hover:bg-purple-500 disabled:opacity-50"
          >
            {isRunning ? "Sorting..." : "Sort"}
          </motion.button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-gray-900/50 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">Access</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={accessIndex}
              onChange={(event) => setAccessIndex(event.target.value)}
              placeholder="Index"
              disabled={isRunning}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void handleAccess()}
              disabled={isRunning}
              className="shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Read
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/50 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">Insert</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={insertIndex}
              onChange={(event) => setInsertIndex(event.target.value)}
              placeholder="Index"
              disabled={isRunning}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <input
              type="number"
              value={insertValue}
              onChange={(event) => setInsertValue(event.target.value)}
              placeholder="Value"
              disabled={isRunning}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleInsert}
              disabled={isRunning}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/50 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">Delete</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={deleteIndex}
              onChange={(event) => setDeleteIndex(event.target.value)}
              placeholder="Index"
              disabled={isRunning}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-rose-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleDelete}
              disabled={isRunning}
              className="shrink-0 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-gray-400">Speed:</span>
        <input
          type="range"
          min={50}
          max={500}
          value={500 - speed}
          onChange={(event) => setSpeed(500 - Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
        />
        <span className="text-xs text-gray-400">{speed < 150 ? "Fast" : speed < 300 ? "Medium" : "Slow"}</span>
      </div>

      <div className="flex h-64 items-end justify-center gap-1 px-4">
        {array.map((value, index) => (
          <motion.div
            key={index}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-1 flex-col items-center justify-end rounded-t-md"
            style={{ height: `${(value / maxVal) * 100}%` }}
          >
            <motion.div
              className={`h-full w-full rounded-t-md transition-colors duration-200 ${
                sorted.includes(index)
                  ? "bg-gradient-to-t from-green-600 to-green-400"
                  : activeIndices.includes(index)
                    ? "bg-gradient-to-t from-yellow-600 to-yellow-400"
                    : "bg-gradient-to-t from-purple-700 to-purple-400"
              }`}
              animate={{
                scale: activeIndices.includes(index) ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            <span className="absolute -bottom-5 text-[10px] text-gray-400">{value}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-purple-500" />
          <span className="text-xs text-gray-400">Default</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-yellow-500" />
          <span className="text-xs text-gray-400">Active indices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-xs text-gray-400">Sorted</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Current action</div>
          <div className="mt-2 text-sm font-medium text-white">{currentAction}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Active indices</div>
          <div className="mt-2 text-sm font-medium text-white">{activeIndices.length > 0 ? activeIndices.join(", ") : "None"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Pass</div>
          <div className="mt-2 text-sm font-medium text-white">{currentPass > 0 ? currentPass : "No sort running"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Sorted suffix</div>
          <div className="mt-2 text-sm font-medium text-white">
            {sorted.length > 0 ? sorted.map((index) => `${index}:${array[index]}`).join(" • ") : "None yet"}
          </div>
        </div>
      </div>

      <VisualizationStepPanel
        entries={stepLog}
        onClear={clearLog}
        emptyMessage="Use array operations or run bubble sort to see index-by-index explanations appear here."
      />
    </motion.div>
  );
}
