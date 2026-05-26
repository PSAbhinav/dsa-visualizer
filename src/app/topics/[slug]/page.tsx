"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getTopicBySlug } from "@/data/topics";
import type { ProgrammingLanguage } from "@/data/types";
import { PageTransition } from "@/components/layout/PageTransition";
import { FadeIn } from "@/components/ui/AnimatedComponents";
import { ArrayVisualizer } from "@/components/visualizers/ArrayVisualizer";
import { LinkedListVisualizer } from "@/components/visualizers/LinkedListVisualizer";
import { StackVisualizer } from "@/components/visualizers/StackVisualizer";
import { QueueVisualizer } from "@/components/visualizers/QueueVisualizer";
import { BinaryTreeVisualizer } from "@/components/visualizers/BinaryTreeVisualizer";
import { GraphVisualizer } from "@/components/visualizers/GraphVisualizer";
import { SortingVisualizer } from "@/components/visualizers/SortingVisualizer";
import { DPVisualizer } from "@/components/visualizers/DPVisualizer";
import { StringVisualizer } from "@/components/visualizers/StringVisualizer";
import { HeapVisualizer } from "@/components/visualizers/HeapVisualizer";
import { HashTableVisualizer } from "@/components/visualizers/HashTableVisualizer";
import { RecursionVisualizer } from "@/components/visualizers/RecursionVisualizer";
import { TrieVisualizer } from "@/components/visualizers/TrieVisualizer";
import { AdvancedGraphVisualizer } from "@/components/visualizers/AdvancedGraphVisualizer";
import { StringAlgoVisualizer } from "@/components/visualizers/StringAlgoVisualizer";
import { AdvancedDPVisualizer } from "@/components/visualizers/AdvancedDPVisualizer";
import { SearchingVisualizer } from "@/components/visualizers/SearchingVisualizer";
import { MathVisualizer } from "@/components/visualizers/MathVisualizer";
import { MatrixVisualizer } from "@/components/visualizers/MatrixVisualizer";
import { TwoPointersVisualizer } from "@/components/visualizers/TwoPointersVisualizer";
import { GreedyVisualizer } from "@/components/visualizers/GreedyVisualizer";
import { BitManipVisualizer } from "@/components/visualizers/BitManipVisualizer";
import { SegmentTreeVisualizer } from "@/components/visualizers/SegmentTreeVisualizer";
import { DisjointSetVisualizer } from "@/components/visualizers/DisjointSetVisualizer";
import { OOPVisualizer } from "@/components/visualizers/OOPVisualizer";
import { DivideConquerVisualizer } from "@/components/visualizers/DivideConquerVisualizer";
import { NetworkFlowVisualizer } from "@/components/visualizers/NetworkFlowVisualizer";
import { GeometryVisualizer } from "@/components/visualizers/GeometryVisualizer";
import Link from "next/link";

const languageLabels: Record<ProgrammingLanguage, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  go: "Go",
};

function getVisualizer(type: string) {
  switch (type) {
    case "array":
      return <ArrayVisualizer />;
    case "string":
      return <StringVisualizer />;
    case "linkedlist":
      return <LinkedListVisualizer />;
    case "stack":
      return <StackVisualizer />;
    case "queue":
      return <QueueVisualizer />;
    case "binarytree":
    case "bst":
      return <BinaryTreeVisualizer />;
    case "heap":
      return <HeapVisualizer />;
    case "trie":
      return <TrieVisualizer />;
    case "graph":
      return <GraphVisualizer />;
    case "advancedgraph":
      return <AdvancedGraphVisualizer />;
    case "sorting":
      return <SortingVisualizer />;
    case "dp":
      return <DPVisualizer />;
    case "advanceddp":
      return <AdvancedDPVisualizer />;
    case "recursion":
      return <RecursionVisualizer />;
    case "hashtable":
      return <HashTableVisualizer />;
    case "stringalgo":
      return <StringAlgoVisualizer />;
    case "searching":
      return <SearchingVisualizer />;
    case "math":
      return <MathVisualizer />;
    case "matrix":
      return <MatrixVisualizer />;
    case "twopointers":
      return <TwoPointersVisualizer />;
    case "greedy":
      return <GreedyVisualizer />;
    case "bitmanip":
      return <BitManipVisualizer />;
    case "segmenttree":
      return <SegmentTreeVisualizer />;
    case "disjointset":
      return <DisjointSetVisualizer />;
    case "oop":
      return <OOPVisualizer />;
    case "divideconquer":
      return <DivideConquerVisualizer />;
    case "networkflow":
      return <NetworkFlowVisualizer />;
    case "geometry":
      return <GeometryVisualizer />;
    default:
      return <ArrayVisualizer />;
  }
}

