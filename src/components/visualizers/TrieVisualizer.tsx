"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrieNode {
  id: string;
  value: string;
  endOfWord: boolean;
  children: Record<string, TrieNode>;
}

interface PositionedNode {
  id: string;
  value: string;
  x: number;
  y: number;
  endOfWord: boolean;
}

interface PositionedEdge {
  id: string;
  fromId: string;
  toId: string;
  label: string;
}

interface OperationStatus {
  tone: "idle" | "info" | "success" | "error";
  message: string;
}

const INITIAL_WORDS = ["cat", "car", "card", "care", "dog", "do"];
const NODE_SIZE = 32;
const LEVEL_HEIGHT = 88;
const HORIZONTAL_PADDING = 60;
const STEP_DELAY = 700;

let trieNodeCounter = 0;

function createTrieNode(value: string): TrieNode {
  trieNodeCounter += 1;
  return {
    id: `trie-node-${trieNodeCounter}`,
    value,
    endOfWord: false,
    children: {},
  };
}

function normalizeWord(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSortedChildren(node: TrieNode) {
  return Object.values(node.children).sort((a, b) => a.value.localeCompare(b.value));
}

function cloneTrie(node: TrieNode): TrieNode {
  const children: Record<string, TrieNode> = {};

  Object.entries(node.children).forEach(([key, child]) => {
    children[key] = cloneTrie(child);
  });

  return {
    ...node,
    children,
  };
}

function buildInitialTrie(words: string[]) {
  const root = createTrieNode("");

  words.forEach((word) => {
    let current = root;

    for (const char of word) {
      if (!current.children[char]) {
        current.children[char] = createTrieNode(char);
      }

      current = current.children[char];
    }

    current.endOfWord = true;
  });

  return root;
}

function getLeafCount(node: TrieNode): number {
  const children = getSortedChildren(node);

  if (children.length === 0) {
    return 1;
  }

  return children.reduce((total, child) => total + getLeafCount(child), 0);
}

function getMaxDepth(node: TrieNode): number {
  const children = getSortedChildren(node);

  if (children.length === 0) {
    return 0;
  }

  return 1 + Math.max(...children.map(getMaxDepth));
}

function layoutTrie(root: TrieNode) {
  const width = Math.max(720, getLeafCount(root) * 140);
  const height = Math.max(320, (getMaxDepth(root) + 1) * LEVEL_HEIGHT + 80);
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];
  const positions: Record<string, { x: number; y: number }> = {};

  const placeNode = (node: TrieNode, left: number, right: number, depth: number) => {
    const x = (left + right) / 2;
    const y = 52 + depth * LEVEL_HEIGHT;

    nodes.push({
      id: node.id,
      value: node.value,
      x,
      y,
      endOfWord: node.endOfWord,
    });

    positions[node.id] = { x, y };

    const children = getSortedChildren(node);
    if (children.length === 0) {
      return;
    }

    const totalLeaves = children.reduce((total, child) => total + getLeafCount(child), 0);
    let cursor = left;

    children.forEach((child) => {
      const span = ((right - left) * getLeafCount(child)) / totalLeaves;
      const childLeft = cursor;
      const childRight = cursor + span;

      edges.push({
        id: `${node.id}-${child.id}`,
        fromId: node.id,
        toId: child.id,
        label: child.value,
      });

      placeNode(child, childLeft, childRight, depth + 1);
      cursor += span;
    });
  };

  placeNode(root, HORIZONTAL_PADDING, width - HORIZONTAL_PADDING, 0);

  return { width, height, nodes, edges, positions };
}

function collectSubtree(node: TrieNode, prefix: string) {
  const words: string[] = [];
  const nodeIds: string[] = [];

  const walk = (current: TrieNode, currentWord: string) => {
    nodeIds.push(current.id);

    if (current.endOfWord) {
      words.push(currentWord);
    }

    getSortedChildren(current).forEach((child) => {
      walk(child, `${currentWord}${child.value}`);
    });
  };

  walk(node, prefix);

  return {
    words,
    nodeIds,
  };
}

function hasWord(root: TrieNode, word: string) {
  let current = root;

  for (const char of word) {
    const child = current.children[char];

    if (!child) {
      return false;
    }

    current = child;
  }

  return current.endOfWord;
}

