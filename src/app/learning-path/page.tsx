"use client";

import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import LearningPath from "@/components/dashboard/LearningPath";
import NextTopicCard from "@/components/dashboard/NextTopicCard";
import { levels, type Level } from "@/data/topics";
import {
  buildLearningNotifications,
  buildLearningPathModel,
  getRecommendedTopics,
} from "@/lib/recommendationEngine";
import { useStore } from "@/store/useStore";

const pageCardClass =
  "rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.94))] p-5 shadow-[0_26px_90px_-48px_rgba(34,211,238,0.4)] backdrop-blur-2xl sm:p-6";

export default function LearningPathPage() {
  const selectedLevel = useStore((state) => state.selectedLevel);
  const completedTopics = useStore((state) => state.completedTopics ?? []);
  const topicProgress = useStore((state) => state.topicProgress ?? {});
  const problemHistory = useStore((state) => state.problemHistory ?? []);
  const conceptMastery = useStore((state) => {
    try {
      return state.conceptMastery ?? new Map();
    } catch {
      return new Map();
    }
  });
  const [levelFilter, setLevelFilter] = useState<Level | "all">("all");

  const recommendationContext = useMemo(
    () => ({ selectedLevel, completedTopics, topicProgress, problemHistory, conceptMastery }),
    [completedTopics, conceptMastery, problemHistory, selectedLevel, topicProgress],
  );

  const recommendations = useMemo(() => getRecommendedTopics(recommendationContext, 6), [recommendationContext]);
  const learningPath = useMemo(
    () => buildLearningPathModel(recommendationContext, { levelFilter }),
    [levelFilter, recommendationContext],
  );
  const notifications = useMemo(() => buildLearningNotifications(recommendationContext), [recommendationContext]);

  const activeTopic = useMemo(
    () =>
      learningPath.nodes.find((node) => node.status === "current") ??
      learningPath.nodes.find((node) => node.status === "available") ??
      learningPath.nodes[0],
    [learningPath.nodes],
  );

  const unlockedCount = useMemo(
    () => learningPath.nodes.filter((node) => node.status === "available" || node.status === "current").length,
    [learningPath.nodes],
  );

  const levelHighlights = useMemo(() => {
    return levels
      .map((level) => {
        const levelNodes = learningPath.nodes.filter((node) => node.topic.level === level.id);
        const completed = levelNodes.filter((node) => node.status === "completed").length;
        const percentage = levelNodes.length > 0 ? Math.round((completed / levelNodes.length) * 100) : 0;

        return {
          ...level,
          total: levelNodes.length,
          percentage,
        };
      })
      .filter((level) => level.total > 0);
  }, [learningPath.nodes]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_24%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.92)_38%,rgba(168,85,247,0.18))] p-6 shadow-[0_36px_120px_-55px_rgba(34,211,238,0.45)] sm:p-8 lg:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_28%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_420px]">
            <div>
              <p className="text-sm uppercase tracking-[0.34em] text-cyan-300">Production roadmap</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A clean, game-style learning tree for mastering every DSA topic.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200/90 sm:text-lg">
                Move through clear tiers, inspect prerequisite chains, and focus on the exact node that advances your roadmap next.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300/75">Overall progress</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{learningPath.progressPercentage}%</p>
                  <p className="mt-1 text-sm text-slate-300">Across the full roadmap</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300/75">Unlocked now</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{unlockedCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Topics ready to continue</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300/75">Current focus</p>
                  <p className="mt-2 text-xl font-semibold text-white">{activeTopic?.topic.title ?? "Choose a topic"}</p>
                  <p className="mt-1 text-sm text-slate-300">Your frontier node</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/topics"
                  className="inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Browse topics
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:text-cyan-100"
                >
                  Open profile
                </Link>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Tier progress</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Follow the levels</h2>
                </div>
                <span className="rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  roadmap.sh × skill tree
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {levelHighlights.map((level) => (
                  <div key={level.id} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {level.icon} {level.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{level.total} topics in this tier</p>
                      </div>
                      <span className="text-sm font-semibold text-cyan-100">{level.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={clsx("h-full rounded-full bg-gradient-to-r", level.color)} style={{ width: `${level.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-8 rounded-[1.8rem] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Filter the roadmap</p>
                <p className="mt-2 text-sm text-slate-300">Jump to a tier or keep the full vertical timeline visible.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "all" as const, title: "All levels" },
                  ...levels.map((level) => ({ id: level.id, title: `${level.icon} ${level.title}` })),
                ].map((levelOption) => (
                  <button
                    key={levelOption.id}
                    type="button"
                    onClick={() => setLevelFilter(levelOption.id)}
                    className={clsx(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                      levelFilter === levelOption.id
                        ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:text-white",
                    )}
                  >
                    {levelOption.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <LearningPath
          nodes={learningPath.nodes}
          edges={learningPath.edges}
          progressPercentage={learningPath.progressPercentage}
          levelFilter={levelFilter}
        />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <NextTopicCard recommendations={recommendations} />

          <div className="space-y-6">
            <div className={pageCardClass}>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Roadmap focus</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {activeTopic?.topic.icon} {activeTopic?.topic.title ?? "Pick a topic"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activeTopic?.topic.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1">{activeTopic?.completionPercentage ?? 0}% complete</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {typeof activeTopic?.quizScore === "number" ? `Quiz ${activeTopic.quizScore}%` : "Quiz pending"}
                </span>
              </div>
              <Link
                href={activeTopic ? `/topics/${activeTopic.topic.slug}` : "/topics"}
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-200 hover:to-violet-300"
              >
                Open current topic
              </Link>
            </div>

            <div className={pageCardClass}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Encouragement feed</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Stay on pace</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {notifications.length} updates
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-200">
                    {notification.message}
                  </div>
                ))}
              </div>
            </div>

            <div className={pageCardClass}>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Top recommendations</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What to tackle after this</h2>
              <div className="mt-5 space-y-3">
                {recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={recommendation.topic.slug} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">#{index + 1} next step</p>
                        <p className="mt-1 text-lg font-semibold text-white">{recommendation.topic.title}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {recommendation.unlocked ? "Ready" : "Locked"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation.primaryReason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
