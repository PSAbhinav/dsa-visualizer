"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_TEXT = "ABABDABACDABABCABAB";
const DEFAULT_PATTERN = "ABABCABAB";
const BOX_SIZE = 32;
const BOX_GAP = 4;
const STEP_DISTANCE = BOX_SIZE + BOX_GAP;

type ComparisonResult = "match" | "mismatch";

type PendingAction =
  | { type: "advance"; nextI: number; nextJ: number }
  | { type: "shift"; nextI: number; nextJ: number; lpsIndex: number }
  | { type: "advance-text"; nextI: number; nextJ: number }
  | { type: "record-match"; start: number; nextI: number; nextJ: number };

interface SearchState {
  i: number;
  j: number;
  comparisons: number;
  matches: number[];
  comparison: {
    textIndex: number;
    patternIndex: number;
    result: ComparisonResult;
  } | null;
  activeLpsIndex: number | null;
  pendingAction: PendingAction | null;
  status: string;
  complete: boolean;
  activeMatchStart: number | null;
}

function buildLps(pattern: string) {
  const lps = Array(pattern.length).fill(0);
  let length = 0;
  let index = 1;

  while (index < pattern.length) {
    if (pattern[index] === pattern[length]) {
      length += 1;
      lps[index] = length;
      index += 1;
    } else if (length > 0) {
      length = lps[length - 1];
    } else {
      lps[index] = 0;
      index += 1;
    }
  }

  return lps;
}

function createInitialSearchState(text: string, pattern: string): SearchState {
  if (!text.length) {
    return {
      i: 0,
      j: 0,
      comparisons: 0,
      matches: [],
      comparison: null,
      activeLpsIndex: null,
      pendingAction: null,
      status: "Enter text to begin the search.",
      complete: true,
      activeMatchStart: null,
    };
  }

  if (!pattern.length) {
    return {
      i: 0,
      j: 0,
      comparisons: 0,
      matches: [],
      comparison: null,
      activeLpsIndex: null,
      pendingAction: null,
      status: "Enter a pattern to build the LPS table.",
      complete: true,
      activeMatchStart: null,
    };
  }

  return {
    i: 0,
    j: 0,
    comparisons: 0,
    matches: [],
    comparison: null,
    activeLpsIndex: null,
    pendingAction: null,
    status: "Ready to start KMP search.",
    complete: false,
    activeMatchStart: null,
  };
}