export default function TopicDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const topic = getTopicBySlug(slug ?? "");
  const [activeTab, setActiveTab] = useState<"visual" | "algorithm" | "problems">("visual");
  const [selectedAlgoIndex, setSelectedAlgoIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>("python");
  const [isVisualizerFullscreen, setIsVisualizerFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!topic) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-gray-900/70 p-8 text-center shadow-2xl shadow-purple-950/20"
          >
            <div className="mb-4 text-6xl">🔎</div>
            <h1 className="mb-3 text-3xl font-bold text-white">Topic not found</h1>
            <p className="mb-6 text-gray-400">
              We couldn&apos;t find the topic you were looking for. It may have been renamed, removed, or the link may be incorrect.
            </p>
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
            >
              <span>←</span>
              <span>Back to Topics</span>
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    { id: "visual" as const, label: "Visual", description: "Interactive walkthrough" },
    { id: "algorithm" as const, label: "Algorithm", description: "Pseudocode & code" },
    { id: "problems" as const, label: "Problems", description: "Practice set" },
  ];
  const selectedAlgorithm = topic.algorithms[selectedAlgoIndex] ?? topic.algorithms[0];
  const availableImplementations = selectedAlgorithm?.code ?? [];
  const activeImplementation =
    availableImplementations.find((impl) => impl.language === selectedLanguage) ?? availableImplementations[0];
  const explanationPoints = topic.detailedExplanation
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const tabTransition = { duration: 0.35, ease: "easeOut" as const };
  const languageIcons: Record<ProgrammingLanguage, string> = {
    python: "🐍",
    java: "☕",
    cpp: "<>",
    javascript: "{}",
    go: "🐹",
  };
  const highlightCodeLine = (line: string) => {
    const tokens = line
      .split(
        /(\s+|".*?"|'.*?'|`.*?`|\/\/.*$|#.*$|\b(?:class|const|let|var|function|return|if|else|for|while|break|continue|public|private|protected|static|new|def|import|from|package|func|switch|case|default|true|false|null|None|self|this|in|and|or)\b|\d+)/g
      )
      .filter((token) => token !== "");

    return tokens.map((token, tokenIndex) => {
      let className = "text-slate-300";

      if (/^\s+$/.test(token)) {
        className = "";
      } else if (/^\/\/.*$|^#.*$/.test(token)) {
        className = "text-slate-500";
      } else if (/^".*"$|^'.*'$|^`.*`$/.test(token)) {
        className = "text-emerald-300";
      } else if (
        /^(?:class|const|let|var|function|return|if|else|for|while|break|continue|public|private|protected|static|new|def|import|from|package|func|switch|case|default|true|false|null|None|self|this|in|and|or)$/.test(
          token
        )
      ) {
        className = "text-fuchsia-300";
      } else if (/^\d+$/.test(token)) {
        className = "text-amber-300";
      } else if (/^[\[\](){}]+$/.test(token)) {
        className = "text-cyan-300";
      }

      return (
        <span key={`${line}-${token}-${tokenIndex}`} className={className}>
          {token}
        </span>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <Link href="/topics" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
            <motion.span whileHover={{ x: -3 }} className="text-lg">←</motion.span>
            <span className="text-sm">Back to Topics</span>
          </Link>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080710]/90 p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-fuchsia-500/10" />
            <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] xl:items-center">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-lg shadow-purple-900/20"
                  >
                    {topic.icon}
                  </motion.div>
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white ${topic.color}`}>
                        {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-purple-200">
                        Interactive topic detail
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{topic.title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{topic.shortDescription}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-200">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-base">💡</span>
                  Real World Analogy
                </div>
                <p className="text-sm leading-7 text-slate-200">{topic.realWorldAnalogy}</p>
              </div>
            </div>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-2 shadow-lg shadow-purple-950/10 backdrop-blur-xl">
            <div className="grid gap-2 md:grid-cols-3">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative overflow-hidden rounded-2xl px-4 py-4 text-left transition-colors ${
                    activeTab === tab.id ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <>
                      <motion.div
                        layoutId="topicTabBg"
                        className="absolute inset-0 rounded-2xl border border-purple-400/30 bg-purple-500/[0.18] shadow-lg shadow-purple-950/30"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                      <motion.div
                        layoutId="topicTabUnderline"
                        className="absolute inset-x-4 bottom-2 h-0.5 rounded-full bg-gradient-to-r from-fuchsia-300 via-purple-300 to-cyan-300"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    </>
                  )}
                  <div className="relative z-10">
                    <p className="text-sm font-semibold">{tab.label}</p>
                    <p className="mt-1 text-xs text-slate-400/90">{tab.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </FadeIn>

        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "visual" && (
            <motion.section
              key="visual"
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -24, y: -12 }}
              transition={tabTransition}
              className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.58fr)]"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 backdrop-blur-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Concept guide</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Build the intuition first</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{topic.shortDescription}</p>

                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
                  }}
                  className="mt-6 space-y-3"
                >
                  {explanationPoints.map((point, index) => (
                    <motion.div
                      key={`${point}-${index}`}
                      variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                      className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-4"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-sm text-purple-200">
                        ✦
                      </span>
                      <p className="text-sm leading-7 text-slate-200">{point}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 backdrop-blur-xl"
              >
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Visualizer</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Interactive playground</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsVisualizerFullscreen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/15 px-4 py-2.5 text-sm font-medium text-purple-100 transition-colors hover:bg-purple-500/20"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Fullscreen
                  </motion.button>
                </div>
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 p-3">
                  {getVisualizer(topic.visualizerType)}
                </div>
              </motion.div>
            </motion.section>
          )}

          {activeTab === "algorithm" && selectedAlgorithm && (
            <motion.section
              key="algorithm"
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -24, y: -12 }}
              transition={tabTransition}
              className="space-y-6"
            >
              {topic.algorithms.length > 1 && (
                <div className="overflow-x-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-2 shadow-lg shadow-purple-950/10 backdrop-blur-xl">
                  <div className="flex min-w-max gap-2">
                    {topic.algorithms.map((algo, i) => (
                      <motion.button
                        key={algo.name}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedAlgoIndex(i);
                          if (topic.algorithms[i].code?.[0]?.language) {
                            setSelectedLanguage(topic.algorithms[i].code![0].language);
                          }
                          setCopiedCode(false);
                        }}
                        className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          selectedAlgoIndex === i
                            ? "text-white"
                            : "border border-white/[0.08] bg-black/20 text-slate-400 hover:text-white"
                        }`}
                      >
                        {selectedAlgoIndex === i && (
                          <motion.div
                            layoutId="algorithmPill"
                            className="absolute inset-0 rounded-full border border-purple-400/30 bg-purple-500/[0.18]"
                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10">{algo.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedAlgorithm.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]"
                >
                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 backdrop-blur-xl">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Pseudocode</p>
                          <h2 className="mt-2 text-2xl font-semibold text-white">{selectedAlgorithm.name}</h2>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                          {selectedAlgorithm.timeComplexity} · {selectedAlgorithm.spaceComplexity}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950/95 shadow-inner shadow-black/30">
                        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          <span className="ml-3 text-xs text-slate-500">pseudocode.txt</span>
                        </div>
                        <div className="max-h-[520px] overflow-auto px-4 py-4 font-mono text-sm leading-7">
                          {selectedAlgorithm.pseudocode.split("\n").map((line, index) => (
                            <div key={`${selectedAlgorithm.name}-pseudo-${index}`} className="grid grid-cols-[auto_1fr] gap-4">
                              <span className="select-none text-right text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                              <span className="whitespace-pre-wrap break-words text-slate-200">{highlightCodeLine(line)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {availableImplementations.length > 0 && (
                      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 backdrop-blur-xl">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Implementation</p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">Code implementation</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {availableImplementations.map((impl) => (
                              <motion.button
                                key={impl.language}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setSelectedLanguage(impl.language);
                                  setCopiedCode(false);
                                }}
                                aria-label={languageLabels[impl.language]}
                                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-colors ${
                                  activeImplementation?.language === impl.language
                                    ? "border-purple-400/30 bg-purple-500/[0.18] text-white"
                                    : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
                                }`}
                              >
                                <span className="text-base">{languageIcons[impl.language]}</span>
                                <span className="hidden sm:inline">{languageLabels[impl.language]}</span>
                              </motion.button>
                            ))}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (!activeImplementation) return;
                                navigator.clipboard.writeText(activeImplementation.code);
                                setCopiedCode(true);
                                window.setTimeout(() => setCopiedCode(false), 1500);
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-purple-400/30 hover:text-white"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="4" y="8" width="12" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {copiedCode ? "Copied" : "Copy"}
                            </motion.button>
                          </div>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={activeImplementation?.language ?? "no-code"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950/95 shadow-inner shadow-black/30"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                {activeImplementation ? languageLabels[activeImplementation.language] : "No language"}
                              </span>
                              <span className="text-xs text-slate-600">dark theme code view</span>
                            </div>
                            <div className="max-h-[560px] overflow-auto px-4 py-4 font-mono text-sm leading-7">
                              {(activeImplementation?.code ?? "Select a language above").split("\n").map((line, index) => (
                                <div key={`${activeImplementation?.language ?? "code"}-${index}`} className="grid grid-cols-[auto_1fr] gap-4">
                                  <span className="select-none text-right text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                                  <span className="whitespace-pre-wrap break-words text-slate-200">{highlightCodeLine(line)}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">How it works</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{selectedAlgorithm.explanation}</p>
                    </div>

                    <motion.div whileHover={{ y: -2 }} className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-6 backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Time complexity</p>
                      <p className="mt-3 text-3xl font-bold text-white">{selectedAlgorithm.timeComplexity}</p>
                      <p className="mt-2 text-sm text-emerald-100/80">How quickly the algorithm grows as input size increases.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="rounded-[1.75rem] border border-sky-400/20 bg-sky-500/10 p-6 backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Space complexity</p>
                      <p className="mt-3 text-3xl font-bold text-white">{selectedAlgorithm.spaceComplexity}</p>
                      <p className="mt-2 text-sm text-sky-100/80">How much extra memory the approach needs while running.</p>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}

          {activeTab === "problems" && (
            <motion.section
              key="problems"
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -24, y: -12 }}
              transition={tabTransition}
              className="space-y-6"
            >
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                className="grid gap-6"
              >
                {topic.problems.map((problem) => (
                  <motion.div
                    key={problem.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-950/10 transition-colors hover:border-purple-400/25 hover:bg-white/[0.07] backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              problem.difficulty === "Easy"
                                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                                : problem.difficulty === "Medium"
                                ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20"
                                : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                          <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-400">
                            Time {problem.expectedTimeComplexity}
                          </span>
                          <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-400">
                            Space {problem.expectedSpaceComplexity}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-white">{problem.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{problem.description}</p>
                      </div>

                      {problem.leetcodeUrl && (
                        <a
                          href={problem.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/[0.18] hover:text-white"
                        >
                          LeetCode
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path d="M14 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 14 19 5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.8fr)]">
                      <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-200">Complexity hints</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                            Expected time: <span className="font-mono">{problem.expectedTimeComplexity}</span>
                          </span>
                          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-200">
                            Expected space: <span className="font-mono">{problem.expectedSpaceComplexity}</span>
                          </span>
                        </div>
                      </div>

                      <details className="group rounded-2xl border border-white/[0.08] bg-black/20 p-4 open:border-purple-400/20 open:bg-purple-500/[0.08]">
                        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-purple-200 transition-colors group-hover:text-purple-100">
                          <span>Hint trail</span>
                          <span className="text-xs text-slate-500 group-open:rotate-180 transition-transform">⌄</span>
                        </summary>
                        <motion.div
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true }}
                          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                          className="mt-4 space-y-3"
                        >
                          {problem.hints.map((hint, index) => (
                            <motion.div
                              key={`${problem.id}-hint-${index}`}
                              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                              className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/5 p-3"
                            >
                              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-100">
                                {index + 1}
                              </span>
                              <p className="text-sm leading-6 text-slate-300">{hint}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </details>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isVisualizerFullscreen && (
            <>
              <motion.div
                key="visualizer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
                onClick={() => setIsVisualizerFullscreen(false)}
              />
              <motion.div
                key="visualizer-modal"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 16 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#05040c]/95 p-4 shadow-2xl shadow-purple-950/30 backdrop-blur-2xl"
              >
                <div className="mb-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Fullscreen mode</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">{topic.title} visualizer</h2>
                  </div>
                  <button
                    onClick={() => setIsVisualizerFullscreen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-purple-400/30 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Close
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto rounded-[1.75rem] border border-white/10 bg-black/25 p-3">
                  {getVisualizer(topic.visualizerType)}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </div>
  );
}
