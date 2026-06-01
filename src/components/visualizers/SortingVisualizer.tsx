"use client";

import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { VisualizationStepPanel, type StepTone, type VisualizationStep } from "./VisualizationStepPanel";

type SortingAlgorithm = "merge" | "quick" | "bubble" | "insertion";

const SORTING_ARRAY_LENGTH = 24;
const algorithmLabels: Record<SortingAlgorithm, string> = {
  bubble: "Bubble Sort",
  insertion: "Insertion Sort",
  merge: "Merge Sort",
  quick: "Quick Sort",
};

function generateRandomArray() {
  return Array.from({ length: SORTING_ARRAY_LENGTH }, () => Math.floor(Math.random() * 90) + 10);
}

function formatArrayPreview(values: number[]) {
  const preview = values.slice(0, 8).join(", ");
  return `[${preview}${values.length > 8 ? ", ..." : ""}]`;
}

function formatIndices(indices: number[]) {
  return indices.length > 0 ? indices.join(", ") : "None";
}

function formatSortedValues(array: number[], indices: number[]) {
  if (indices.length === 0) {
    return "None yet";
  }

  return [...indices]
    .sort((left, right) => left - right)
    .slice(0, 8)
    .map((index) => `${index}:${array[index]}`)
    .join(" • ");
}

