"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  "rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_-30px_rgba(34,211,238,0.35)] backdrop-blur-2xl";

export default function LearningPathPage() {
  // Use individual selectors to prevent hydration issues with Map fields
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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-violet-500/10 p-8 shadow-2xl shadow-cyan-500/10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Full learning path</p>
              <h1 className="mt-3 text-4xl font-semibold">See the roadmap behind every next-step suggestion</h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-300">
                Explore topic dependencies, filter by level, and click each concept node to understand what is unlocked next.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/topics"
                className="inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Browse Topics
              </Link>
              <Link
                href="/profile"
                className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Open Profile
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className={pageCardClass}>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Level filters</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { id: "all" as const, title: "All levels" },
                ...levels.map((level) => ({ id: level.id, title: `${level.icon} ${level.title}` })),
              ].map((levelOption) => (
                <button
                  key={levelOption.id}
                  type="button"
                  onClick={() => setLevelFilter(levelOption.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    levelFilter === levelOption.id
                      ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100"
                      : "border-white/10 text-slate-300 hover:border-cyan-300/40 hover:text-white"
                  }`}
                >
                  {levelOption.title}
                </button>
              ))}
            </div>
          </div>

          <div className={`${pageCardClass} space-y-3`}>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Encouragement feed</p>
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                {notification.message}
              </div>
            ))}
          </div>
        </section>

        <LearningPath
          nodes={learningPath.nodes}
          edges={learningPath.edges}
          progressPercentage={learningPath.progressPercentage}
          levelFilter={levelFilter}
        />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <NextTopicCard recommendations={recommendations} />

          <div className={`${pageCardClass} space-y-4`}>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Top recommendations</p>
              <h2 className="mt-2 text-2xl font-semibold">What to tackle after this</h2>
            </div>
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={recommendation.topic.slug} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">#{index + 1} next step</p>
                    <p className="mt-1 text-lg font-semibold text-white">{recommendation.topic.title}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {recommendation.unlocked ? "Ready" : "Locked"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{recommendation.primaryReason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