export function StringAlgoVisualizer() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [lps, setLps] = useState<number[]>(() => buildLps(DEFAULT_PATTERN));
  const [autoPlay, setAutoPlay] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>(() =>
    createInitialSearchState(DEFAULT_TEXT, DEFAULT_PATTERN)
  );

  const textChars = Array.from(text);
  const patternChars = Array.from(pattern);
  const alignmentOffset = Math.max(searchState.i - searchState.j, 0);
  const visualizationWidth = Math.max(textChars.length, patternChars.length, 1) * STEP_DISTANCE;
  const canSearch = textChars.length > 0 && patternChars.length > 0;

  const applyInputs = useCallback((nextText: string, nextPattern: string) => {
    setAutoPlay(false);
    setLps(buildLps(nextPattern));
    setSearchState(createInitialSearchState(nextText, nextPattern));
  }, []);

  const resetSearch = useCallback(() => {
    applyInputs(text, pattern);
  }, [applyInputs, pattern, text]);

  const stepSearch = useCallback(() => {
    setSearchState((current) => {
      if (!text.length || !pattern.length || current.complete) {
        return current;
      }

      if (current.pendingAction) {
        const action = current.pendingAction;
        const nextStateBase = {
          ...current,
          i: action.nextI,
          j: action.nextJ,
          comparison: null,
          pendingAction: null,
        };

        if (action.type === "advance") {
          return {
            ...nextStateBase,
            activeLpsIndex: null,
            activeMatchStart: null,
            status:
              action.nextI >= text.length
                ? current.matches.length
                  ? "Search complete. All matches recorded."
                  : "Search complete. No match found."
                : `Advance to i = ${action.nextI}, j = ${action.nextJ}.`,
            complete: action.nextI >= text.length,
          };
        }

        if (action.type === "shift") {
          const shiftBy = current.j - action.nextJ;
          return {
            ...nextStateBase,
            activeLpsIndex: action.lpsIndex,
            activeMatchStart: null,
            status: `Shift pattern right by ${shiftBy} using LPS[${action.lpsIndex}] = ${lps[action.lpsIndex]}.`,
            complete: false,
          };
        }

        if (action.type === "advance-text") {
          return {
            ...nextStateBase,
            activeLpsIndex: null,
            activeMatchStart: null,
            status:
              action.nextI >= text.length
                ? current.matches.length
                  ? "Search complete. All matches recorded."
                  : "Search complete. No match found."
                : `Pattern reset. Move to the next text index (${action.nextI}).`,
            complete: action.nextI >= text.length,
          };
        }

        const matches = current.matches.includes(action.start)
          ? current.matches
          : [...current.matches, action.start];

        return {
          ...nextStateBase,
          matches,
          activeLpsIndex: null,
          activeMatchStart: action.start,
          status:
            action.nextI >= text.length
              ? `Match found at index ${action.start}. Search complete.`
              : `Match found at index ${action.start}. Continue with j = ${action.nextJ}.`,
          complete: action.nextI >= text.length,
        };
      }

      if (current.i >= text.length) {
        return {
          ...current,
          comparison: null,
          activeLpsIndex: null,
          pendingAction: null,
          status: current.matches.length ? "Search complete. All matches recorded." : "Search complete. No match found.",
          complete: true,
        };
      }

      const textChar = text[current.i];
      const patternChar = pattern[current.j];
      const comparisons = current.comparisons + 1;

      if (textChar === patternChar) {
        const isFullMatch = current.j === pattern.length - 1;
        const start = current.i - current.j;

        return {
          ...current,
          comparisons,
          comparison: {
            textIndex: current.i,
            patternIndex: current.j,
            result: "match",
          },
          activeLpsIndex: null,
          activeMatchStart: isFullMatch ? start : null,
          pendingAction: isFullMatch
            ? {
                type: "record-match",
                start,
                nextI: current.i + 1,
                nextJ: lps[current.j] ?? 0,
              }
            : {
                type: "advance",
                nextI: current.i + 1,
                nextJ: current.j + 1,
              },
          status: isFullMatch
            ? `Full match discovered at index ${start}.`
            : `Match: text[${current.i}] = pattern[${current.j}] = ${textChar}`,
          complete: false,
        };
      }

      if (current.j > 0) {
        const lpsIndex = current.j - 1;
        const nextJ = lps[lpsIndex] ?? 0;

        return {
          ...current,
          comparisons,
          comparison: {
            textIndex: current.i,
            patternIndex: current.j,
            result: "mismatch",
          },
          activeLpsIndex: lpsIndex,
          activeMatchStart: null,
          pendingAction: {
            type: "shift",
            nextI: current.i,
            nextJ,
            lpsIndex,
          },
          status: `Mismatch at text[${current.i}] and pattern[${current.j}]. Use LPS[${lpsIndex}] = ${nextJ}.`,
          complete: false,
        };
      }

      return {
        ...current,
        comparisons,
        comparison: {
          textIndex: current.i,
          patternIndex: current.j,
          result: "mismatch",
        },
        activeLpsIndex: null,
        activeMatchStart: null,
        pendingAction: {
          type: "advance-text",
          nextI: current.i + 1,
          nextJ: 0,
        },
        status: `Mismatch at the pattern start. Advance i to ${current.i + 1}.`,
        complete: false,
      };
    });
  }, [lps, pattern, text]);

  useEffect(() => {
    if (!autoPlay || searchState.complete || !canSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      stepSearch();
    }, 850);

    return () => window.clearTimeout(timer);
  }, [autoPlay, canSearch, searchState.complete, searchState.i, searchState.j, searchState.pendingAction, stepSearch]);

  const foundTextIndices = new Set<number>();
  searchState.matches.forEach((start) => {
    for (let index = start; index < start + pattern.length; index += 1) {
      foundTextIndices.add(index);
    }
  });

  const activeMatchRange =
    searchState.activeMatchStart !== null
      ? {
          start: searchState.activeMatchStart,
          end: searchState.activeMatchStart + pattern.length - 1,
        }
      : null;

  const getTextBoxClass = (index: number) => {
    if (activeMatchRange && index >= activeMatchRange.start && index <= activeMatchRange.end) {
      return "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-amber-500 bg-amber-500/20 text-amber-300";
    }

    if (foundTextIndices.has(index)) {
      return "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-amber-500 bg-amber-500/20 text-amber-300";
    }

    if (searchState.comparison?.textIndex === index) {
      return searchState.comparison.result === "match"
        ? "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-green-500 bg-green-500/20 text-green-300"
        : "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-red-500 bg-red-500/20 text-red-300";
    }

    return "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-gray-600 bg-gray-800 text-gray-300";
  };

  const getPatternBoxClass = (index: number) => {
    if (activeMatchRange && alignmentOffset === activeMatchRange.start) {
      return "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-amber-500 bg-amber-500/20 text-amber-300";
    }

    if (searchState.comparison?.patternIndex === index) {
      return searchState.comparison.result === "match"
        ? "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-green-500 bg-green-500/20 text-green-300"
        : "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-red-500 bg-red-500/20 text-red-300";
    }

    return "w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold border-purple-500/30 bg-purple-500/10 text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">KMP Pattern Matching</h3>
            <p className="text-sm text-gray-400">Visualize comparisons, LPS fallback, and pattern shifts in Knuth-Morris-Pratt search.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-950/50 px-3 py-2 text-xs text-gray-300">
            Shift formula: <span className="font-mono text-purple-300">j - lps[j - 1]</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span>Text</span>
            <input
              value={text}
              onChange={(event) => {
                const nextText = event.target.value;
                setText(nextText);
                applyInputs(nextText, pattern);
              }}
              className="rounded-xl border border-white/10 bg-gray-950 px-4 py-2 text-white outline-none transition focus:border-purple-500/60"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span>Pattern</span>
            <input
              value={pattern}
              onChange={(event) => {
                const nextPattern = event.target.value;
                setPattern(nextPattern);
                applyInputs(text, nextPattern);
              }}
              className="rounded-xl border border-white/10 bg-gray-950 px-4 py-2 text-white outline-none transition focus:border-purple-500/60"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!canSearch || searchState.complete) {
                return;
              }

              setAutoPlay((current) => !current);
            }}
            disabled={!canSearch || searchState.complete}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {autoPlay && !searchState.complete ? "Pause" : "Start Search"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={stepSearch}
            disabled={!canSearch || (autoPlay && !searchState.complete) || searchState.complete}
            className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Step
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={resetSearch}
            className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-700"
          >
            Reset
          </motion.button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-950/60 p-4">
          <div className="min-w-max space-y-6" style={{ width: visualizationWidth }}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                <span>Text</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex gap-1">
                {textChars.map((char, index) => (
                  <div key={`text-${index}`} className="flex flex-col items-center gap-1">
                    <div className={getTextBoxClass(index)}>{char}</div>
                    <span className="text-[10px] text-gray-500">{index}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                <span>Pattern</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="relative h-12">
                <motion.div
                  animate={{ x: alignmentOffset * STEP_DISTANCE }}
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                  className="absolute left-0 top-0 flex gap-1"
                >
                  {patternChars.map((char, index) => (
                    <div key={`pattern-${index}`} className={getPatternBoxClass(index)}>
                      {char}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                <span>LPS Array</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex gap-1">
                {patternChars.map((char, index) => {
                  const isActive = searchState.activeLpsIndex === index;

                  return (
                    <div key={`lps-${index}`} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500">{index}</span>
                      <motion.div
                        animate={isActive ? { y: [0, -3, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold ${
                          isActive
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-gray-600 bg-gray-800 text-gray-300"
                        }`}
                      >
                        {lps[index] ?? 0}
                      </motion.div>
                      <span className="text-[10px] text-purple-300">{char}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Comparisons", value: searchState.comparisons },
            { label: "Matches Found", value: searchState.matches.length },
            { label: "Current i", value: searchState.i },
            { label: "Current j", value: searchState.j },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-gray-950/60 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500">{stat.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gray-950/60 p-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={searchState.status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-gray-200"
            >
              {searchState.status}
            </motion.p>
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {searchState.matches.map((matchStart) => (
                <motion.span
                  key={matchStart}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
                >
                  Match @ index {matchStart}
                </motion.span>
              ))}
            </AnimatePresence>
            {!searchState.matches.length && <span className="text-xs text-gray-500">No full matches found yet.</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