export function SortingVisualizer() {
  const [array, setArray] = useState<number[]>(() => generateRandomArray());
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("merge");
  const [speed, setSpeed] = useState(20);
  const [currentPass, setCurrentPass] = useState(0);
  const [currentFocus, setCurrentFocus] = useState("Ready to visualize the next run.");
  const [stepLog, setStepLog] = useState<VisualizationStep[]>([]);
  const stepCounterRef = useRef(0);

  const maxVal = Math.max(...array);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addStep = useCallback((action: string, explanation: string, tone: StepTone) => {
    stepCounterRef.current += 1;
    const stepNumber = stepCounterRef.current;

    setStepLog((previous) => [
      ...previous,
      {
        id: `sorting-step-${stepNumber}`,
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
        id: `sorting-divider-${previous.length}-${Date.now()}`,
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

  const reset = () => {
    setArray(generateRandomArray());
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setCurrentPass(0);
    setCurrentFocus("Generated a fresh unsorted array.");
    setIsRunning(false);
    clearLog();
  };

  const bubbleSort = async () => {
    const arr = [...array];

    for (let i = 0; i < arr.length - 1; i += 1) {
      const round = i + 1;
      let swappedInRound = false;
      setCurrentPass(round);
      setCurrentFocus(`Bubble sort round ${round}`);
      addDivider(
        `Round ${round} started`,
        "Bubble sort scans adjacent pairs from left to right so the largest unsorted value drifts toward the end of the array.",
        "round"
      );

      for (let j = 0; j < arr.length - i - 1; j += 1) {
        const left = arr[j];
        const right = arr[j + 1];
        setComparing([j, j + 1]);
        setSwapping([]);
        addStep(
          `Compare ${left} and ${right}`,
          left > right
            ? `${left} is larger, so these neighbors are out of order and the larger value must move right.`
            : `${left} is already less than or equal to ${right}, so this pair stays in the correct relative order.`,
          "compare"
        );
        await sleep(speed);

        if (left > right) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swappedInRound = true;
          setSwapping([j, j + 1]);
          setArray([...arr]);
          addStep(
            `Swap ${left} ↔ ${right}`,
            `Swapping puts the smaller value first and pushes the larger value one step closer to its final spot. Array: ${formatArrayPreview(arr)}`,
            "swap"
          );
          await sleep(speed);
        }
      }

      const settledIndex = arr.length - 1 - i;
      setComparing([]);
      setSwapping([]);
      setSorted((previous) => Array.from(new Set([...previous, settledIndex])));
      addDivider(
        `Round ${round} complete`,
        `${arr[settledIndex]} has bubbled into index ${settledIndex}, so that position is now guaranteed to be sorted.${
          swappedInRound ? "" : " No swaps happened this round, which means the entire array is already sorted."
        }`,
        "sorted"
      );

      if (!swappedInRound) {
        break;
      }
    }

    setArray([...arr]);
    setSorted(arr.map((_, index) => index));
    setCurrentFocus("Sorting complete.");
    addDivider("Sorting complete", `All values are now in nondecreasing order: ${formatArrayPreview(arr)}`, "sorted");
  };

  const insertionSort = async () => {
    const arr = [...array];
    setSorted(arr.length > 0 ? [0] : []);

    for (let i = 1; i < arr.length; i += 1) {
      const key = arr[i];
      let j = i - 1;
      setCurrentPass(i);
      setCurrentFocus(`Inserting ${key} into the sorted prefix.`);
      addDivider(
        `Pass ${i} started`,
        `Insertion sort treats the first ${i} elements as a sorted prefix and places ${key} into the correct opening.`,
        "round"
      );

      while (j >= 0) {
        setComparing([j, j + 1]);
        addStep(
          `Compare ${arr[j]} with key ${key}`,
          arr[j] > key
            ? `${arr[j]} is larger than ${key}, so it shifts right to open a gap for the key.`
            : `${arr[j]} is not larger than ${key}, so the key has found the first valid insertion position.`,
          "compare"
        );
        await sleep(speed);

        if (arr[j] <= key) {
          break;
        }

        arr[j + 1] = arr[j];
        setSwapping([j, j + 1]);
        setArray([...arr]);
        addStep(
          `Shift ${arr[j]} right`,
          `Moving a larger value one slot right keeps the prefix sorted while making room for ${key}. Array: ${formatArrayPreview(arr)}`,
          "swap"
        );
        await sleep(speed);
        j -= 1;
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setComparing([]);
      setSwapping([j + 1]);
      setSorted(Array.from({ length: i + 1 }, (_, index) => index));
      addStep(
        `Insert ${key} at index ${j + 1}`,
        `Everything to the left is smaller or equal, so placing ${key} here keeps the growing prefix sorted. Array: ${formatArrayPreview(arr)}`,
        "sorted"
      );
      await sleep(speed);
      setSwapping([]);
      addDivider(
        `Pass ${i} complete`,
        `The first ${i + 1} positions now form a sorted prefix that future passes will extend.`,
        "sorted"
      );
    }

    setComparing([]);
    setSwapping([]);
    setSorted(arr.map((_, index) => index));
    setCurrentFocus("Sorting complete.");
    addDivider("Sorting complete", `Insertion sort finished with ${formatArrayPreview(arr)}`, "sorted");
  };

  const mergeSort = async () => {
    const arr = [...array];
    let mergeRound = 0;

    const merge = async (start: number, mid: number, end: number) => {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let leftIndex = 0;
      let rightIndex = 0;
      let writeIndex = start;

      mergeRound += 1;
      setCurrentPass(mergeRound);
      setCurrentFocus(`Merging indices ${start}-${end}`);
      addDivider(
        `Merge ${mergeRound} started`,
        `Merge sort combines two already-sorted halves, ${formatArrayPreview(left)} and ${formatArrayPreview(right)}, by repeatedly writing the smaller front value.`,
        "round"
      );

      while (leftIndex < left.length && rightIndex < right.length) {
        setComparing([start + leftIndex, mid + 1 + rightIndex]);
        addStep(
          `Compare ${left[leftIndex]} and ${right[rightIndex]}`,
          left[leftIndex] <= right[rightIndex]
            ? `${left[leftIndex]} is smaller, so it must be written next to keep the merged segment sorted.`
            : `${right[rightIndex]} is smaller, so it is written next before the larger left-half value.`,
          "compare"
        );
        await sleep(speed);

        const nextValue = left[leftIndex] <= right[rightIndex] ? left[leftIndex++] : right[rightIndex++];
        arr[writeIndex] = nextValue;
        setArray([...arr]);
        setSwapping([writeIndex]);
        addStep(
          `Write ${nextValue} to index ${writeIndex}`,
          `The merged segment grows from left to right while staying sorted at every step. Array: ${formatArrayPreview(arr)}`,
          "swap"
        );
        await sleep(speed);
        writeIndex += 1;
      }

      while (leftIndex < left.length) {
        const nextValue = left[leftIndex];
        arr[writeIndex] = nextValue;
        setArray([...arr]);
        setSwapping([writeIndex]);
        addStep(
          `Copy remaining ${nextValue} to index ${writeIndex}`,
          "The right half is exhausted, so the leftover left-half values can be copied directly in sorted order.",
          "swap"
        );
        await sleep(speed);
        leftIndex += 1;
        writeIndex += 1;
      }

      while (rightIndex < right.length) {
        const nextValue = right[rightIndex];
        arr[writeIndex] = nextValue;
        setArray([...arr]);
        setSwapping([writeIndex]);
        addStep(
          `Copy remaining ${nextValue} to index ${writeIndex}`,
          "The left half is exhausted, so the rest of the right half already belongs at the end of this merged segment.",
          "swap"
        );
        await sleep(speed);
        rightIndex += 1;
        writeIndex += 1;
      }

      setComparing([]);
      setSwapping([]);
      addDivider(
        `Merge ${mergeRound} complete`,
        `Indices ${start}-${end} now read ${formatArrayPreview(arr.slice(start, end + 1))}, which is sorted within that segment.`,
        "sorted"
      );
    };

    const sort = async (start: number, end: number): Promise<void> => {
      if (start >= end) {
        return;
      }

      const mid = Math.floor((start + end) / 2);
      await sort(start, mid);
      await sort(mid + 1, end);
      await merge(start, mid, end);
    };

    await sort(0, arr.length - 1);
    setArray([...arr]);
    setSorted(arr.map((_, index) => index));
    setCurrentFocus("All subarrays have been merged into one fully sorted array.");
    addDivider("Merge sort complete", `The final merged array is ${formatArrayPreview(arr)}`, "sorted");
  };

  const quickSort = async () => {
    const arr = [...array];
    let partitionRound = 0;

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high];
      let pivotBoundary = low - 1;
      partitionRound += 1;
      setCurrentPass(partitionRound);
      setCurrentFocus(`Partitioning around pivot ${pivot}`);
      addDivider(
        `Partition ${partitionRound} started`,
        `Quick sort uses pivot ${pivot} so every smaller value moves left before the pivot is placed in its final index.`,
        "round"
      );

      for (let j = low; j < high; j += 1) {
        setComparing([j, high]);
        addStep(
          `Compare ${arr[j]} with pivot ${pivot}`,
          arr[j] < pivot
            ? `${arr[j]} belongs in the left partition because it is smaller than the pivot.`
            : `${arr[j]} stays on the right side for now because it is not smaller than the pivot.`,
          "compare"
        );
        await sleep(speed);

        if (arr[j] < pivot) {
          pivotBoundary += 1;

          if (pivotBoundary !== j) {
            const leftValue = arr[pivotBoundary];
            const rightValue = arr[j];
            [arr[pivotBoundary], arr[j]] = [arr[j], arr[pivotBoundary]];
            setSwapping([pivotBoundary, j]);
            setArray([...arr]);
            addStep(
              `Swap ${leftValue} ↔ ${rightValue}`,
              `This grows the region of values that are definitely smaller than ${pivot}. Array: ${formatArrayPreview(arr)}`,
              "swap"
            );
          } else {
            setSwapping([j]);
            addStep(
              `Keep ${arr[j]} in place`,
              `${arr[j]} is already at the next position in the smaller-than-pivot region, so no extra swap is needed.`,
              "sorted"
            );
          }

          await sleep(speed);
        }
      }

      [arr[pivotBoundary + 1], arr[high]] = [arr[high], arr[pivotBoundary + 1]];
      setArray([...arr]);
      setSwapping([pivotBoundary + 1, high]);
      addStep(
        `Place pivot ${pivot} at index ${pivotBoundary + 1}`,
        `Every value left of this index is smaller and every value right of it is larger or equal, so the pivot is now fixed forever. Array: ${formatArrayPreview(arr)}`,
        "swap"
      );
      await sleep(speed);

      const pivotIndex = pivotBoundary + 1;
      setSorted((previous) => Array.from(new Set([...previous, pivotIndex])));
      setComparing([]);
      setSwapping([]);
      addDivider(
        `Partition ${partitionRound} complete`,
        `Pivot ${pivot} is locked at index ${pivotIndex}, and quick sort now recurses on the partitions around it.`,
        "sorted"
      );

      return pivotIndex;
    };

    const sort = async (low: number, high: number): Promise<void> => {
      if (low < high) {
        const pivotIndex = await partition(low, high);
        await sort(low, pivotIndex - 1);
        await sort(pivotIndex + 1, high);
        return;
      }

      if (low === high) {
        setSorted((previous) => Array.from(new Set([...previous, low])));
        addStep(
          `Single element ${arr[low]} confirmed`,
          `A partition with one element is already sorted, so index ${low} needs no more work.`,
          "sorted"
        );
        await sleep(Math.max(40, Math.floor(speed / 2)));
      }
    };

    await sort(0, arr.length - 1);
    setArray([...arr]);
    setSorted(arr.map((_, index) => index));
    setCurrentFocus("Sorting complete.");
    addDivider("Quick sort complete", `All partitions have been resolved into ${formatArrayPreview(arr)}`, "sorted");
  };

  const runSort = async () => {
    setIsRunning(true);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setCurrentPass(0);
    setCurrentFocus(`${algorithmLabels[algorithm]} is preparing the first step.`);
    clearLog();
    addDivider(
      `${algorithmLabels[algorithm]} started`,
      "Watch the highlighted bars and explanations together: the colors show what changed, and the log explains why that change was necessary.",
      "round"
    );

    switch (algorithm) {
      case "bubble":
        await bubbleSort();
        break;
      case "insertion":
        await insertionSort();
        break;
      case "merge":
        await mergeSort();
        break;
      case "quick":
        await quickSort();
        break;
    }

    setComparing([]);
    setSwapping([]);
    setIsRunning(false);
  };

  const activeIndices = swapping.length > 0 ? swapping : comparing;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Sorting Algorithms</h3>
        <div className="flex flex-wrap gap-2">
          {(["bubble", "insertion", "merge", "quick"] as const).map((algo) => (
            <motion.button
              key={algo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isRunning && setAlgorithm(algo)}
              disabled={isRunning}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 ${
                algorithm === algo
                  ? "border-purple-500/30 bg-purple-500/20 text-purple-300"
                  : "border-white/5 bg-gray-700/50 text-gray-400 hover:border-white/10 hover:text-white"
              }`}
            >
              {algorithmLabels[algo]}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          disabled={isRunning}
          className="rounded-lg bg-gray-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Randomize
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => void runSort()}
          disabled={isRunning}
          className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {isRunning ? "Sorting..." : "Sort!"}
        </motion.button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-gray-400">Speed:</span>
        <input
          type="range"
          min={5}
          max={100}
          value={100 - speed}
          onChange={(event) => setSpeed(100 - Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
        />
      </div>

      <div className="flex h-64 items-end justify-center gap-[2px]">
        {array.map((value, index) => (
          <motion.div
            key={index}
            className={`flex-1 rounded-t-sm transition-colors duration-100 ${
              sorted.includes(index)
                ? "bg-green-500"
                : swapping.includes(index)
                  ? "bg-orange-500"
                  : comparing.includes(index)
                    ? "bg-yellow-400"
                    : "bg-purple-500"
            }`}
            style={{ height: `${(value / maxVal) * 100}%` }}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            title={`Index ${index}: ${value}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-purple-500" />
          <span className="text-xs text-gray-400">Unsorted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-yellow-400" />
          <span className="text-xs text-gray-400">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-orange-500" />
          <span className="text-xs text-gray-400">Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-xs text-gray-400">Sorted</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Algorithm</div>
          <div className="mt-2 text-sm font-medium text-white">{algorithmLabels[algorithm]}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Current indices</div>
          <div className="mt-2 text-sm font-medium text-white">{formatIndices(activeIndices)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Round / pass</div>
          <div className="mt-2 text-sm font-medium text-white">{currentPass > 0 ? currentPass : "Waiting"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Sorted positions</div>
          <div className="mt-2 text-sm font-medium text-white">{formatSortedValues(array, sorted)}</div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-gray-900/60 p-3 text-sm text-gray-300">
        <span className="font-semibold text-white">Current focus:</span> {currentFocus}
      </div>

      <VisualizationStepPanel
        entries={stepLog}
        onClear={clearLog}
        emptyMessage="Run a sorting algorithm to watch comparisons, swaps, and completed rounds appear here."
      />
    </motion.div>
  );
}
