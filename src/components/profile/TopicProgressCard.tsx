"use client";

import { motion } from "framer-motion";
import type { Topic } from "@/data/types";
import { QUIZ_PASS_SCORE, formatLearningTime, formatRelativeDate, getMilestoneMessage } from "@/hooks/useProgressTracker";
import type { TopicProgressEntry } from "@/store/useStore";

interface TopicProgressCardProps {
  topic: Topic;
  progress?: TopicProgressEntry;
  completionPercentage: number;
  mastered: boolean;
}

const segments = [
  { key: "visual", label: "Visual" },
  { key: "videos", label: "Videos" },
  { key: "algorithm", label: "Algorithm" },
  { key: "quiz", label: "Quiz" },
] as const;

export function TopicProgressCard({ topic, progress, completionPercentage, mastered }: TopicProgressCardProps) {
  const sectionState = {
    visual: Boolean(progress?.visualizerViewed),
    videos: (progress?.videosWatched.length ?? 0) > 0,
    algorithm: Boolean(progress?.algorithmRead),
    quiz: (progress?.quizScore ?? 0) >= QUIZ_PASS_SCORE,
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_-30px_rgba(168,85,247,0.45)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <p className="text-lg font-semibold text-white">{topic.title}</p>
              <p className="text-sm text-slate-400">{completionPercentage}% complete</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{getMilestoneMessage(completionPercentage, mastered)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            mastered ? "bg-emerald-500/15 text-emerald-200" : "bg-purple-500/15 text-purple-200"
          }`}
        >
          {mastered ? "Mastered" : "In flight"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="grid grid-cols-4 gap-2">
          {segments.map((segment, index) => {
            const active = sectionState[segment.key];

            return (
              <div key={segment.key} className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: active ? "100%" : "0%" }}
                    transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400"
                  />
                </div>
                <p className={`text-center text-[11px] uppercase tracking-[0.22em] ${active ? "text-purple-100" : "text-slate-500"}`}>
                  {segment.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Time spent</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatLearningTime(progress?.timeSpent ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Last accessed</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatRelativeDate(progress?.lastAccessedAt)}</p>
        </div>
      </div>
    </motion.article>
  );
}
