"use client";

import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import LearningPath from "@/components/dashboard/LearningPath";
import { levels, type Level } from "@/data/topics";
import { buildLearningPathModel, getRecommendedTopics } from "@/lib/recommendationEngine";
import { useStore } from "@/store/useStore";

function getCurrentLevelTitle(progressNodes: ReturnType<typeof buildLearningPathModel>["nodes"]) {
  for (const level of levels) {
    const levelNodes = progressNodes.filter((node) => node.topic.level === level.id);

    if (levelNodes.length === 0) {
      continue;
    }

    if (levelNodes.some((node) => node.status !== "completed")) {
      return level;
    }
  }

  return levels[levels.length - 1];
}

export default function LearningPathPage() {
  const selectedLevel = useStore((state) => state.selectedLevel);
  const completedTopics = useStore((state) => state.completedTopics);
  const topicProgress = useStore((state) => state.topicProgress);
  const problemHistory = useStore((state) => state.problemHistory);
  const conceptMastery = useStore((state) => state.conceptMastery);
  const [levelFilter, setLevelFilter] = useState<Level | "all">("all");

  const recommendationContext = useMemo(
    () => ({ selectedLevel, completedTopics, topicProgress, problemHistory, conceptMastery }),
    [completedTopics, conceptMastery, problemHistory, selectedLevel, topicProgress],
  );

  const fullLearningPath = useMemo(
    () => buildLearningPathModel(recommendationContext),
    [recommendationContext],
  );

  const learningPath = useMemo(
    () => buildLearningPathModel(recommendationContext, { levelFilter }),
    [levelFilter, recommendationContext],
  );

  const recommendedTopics = useMemo(
    () => getRecommendedTopics(recommendationContext, 4),
    [recommendationContext],
  );

  const activeTopic = useMemo(
    () =>
      learningPath.nodes.find((node) => node.status === "current") ??
      learningPath.nodes.find((node) => node.recommendationRank === 1) ??
      learningPath.nodes.find((node) => node.status === "available") ??
      fullLearningPath.nodes.find((node) => node.status === "current") ??
      fullLearningPath.nodes.find((node) => node.status === "available") ??
      fullLearningPath.nodes[0],
    [fullLearningPath.nodes, learningPath.nodes],
  );

  const overallStats = useMemo(() => {
    const completed = fullLearningPath.nodes.filter((node) => node.status === "completed").length;
    const unlocked = fullLearningPath.nodes.filter((node) => node.status === "current" || node.status === "available").length;
    const currentLevel = getCurrentLevelTitle(fullLearningPath.nodes);

    return {
      completed,
      unlocked,
      currentLevel,
      total: fullLearningPath.nodes.length,
    };
  }, [fullLearningPath.nodes]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,#020617_0%,#020617_32%,#030712_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-6 shadow-[0_32px_120px_-56px_rgba(34,211,238,0.5)] backdrop-blur-2xl sm:p-8"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-300">Learning path</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Explore your DSA roadmap like an interactive strategy map.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Zoom into each concept, pan across prerequisite chains, and inspect exactly what to learn next without ever leaving the board.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeTopic ? (
                <Link
                  href={`/topics/${activeTopic.topic.slug}`}
                  className="inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Continue {activeTopic.topic.title}
                </Link>
              ) : null}
              <Link
                href="/topics"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:text-cyan-100"
              >
                Browse topic library
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 xl:grid-cols-[1.8fr_1fr_1fr_1.2fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Overall progress</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold text-white">{fullLearningPath.progressPercentage}%</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {overallStats.completed} of {overallStats.total} roadmap topics completed
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full border border-cyan-300/25 bg-cyan-400/10 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-cyan-100">
                    {fullLearningPath.progressPercentage}%
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current level</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {overallStats.currentLevel.icon} {overallStats.currentLevel.title}
              </p>
              <p className="mt-2 text-sm text-slate-300">{overallStats.currentLevel.description}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ready now</p>
              <p className="mt-3 text-4xl font-semibold text-white">{overallStats.unlocked}</p>
              <p className="mt-2 text-sm text-slate-300">Unlocked topics you can start immediately</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(15,23,42,0.55))] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Active topic</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {activeTopic ? `${activeTopic.topic.icon} ${activeTopic.topic.title}` : "Choose a topic"}
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {activeTopic?.topic.shortDescription ?? "Select a node on the roadmap to inspect it in detail."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4 backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Roadmap lens</p>
                <p className="mt-1 text-sm text-slate-300">
                  Filter by level, then scroll to zoom, drag to pan, and pinch on mobile for the full map experience.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", ...levels.map((level) => level.id)] as Array<Level | "all">).map((filterValue) => {
                  const isActive = filterValue === levelFilter;
                  const levelMeta = levels.find((level) => level.id === filterValue);
                  const label = filterValue === "all" ? "All levels" : `${levelMeta?.icon} ${levelMeta?.title}`;

                  return (
                    <button
                      key={filterValue}
                      type="button"
                      onClick={() => setLevelFilter(filterValue)}
                      className={clsx(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition",
                        isActive
                          ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/25 hover:text-white",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Next suggestion: {recommendedTopics[0] ? `${recommendedTopics[0].topic.icon} ${recommendedTopics[0].topic.title}` : "Keep exploring"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Focus mode: {levelFilter === "all" ? "Entire roadmap" : levels.find((level) => level.id === levelFilter)?.title}
              </span>
            </div>
          </div>
        </motion.section>

        <LearningPath
          nodes={learningPath.nodes}
          edges={learningPath.edges}
          progressPercentage={fullLearningPath.progressPercentage}
          levelFilter={levelFilter}
        />
      </div>
    </main>
  );
}
