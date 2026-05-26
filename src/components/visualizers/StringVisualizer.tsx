"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Algorithm = "reversal" | "palindrome";
type HighlightState = "matched" | "mismatched";

interface CharacterItem {
  id: string;
  char: string;
}

interface VisualizerStep {
  chars: CharacterItem[];
  left: number | null;
  right: number | null;
  highlights: Record<number, HighlightState>;
  description: string;
  completed: boolean;
  result: boolean | null;
}

const DEFAULT_INPUTS: Record<Algorithm, string> = {
  reversal: "HELLO WORLD",
  palindrome: "RACECAR",
};

const BOX_BASE_CLASSES = "w-10 h-10 flex items-center justify-center rounded-lg border text-white font-mono font-bold";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createCharacters(value: string): CharacterItem[] {
  return Array.from(value).map((char, index) => ({
    id: `char-${index}`,
    char,
  }));
}

function renderCharacter(char: string) {
  return char === " " ? "␠" : char;
}

function buildReversalSteps(value: string): VisualizerStep[] {
  const chars = createCharacters(value);

  if (chars.length === 0) {
    return [
      {
        chars: [],
        left: null,
        right: null,
        highlights: {},
        description: "Type a string to begin the reversal animation.",
        completed: false,
        result: null,
      },
    ];
  }

  const steps: VisualizerStep[] = [];
  let current = [...chars];
  let left = 0;
  let right = current.length - 1;

  steps.push({
    chars: [...current],
    left,
    right,
    highlights: {},
    description: "Start with one pointer on each end of the string.",
    completed: current.length <= 1,
    result: null,
  });

  while (left < right) {
    const swapped = [...current];
    [swapped[left], swapped[right]] = [swapped[right], swapped[left]];
    current = swapped;

    steps.push({
      chars: [...current],
      left,
      right,
      highlights: {},
      description: `Swap the characters at indices ${left} and ${right}.`,
      completed: false,
      result: null,
    });

    left += 1;
    right -= 1;

    if (left < right) {
      steps.push({
        chars: [...current],
        left,
        right,
        highlights: {},
        description: `Move both pointers inward to indices ${left} and ${right}.`,
        completed: false,
        result: null,
      });
    }
  }

  if (current.length <= 1) {
    steps[0] = {
      ...steps[0],
      description: "A single character stays the same when reversed.",
      completed: true,
    };
    return steps;
  }

  steps.push({
    chars: [...current],
    left: null,
    right: null,
    highlights: {},
    description: "Reversal complete.",
    completed: true,
    result: null,
  });

  return steps;
}

function buildPalindromeSteps(value: string): VisualizerStep[] {
  const chars = createCharacters(value);

  if (chars.length === 0) {
    return [
      {
        chars: [],
        left: null,
        right: null,
        highlights: {},
        description: "An empty string reads the same both ways.",
        completed: true,
        result: true,
      },
    ];
  }

  if (chars.length === 1) {
    return [
      {
        chars: [...chars],
        left: null,
        right: null,
        highlights: { 0: "matched" },
        description: "A single character is always a palindrome.",
        completed: true,
        result: true,
      },
    ];
  }

  const steps: VisualizerStep[] = [];
  let left = 0;
  let right = chars.length - 1;
  let highlights: Record<number, HighlightState> = {};

  steps.push({
    chars: [...chars],
    left,
    right,
    highlights: {},
    description: "Compare the first and last characters.",
    completed: false,
    result: null,
  });

  while (left < right) {
    if (chars[left].char === chars[right].char) {
      highlights = {
        ...highlights,
        [left]: "matched",
        [right]: "matched",
      };

      steps.push({
        chars: [...chars],
        left: null,
        right: null,
        highlights: { ...highlights },
        description: `Indices ${left} and ${right} match.`,
        completed: false,
        result: null,
      });

      left += 1;
      right -= 1;

      if (left < right) {
        steps.push({
          chars: [...chars],
          left,
          right,
          highlights: { ...highlights },
          description: `Move inward to compare indices ${left} and ${right}.`,
          completed: false,
          result: null,
        });
      }
    } else {
      const mismatchHighlights = {
        ...highlights,
        [left]: "mismatched" as const,
        [right]: "mismatched" as const,
      };

      steps.push({
        chars: [...chars],
        left: null,
        right: null,
        highlights: mismatchHighlights,
        description: `Indices ${left} and ${right} do not match.`,
        completed: true,
        result: false,
      });

      return steps;
    }
  }

  steps.push({
    chars: [...chars],
    left: null,
    right: null,
    highlights: { ...highlights },
    description: "All mirrored pairs matched.",
    completed: true,
    result: true,
  });

  return steps;
}

function buildSteps(algorithm: Algorithm, value: string): VisualizerStep[] {
  return algorithm === "reversal" ? buildReversalSteps(value) : buildPalindromeSteps(value);
}

function getBoxClasses(index: number, step: VisualizerStep) {
  if (step.highlights[index] === "mismatched") {
    return "border-red-400 bg-red-400/20 text-red-100";
  }

  if (step.highlights[index] === "matched") {
    return "border-green-400 bg-green-400/20 text-green-100";
  }

  if (step.left === index) {
    return "border-blue-500 bg-blue-500/20 text-blue-100";
  }

  if (step.right === index) {
    return "border-green-500 bg-green-500/20 text-green-100";
  }

  return "border-purple-500/30 bg-purple-500/10";
}