export function TrieVisualizer() {
  const [trie, setTrie] = useState<TrieNode>(() => buildInitialTrie(INITIAL_WORDS));
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [failedNodeId, setFailedNodeId] = useState<string | null>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<OperationStatus>({
    tone: "idle",
    message: "Try inserting, searching, or prefix-matching a word.",
  });
  const [operationWord, setOperationWord] = useState("");
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [mode, setMode] = useState<"idle" | "insert" | "search" | "prefix">("idle");

  const layout = layoutTrie(trie);
  const allWords = collectSubtree(trie, "").words;
  const highlightedSet = new Set(highlightedNodeIds);

  const resetVisualState = () => {
    setActiveNodeId(null);
    setHighlightedNodeIds([]);
    setFailedNodeId(null);
    setMatchedWords([]);
    setActiveCharIndex(-1);
  };

  const handleInsert = async () => {
    const word = normalizeWord(inputValue);

    if (!word || isAnimating) {
      if (!word) {
        setStatus({ tone: "error", message: "Enter a word to insert." });
      }
      return;
    }

    setIsAnimating(true);
    setMode("insert");
    setOperationWord(word);
    resetVisualState();
    setStatus({ tone: "info", message: `Inserting \"${word}\" into the trie...` });

    const alreadyPresent = hasWord(trie, word);
    let workingTrie = trie;
    let finalPath: string[] = [];

    for (let index = 0; index < word.length; index += 1) {
      const snapshot = cloneTrie(workingTrie);
      let current = snapshot;
      const pathIds = [snapshot.id];
      let createdNode = false;

      for (let charIndex = 0; charIndex <= index; charIndex += 1) {
        const char = word[charIndex];
        let child = current.children[char];

        if (!child) {
          child = createTrieNode(char);
          current.children[char] = child;
          createdNode = true;
        }

        pathIds.push(child.id);
        current = child;
      }

      if (index === word.length - 1) {
        current.endOfWord = true;
      }

      workingTrie = snapshot;
      finalPath = pathIds;
      setTrie(snapshot);
      setHighlightedNodeIds(pathIds.slice(0, -1));
      setFailedNodeId(null);
      setActiveNodeId(pathIds[pathIds.length - 1]);
      setActiveCharIndex(index);
      setStatus({
        tone: "info",
        message: createdNode
          ? `Creating node \"${word[index]}\".`
          : `Following existing node \"${word[index]}\".`,
      });

      await wait(STEP_DELAY);
    }

    setActiveNodeId(null);
    setHighlightedNodeIds(finalPath);
    setActiveCharIndex(word.length);
    setStatus({
      tone: "success",
      message: alreadyPresent
        ? `\"${word}\" already existed. End-of-word confirmed.`
        : `Inserted \"${word}\" successfully!`,
    });
    setInputValue("");
    setIsAnimating(false);
  };

  const handleSearch = async () => {
    const word = normalizeWord(inputValue);

    if (!word || isAnimating) {
      if (!word) {
        setStatus({ tone: "error", message: "Enter a word to search." });
      }
      return;
    }

    setIsAnimating(true);
    setMode("search");
    setOperationWord(word);
    resetVisualState();

    let current = trie;
    const pathIds = [trie.id];

    for (let index = 0; index < word.length; index += 1) {
      const char = word[index];
      const child = current.children[char];

      setActiveCharIndex(index);
      setHighlightedNodeIds(pathIds);

      if (!child) {
        const lastValidNodeId = pathIds[pathIds.length - 1];
        setActiveNodeId(null);
        setFailedNodeId(lastValidNodeId);
        setStatus({
          tone: "error",
          message: `Not Found — missing \"${char}\" after \"${word.slice(0, index)}\".`,
        });
        await wait(STEP_DELAY);
        setIsAnimating(false);
        return;
      }

      pathIds.push(child.id);
      current = child;
      setFailedNodeId(null);
      setActiveNodeId(child.id);
      setStatus({
        tone: "info",
        message: `Searching node \"${char}\"...`,
      });
      await wait(STEP_DELAY);
    }

    setActiveNodeId(null);

    if (current.endOfWord) {
      setHighlightedNodeIds(pathIds);
      setStatus({ tone: "success", message: `Found! \"${word}\" exists in the trie.` });
    } else {
      setHighlightedNodeIds(pathIds.slice(0, -1));
      setFailedNodeId(current.id);
      setStatus({ tone: "error", message: `Not Found — \"${word}\" is only a prefix.` });
    }

    setActiveCharIndex(word.length);
    setIsAnimating(false);
  };

  const handlePrefixSearch = async () => {
    const prefix = normalizeWord(inputValue);

    if (!prefix || isAnimating) {
      if (!prefix) {
        setStatus({ tone: "error", message: "Enter a prefix to search." });
      }
      return;
    }

    setIsAnimating(true);
    setMode("prefix");
    setOperationWord(prefix);
    resetVisualState();

    let current = trie;
    const pathIds = [trie.id];

    for (let index = 0; index < prefix.length; index += 1) {
      const char = prefix[index];
      const child = current.children[char];

      setActiveCharIndex(index);
      setHighlightedNodeIds(pathIds);

      if (!child) {
        const lastValidNodeId = pathIds[pathIds.length - 1];
        setActiveNodeId(null);
        setFailedNodeId(lastValidNodeId);
        setStatus({
          tone: "error",
          message: `No matches — prefix breaks at \"${char}\".`,
        });
        await wait(STEP_DELAY);
        setIsAnimating(false);
        return;
      }

      pathIds.push(child.id);
      current = child;
      setFailedNodeId(null);
      setActiveNodeId(child.id);
      setStatus({
        tone: "info",
        message: `Following prefix node \"${char}\"...`,
      });
      await wait(STEP_DELAY);
    }

    setStatus({ tone: "info", message: `Prefix \"${prefix}\" found. Highlighting matches...` });
    await wait(500);

    const subtree = collectSubtree(current, prefix);
    setActiveNodeId(null);
    setHighlightedNodeIds(Array.from(new Set([...pathIds, ...subtree.nodeIds])));
    setMatchedWords(subtree.words);
    setActiveCharIndex(prefix.length);
    setStatus({
      tone: "success",
      message: subtree.words.length
        ? `Matched ${subtree.words.length} word${subtree.words.length === 1 ? "" : "s"}.`
        : "Prefix found, but no completed words were stored below it.",
    });
    setIsAnimating(false);
  };

  const getNodeClassName = (node: PositionedNode) => {
    const baseClassName =
      "relative w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold shadow-lg";

    if (failedNodeId === node.id) {
      return `${baseClassName} border-red-500 bg-red-500/20 text-white`;
    }

    if (activeNodeId === node.id) {
      return `${baseClassName} border-blue-500 bg-blue-500/20 text-white`;
    }

    if (highlightedSet.has(node.id)) {
      return `${baseClassName} border-green-500 bg-green-500/20 text-white`;
    }

    if (node.endOfWord) {
      return `${baseClassName} border-purple-500 bg-purple-500/30 text-white ring-2 ring-purple-300/20`;
    }

    return `${baseClassName} border-purple-500/50 bg-gray-800 text-white`;
  };

  const getEdgeStyle = (edge: PositionedEdge) => {
    if (failedNodeId === edge.toId) {
      return { stroke: "#ef4444", width: 2.5 };
    }

    if (activeNodeId === edge.toId) {
      return { stroke: "#3b82f6", width: 2.5 };
    }

    if (highlightedSet.has(edge.toId)) {
      return { stroke: "#22c55e", width: 2.5 };
    }

    return { stroke: "rgba(168, 85, 247, 0.35)", width: 1.8 };
  };

  const statusClassName = {
    idle: "border-white/10 bg-white/5 text-gray-300",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    success: "border-green-500/20 bg-green-500/10 text-green-200",
    error: "border-red-500/20 bg-red-500/10 text-red-200",
  }[status.tone];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Trie (Prefix Tree) Visualization</h3>
          <p className="mt-1 text-sm text-gray-400">
            Insert, search, and prefix-match words while watching the trie grow and traverse.
          </p>
        </div>
        <div className="max-w-md rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300">
          <span className="font-semibold text-purple-300">Loaded words:</span> {allWords.join(", ")}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Enter a word or prefix..."
          className="flex-1 rounded-xl border border-white/10 bg-gray-800 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-500"
        />
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleInsert}
            disabled={isAnimating}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Insert
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSearch}
            disabled={isAnimating}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePrefixSearch}
            disabled={isAnimating}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prefix Search
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${status.tone}-${status.message}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${statusClassName}`}
        >
          {status.message}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {operationWord && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
              {mode === "insert"
                ? "Insert path"
                : mode === "search"
                  ? "Search path"
                  : mode === "prefix"
                    ? "Prefix path"
                    : "Current input"}
            </div>
            <div className="flex flex-wrap gap-2">
              {operationWord.split("").map((char, index) => {
                const isProcessed = activeCharIndex > index;
                const isCurrent = activeCharIndex === index;
                const isError = status.tone === "error" && isCurrent;
                const chipClassName = isError
                  ? "border-red-500/40 bg-red-500/20 text-red-100"
                  : isCurrent
                    ? "border-blue-500/40 bg-blue-500/20 text-blue-100"
                    : isProcessed
                      ? "border-green-500/40 bg-green-500/20 text-green-100"
                      : "border-white/10 bg-white/5 text-gray-300";

                return (
                  <motion.span
                    key={`${char}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${chipClassName}`}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4">
        <div
          className="relative mx-auto"
          style={{
            width: `${layout.width}px`,
            height: `${layout.height}px`,
            minWidth: "100%",
          }}
        >
          <svg
            className="absolute inset-0"
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
          >
            {layout.edges.map((edge) => {
              const from = layout.positions[edge.fromId];
              const to = layout.positions[edge.toId];
              const edgeStyle = getEdgeStyle(edge);
              const labelX = (from.x + to.x) / 2;
              const labelY = (from.y + to.y) / 2;

              return (
                <motion.g key={edge.id} initial={false}>
                  <motion.line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edgeStyle.stroke}
                    strokeWidth={edgeStyle.width}
                    strokeLinecap="round"
                    initial={false}
                    animate={{ x1: from.x, y1: from.y, x2: to.x, y2: to.y }}
                  />
                  <motion.g initial={false} animate={{ x: labelX, y: labelY }}>
                    <rect
                      x={-10}
                      y={-10}
                      width={20}
                      height={18}
                      rx={9}
                      fill="rgba(17, 24, 39, 0.92)"
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {edge.label}
                    </text>
                  </motion.g>
                </motion.g>
              );
            })}
          </svg>

          <AnimatePresence>
            {layout.nodes.map((node) => (
              <motion.div
                key={node.id}
                className="absolute"
                style={{ left: 0, top: 0 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  x: node.x - NODE_SIZE / 2,
                  y: node.y - NODE_SIZE / 2,
                  opacity: 1,
                  scale: activeNodeId === node.id ? 1.08 : 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <motion.div
                  animate={{
                    boxShadow:
                      activeNodeId === node.id
                        ? "0 0 24px rgba(59, 130, 246, 0.35)"
                        : highlightedSet.has(node.id)
                          ? "0 0 24px rgba(34, 197, 94, 0.25)"
                          : failedNodeId === node.id
                            ? "0 0 24px rgba(239, 68, 68, 0.25)"
                            : "0 0 0px rgba(0, 0, 0, 0)",
                  }}
                  className={getNodeClassName(node)}
                >
                  {node.value || "∅"}
                  {node.endOfWord && <span className="absolute inset-[3px] rounded-full border border-purple-200/60" />}
                </motion.div>
                {node.value === "" && (
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-gray-400">
                    root
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {(mode === "prefix" || matchedWords.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="mb-2 text-sm font-semibold text-white">Matched words</div>
            <div className="flex flex-wrap gap-2">
              {matchedWords.length > 0 ? (
                matchedWords.map((word) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                  >
                    {word}
                  </motion.span>
                ))
              ) : (
                <span className="text-sm text-gray-400">
                  {mode === "prefix"
                    ? "No matched words for the current prefix."
                    : "Run a prefix search to see the matching words here."}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
