"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TopicRecommendation } from "@/lib/recommendationEngine";

interface NextTopicCardProps {
  recommendations: TopicRecommendation[];
}

export default function NextTopicCard({ recommendations }: NextTopicCardProps) {
  const [showMore, setShowMore] = useState(false);
  const topRecommendation = recommendations[0];
  const moreSuggestions = useMemo(() => recommendations.slice(1, 4), [recommendations]);

  if (!topRecommendation) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-white shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Suggested next concept</p>
        <h3 className="mt-3 text-2xl font-semibold">Start with Arrays</h3>
        <p className="mt-3 text-sm text-slate-300">
          Arrays unlock the largest part of the DSA roadmap, so they are a friendly place to begin.
        </p>
        <Link
          href="/topics/arrays"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start Learning
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white shadow-2xl shadow-cyan-500/10 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Suggested next concept</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h3 className="text-3xl font-semibold">{topRecommendation.topic.title}</h3>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              {topRecommendation.shouldRevisit ? "Revisit" : topRecommendation.unlocked ? "Ready now" : "Build toward it"}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">{topRecommendation.primaryReason}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Estimated time</p>
          <p className="mt-1">~{topRecommendation.estimatedMinutes} minutes</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Why this is a fit</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {topRecommendation.reasons.slice(0, 3).map((reason) => (
              <li key={reason} className="flex gap-2">
                <span className="mt-1 text-cyan-300">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Prerequisites</p>
          {topRecommendation.prerequisiteStatus.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No prerequisites needed. You can start immediately.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {topRecommendation.prerequisiteStatus.map((prerequisite) => (
                <div
                  key={prerequisite.slug}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm"
                >
                  <span className="text-slate-200">{prerequisite.title}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      prerequisite.completed
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-amber-400/15 text-amber-200"
                    }`}
                  >
                    {prerequisite.completed ? "Completed" : "Needed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/topics/${topRecommendation.topic.slug}`}
          className="inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start Learning
        </Link>
        {moreSuggestions.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowMore((current) => !current)}
            className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200"
          >
            {showMore ? "Hide extra suggestions" : "See more suggestions"}
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {showMore ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {moreSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.topic.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">#{index + 2} suggestion</p>
                  <p className="mt-2 text-lg font-semibold text-white">{suggestion.topic.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{suggestion.primaryReason}</p>
                  <Link
                    href={`/topics/${suggestion.topic.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Explore topic →
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
