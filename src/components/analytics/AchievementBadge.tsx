"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { AchievementStatus } from "@/lib/analytics";

interface AchievementBadgeProps {
  achievement: AchievementStatus;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const statusLabel = achievement.unlocked ? "Unlocked" : "Locked";
  const shareMessage = useMemo(() => `${achievement.shareText} #DSAVisualizer`, [achievement.shareText]);

  const handleShare = async () => {
    if (typeof navigator === "undefined") {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: achievement.title, text: shareMessage });
        return;
      }

      await navigator.clipboard.writeText(shareMessage);
    } catch {
      // ignore share failures
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: achievement.unlocked ? 0.45 : 0.3 }}
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-xl ${
        achievement.unlocked
          ? "border-white/15 bg-white/10"
          : "border-white/8 bg-slate-950/40 saturate-0"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${achievement.accent} ${achievement.unlocked ? "opacity-100" : "opacity-45"}`} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={achievement.unlocked ? { rotate: [0, 12, -10, 0], scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-3xl"
            >
              {achievement.icon}
            </motion.div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-200/80">{statusLabel}</p>
              <h4 className="mt-1 text-xl font-semibold text-white">{achievement.title}</h4>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-200">
            {achievement.progressLabel}
          </span>
        </div>

        <p className="relative mt-4 text-sm text-slate-200">{achievement.description}</p>

        <div className="relative mt-5">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/45">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-white via-cyan-200 to-emerald-200"
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-200/75">Progress {achievement.progress}%</p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          disabled={!achievement.unlocked}
          className="relative mt-5 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-slate-900/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Share badge
        </button>
      </div>
    </motion.article>
  );
}