export function StringVisualizer() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("reversal");
  const [reversalInput, setReversalInput] = useState(DEFAULT_INPUTS.reversal);
  const [palindromeInput, setPalindromeInput] = useState(DEFAULT_INPUTS.palindrome);
  const [steps, setSteps] = useState<VisualizerStep[]>(() =>
    buildSteps("reversal", DEFAULT_INPUTS.reversal)
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const activeInput = algorithm === "reversal" ? reversalInput : palindromeInput;
  const title = algorithm === "reversal" ? "String Reversal" : "Palindrome Check";
  const currentStepData = steps[Math.min(currentStep, steps.length - 1)];

  const rebuildSteps = (nextAlgorithm: Algorithm, nextValue: string) => {
    setIsRunning(false);
    setSteps(buildSteps(nextAlgorithm, nextValue));
    setCurrentStep(0);
  };

  const handleAlgorithmChange = (nextAlgorithm: Algorithm) => {
    if (nextAlgorithm === algorithm || isRunning) {
      return;
    }

    setAlgorithm(nextAlgorithm);
    rebuildSteps(
      nextAlgorithm,
      nextAlgorithm === "reversal" ? reversalInput : palindromeInput
    );
  };

  const handleInputChange = (value: string) => {
    if (isRunning) {
      return;
    }

    if (algorithm === "reversal") {
      setReversalInput(value);
    } else {
      setPalindromeInput(value);
    }

    rebuildSteps(algorithm, value);
  };

  const handleStep = () => {
    if (isRunning || currentStep >= steps.length - 1) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    rebuildSteps(algorithm, activeInput);
  };

  const handleStart = async () => {
    if (isRunning || steps.length === 0) {
      return;
    }

    let activeSteps = steps;
    let nextStep = currentStep;

    setIsRunning(true);

    if (currentStep >= steps.length - 1) {
      activeSteps = buildSteps(algorithm, activeInput);
      setSteps(activeSteps);
      setCurrentStep(0);
      nextStep = 0;
      await wait(250);
    }

    while (nextStep < activeSteps.length - 1) {
      await wait(900);
      nextStep += 1;
      setCurrentStep(nextStep);
    }

    setIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="p-6 rounded-2xl bg-gray-900/80 border border-white/10"
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">
              {algorithm === "reversal"
                ? "Reverse a string by swapping characters inward from both ends."
                : "Check whether a string reads the same forward and backward."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["reversal", "palindrome"] as Algorithm[]).map((option) => {
              const isActive = option === algorithm;

              return (
                <motion.button
                  key={option}
                  whileHover={{ scale: isRunning ? 1 : 1.03 }}
                  whileTap={{ scale: isRunning ? 1 : 0.97 }}
                  onClick={() => handleAlgorithmChange(option)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl border text-sm transition-colors disabled:opacity-50 ${
                    isActive
                      ? "border-purple-400/50 bg-purple-500/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {option === "reversal" ? "String Reversal" : "Palindrome Check"}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="text"
            value={activeInput}
            onChange={(event) => handleInputChange(event.target.value)}
            disabled={isRunning}
            placeholder={DEFAULT_INPUTS[algorithm]}
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white outline-none transition focus:border-purple-400/50 disabled:opacity-50"
          />

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: isRunning ? 1 : 1.03 }}
              whileTap={{ scale: isRunning ? 1 : 0.97 }}
              onClick={handleStart}
              disabled={isRunning || steps.length === 0}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Start"}
            </motion.button>
            <motion.button
              whileHover={{ scale: isRunning ? 1 : 1.03 }}
              whileTap={{ scale: isRunning ? 1 : 0.97 }}
              onClick={handleStep}
              disabled={isRunning || currentStep >= steps.length - 1}
              className="px-4 py-2 rounded-xl bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-500/80 disabled:opacity-50"
            >
              Step
            </motion.button>
            <motion.button
              whileHover={{ scale: isRunning ? 1 : 1.03 }}
              whileTap={{ scale: isRunning ? 1 : 0.97 }}
              onClick={handleReset}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
            >
              Reset
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Step {Math.min(currentStep + 1, steps.length)} / {steps.length}
        </span>
        <span>{algorithm === "reversal" ? "Two-pointer swap" : "Two-pointer compare"}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${algorithm}-${currentStep}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mb-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
        >
          <p className="text-sm text-gray-300">{currentStepData.description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-max items-start gap-3 pt-8">
          {currentStepData.chars.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative flex flex-col items-center gap-2"
            >
              <AnimatePresence>
                {currentStepData.left === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute -top-7 rounded-full border border-blue-400/40 bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-100"
                  >
                    Left
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {currentStepData.right === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`absolute ${
                      currentStepData.left === index ? "-top-14" : "-top-7"
                    } rounded-full border border-green-400/40 bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-100`}
                  >
                    Right
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                layout
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`${BOX_BASE_CLASSES} ${getBoxClasses(index, currentStepData)}`}
              >
                {renderCharacter(item.char)}
              </motion.div>
              <span className="text-xs font-mono text-gray-500">{index}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {currentStepData.chars.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-gray-400">
          Enter a string to visualize this algorithm.
        </div>
      )}

      <AnimatePresence>
        {algorithm === "palindrome" && currentStepData.result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
              currentStepData.result
                ? "border-green-400/30 bg-green-400/10 text-green-200"
                : "border-red-400/30 bg-red-400/10 text-red-200"
            }`}
          >
            This string {currentStepData.result ? "is" : "isn't"} a palindrome.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
