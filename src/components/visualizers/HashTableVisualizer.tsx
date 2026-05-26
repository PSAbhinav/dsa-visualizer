"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HashOperation = "insert" | "search" | "delete";
type AnimationPhase = "idle" | "key" | "hash" | "bucket" | "chain" | "done";

type HashEntry = {
  id: string;
  key: string;
  value: string;
  bucket: number;
};

const BUCKET_COUNT = 7;
const OPERATION_DELAY = 700;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getBucketIndex = (key: string) => key.charCodeAt(0) % BUCKET_COUNT;

const initialEntries: HashEntry[] = [
  { id: "alice", key: "Alice", value: "25", bucket: getBucketIndex("Alice") },
  { id: "bob", key: "Bob", value: "30", bucket: getBucketIndex("Bob") },
  { id: "hal", key: "Hal", value: "22", bucket: getBucketIndex("Hal") },
];

export function HashTableVisualizer() {
  const [entries, setEntries] = useState<HashEntry[]>(initialEntries);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [activeOperation, setActiveOperation] = useState<HashOperation | null>(null);
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [activeKey, setActiveKey] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    'Try inserting a name and age, then search or delete to watch chaining in action.'
  );
  const [targetBucket, setTargetBucket] = useState<number | null>(null);
  const [hashCalculation, setHashCalculation] = useState<{ key: string; charCode: number; index: number } | null>(null);
  const [traversedIds, setTraversedIds] = useState<string[]>([]);
  const [foundEntryId, setFoundEntryId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const buckets = Array.from({ length: BUCKET_COUNT }, (_, bucketIndex) =>
    entries.filter((entry) => entry.bucket === bucketIndex)
  );

  const loadFactor = entries.length / BUCKET_COUNT;
  const collisionCount = buckets.reduce((count, bucketEntries) => count + Math.max(0, bucketEntries.length - 1), 0);

  const resetAnimation = (operation: HashOperation, key: string) => {
    setActiveOperation(operation);
    setPhase("key");
    setActiveKey(key);
    setTargetBucket(null);
    setHashCalculation(null);
    setTraversedIds([]);
    setFoundEntryId(null);
  };

  const runInsert = async () => {
    const key = keyInput.trim();
    const value = valueInput.trim();

    if (!key || !value || isRunning) return;

    setIsRunning(true);
    resetAnimation("insert", key);
    setStatusMessage(`Key \"${key}\" appears above the table, ready to be hashed.`);
    await sleep(OPERATION_DELAY);

    const index = getBucketIndex(key);
    const charCode = key.charCodeAt(0);
    const bucketEntries = entries.filter((entry) => entry.bucket === index);

    setPhase("hash");
    setHashCalculation({ key, charCode, index });
    setStatusMessage(`hash(${key}) = ${charCode} % 7 = ${index}`);
    await sleep(OPERATION_DELAY);

    setPhase("bucket");
    setTargetBucket(index);
    setStatusMessage(
      bucketEntries.length > 0
        ? `Bucket ${index} is occupied, so chaining will handle the collision.`
        : `Bucket ${index} is empty and ready for the new entry.`
    );
    await sleep(OPERATION_DELAY);

    setPhase("chain");
    const newEntry: HashEntry = {
      id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      key,
      value,
      bucket: index,
    };

    setEntries((currentEntries) => [...currentEntries, newEntry]);
    setFoundEntryId(newEntry.id);
    setStatusMessage(
      bucketEntries.length > 0
        ? `Collision detected: \"${key}\" slides onto the end of the chain in bucket ${index}.`
        : `\"${key}\" is inserted into bucket ${index}.`
    );
    await sleep(OPERATION_DELAY + 200);

    setPhase("done");
    setKeyInput("");
    setValueInput("");
    setIsRunning(false);
  };

  const runSearch = async () => {
    const key = keyInput.trim();

    if (!key || isRunning) return;

    setIsRunning(true);
    resetAnimation("search", key);
    setStatusMessage(`Searching starts by hashing \"${key}\".`);
    await sleep(OPERATION_DELAY);

    const index = getBucketIndex(key);
    const charCode = key.charCodeAt(0);
    const bucketEntries = entries.filter((entry) => entry.bucket === index);

    setPhase("hash");
    setHashCalculation({ key, charCode, index });
    setStatusMessage(`hash(${key}) = ${charCode} % 7 = ${index}`);
    await sleep(OPERATION_DELAY);

    setPhase("bucket");
    setTargetBucket(index);
    setStatusMessage(`Arrow points to bucket ${index}, where the chain traversal begins.`);
    await sleep(OPERATION_DELAY);

    setPhase("chain");

    let foundEntry: HashEntry | null = null;
    for (const entry of bucketEntries) {
      setTraversedIds((current) => [...current, entry.id]);
      setStatusMessage(`Traversing bucket ${index}: compare \"${key}\" with \"${entry.key}\".`);
      await sleep(OPERATION_DELAY - 100);

      if (entry.key === key) {
        foundEntry = entry;
        setFoundEntryId(entry.id);
        setStatusMessage(`Found \"${entry.key}\" in bucket ${index}.`);
        break;
      }
    }

    if (!foundEntry) {
      setStatusMessage(bucketEntries.length === 0 ? `Bucket ${index} is empty, so \"${key}\" is not in the table.` : `Reached the end of the chain. \"${key}\" was not found.`);
    }

    await sleep(OPERATION_DELAY + 100);
    setPhase("done");
    setKeyInput("");
    setIsRunning(false);
  };

  const runDelete = async () => {
    const key = keyInput.trim();

    if (!key || isRunning) return;

    setIsRunning(true);
    resetAnimation("delete", key);
    setStatusMessage(`Delete starts by hashing \"${key}\" to locate its bucket.`);
    await sleep(OPERATION_DELAY);

    const index = getBucketIndex(key);
    const charCode = key.charCodeAt(0);
    const bucketEntries = entries.filter((entry) => entry.bucket === index);

    setPhase("hash");
    setHashCalculation({ key, charCode, index });
    setStatusMessage(`hash(${key}) = ${charCode} % 7 = ${index}`);
    await sleep(OPERATION_DELAY);

    setPhase("bucket");
    setTargetBucket(index);
    setStatusMessage(`Bucket ${index} is highlighted while the chain is scanned.`);
    await sleep(OPERATION_DELAY);

    setPhase("chain");

    let foundEntry: HashEntry | null = null;
    for (const entry of bucketEntries) {
      setTraversedIds((current) => [...current, entry.id]);
      setStatusMessage(`Checking \"${entry.key}\" in bucket ${index}.`);
      await sleep(OPERATION_DELAY - 100);

      if (entry.key === key) {
        foundEntry = entry;
        setFoundEntryId(entry.id);
        setStatusMessage(`Found \"${entry.key}\". It will be removed from the chain.`);
        await sleep(OPERATION_DELAY);
        setEntries((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id));
        break;
      }
    }

    if (!foundEntry) {
      setStatusMessage(bucketEntries.length === 0 ? `Bucket ${index} is empty, so there is nothing to delete.` : `\"${key}\" was not found, so the chain stays unchanged.`);
    }

    await sleep(OPERATION_DELAY + 100);
    setPhase("done");
    setKeyInput("");
    setValueInput("");
    setIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 shadow-2xl shadow-purple-950/20"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Hash Table Visualization</h3>
          <p className="mt-1 text-sm text-gray-400">
            Watch keys hash into 7 buckets and resolve collisions with chaining.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[240px]">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Load factor</div>
            <div className="mt-1 text-lg font-semibold text-white">{loadFactor.toFixed(2)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Collisions</div>
            <div className="mt-1 text-lg font-semibold text-orange-300">{collisionCount}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1.2fr,1fr]">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyInput}
            onChange={(event) => setKeyInput(event.target.value)}
            placeholder="Key (e.g. Alice)"
            disabled={isRunning}
            className="flex-1 rounded-xl border border-white/10 bg-gray-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
          />
          <input
            type="text"
            value={valueInput}
            onChange={(event) => setValueInput(event.target.value)}
            placeholder="Value / age"
            disabled={isRunning}
            className="w-32 rounded-xl border border-white/10 bg-gray-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: isRunning ? 1 : 1.03 }}
            whileTap={{ scale: isRunning ? 1 : 0.98 }}
            onClick={runInsert}
            disabled={isRunning || !keyInput.trim() || !valueInput.trim()}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Insert
          </motion.button>
          <motion.button
            whileHover={{ scale: isRunning ? 1 : 1.03 }}
            whileTap={{ scale: isRunning ? 1 : 0.98 }}
            onClick={runSearch}
            disabled={isRunning || !keyInput.trim()}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </motion.button>
          <motion.button
            whileHover={{ scale: isRunning ? 1 : 1.03 }}
            whileTap={{ scale: isRunning ? 1 : 0.98 }}
            onClick={runDelete}
            disabled={isRunning || !keyInput.trim()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </motion.button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="min-h-[120px] space-y-4">
          <AnimatePresence mode="wait">
            {phase !== "idle" && activeKey && (
              <motion.div
                key={`key-${activeKey}-${activeOperation}`}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-sm text-purple-100"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-purple-300">Key</span>
                <span className="font-semibold">{activeKey}</span>
                {activeOperation === "insert" && valueInput && (
                  <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-purple-200">value: {valueInput}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hashCalculation && (
              <motion.div
                key={`hash-${hashCalculation.key}-${hashCalculation.index}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 font-mono text-sm text-purple-100"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-purple-300">Hash function</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    hash({hashCalculation.key})
                  </motion.span>
                  <span>=</span>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    {hashCalculation.key}.charCodeAt(0)
                  </motion.span>
                  <span>=</span>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    {hashCalculation.charCode}
                  </motion.span>
                  <span>% 7 =</span>
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
                    className="rounded-lg bg-purple-500/20 px-2 py-1 text-base font-bold text-white"
                  >
                    {hashCalculation.index}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {targetBucket !== null && phase !== "idle" && (
              <motion.div
                key={`bucket-arrow-${targetBucket}-${activeOperation}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="inline-flex items-center gap-2 text-sm text-purple-300"
              >
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="text-lg"
                >
                  ➜
                </motion.span>
                <span>Arrow points to bucket [{targetBucket}]</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-gray-300">{statusMessage}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-gray-950/50 p-3">
        {buckets.map((bucketEntries, bucketIndex) => {
          const isTargetBucket = targetBucket === bucketIndex;
          const isCollisionBucket = bucketEntries.length > 1 || (isTargetBucket && activeOperation === "insert" && bucketEntries.length > 0);
          const bucketBoxClasses = isTargetBucket
            ? "bg-purple-500/20 border-purple-500/30"
            : bucketEntries.length === 0
              ? "bg-gray-500/10 border-white/10"
              : isCollisionBucket
                ? "bg-orange-500/15 border-orange-500/40"
                : "bg-slate-500/15 border-slate-400/30";

          return (
            <div key={bucketIndex} className="flex items-center gap-2 rounded-xl p-2">
              <div className="w-5 text-center">
                <AnimatePresence>
                  {isTargetBucket && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="inline-block text-sm text-purple-300"
                    >
                      ➜
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="w-6 text-xs text-gray-400">[{bucketIndex}]</span>
              <motion.div
                animate={isTargetBucket ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold text-white ${bucketBoxClasses}`}
              >
                {bucketEntries.length || ""}
              </motion.div>

              <div className="flex min-h-[40px] flex-1 flex-wrap items-center gap-2">
                <AnimatePresence initial={false}>
                  {bucketEntries.map((entry, chainIndex) => {
                    const isFound = foundEntryId === entry.id;
                    const isTraversed = traversedIds.includes(entry.id);
                    const entryClasses = isFound
                      ? "border-green-500/40 bg-green-500/15 text-green-100"
                      : isTraversed
                        ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
                        : bucketEntries.length > 1
                          ? "border-orange-500/40 bg-orange-500/10 text-orange-100"
                          : "border-white/10 bg-white/[0.03] text-white";

                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, x: -24, y: 8 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 24, scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={isFound ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className={`min-w-[108px] rounded-xl border px-3 py-2 ${entryClasses}`}
                        >
                          <div className="text-sm font-semibold">{entry.key}</div>
                          <div className="text-xs opacity-80">value: {entry.value}</div>
                        </motion.div>
                        {chainIndex < bucketEntries.length - 1 && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-400"
                          >
                            →
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {bucketEntries.length === 0 && (
                  <span className="text-xs italic text-gray-500">empty</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
