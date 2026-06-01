"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiBarChart2, FiCalendar, FiClock, FiRefreshCcw, FiTarget, FiTrendingUp } from "react-icons/fi";
import { HiMiniFire } from "react-icons/hi2";
import LearningPath from "@/components/dashboard/LearningPath";
import NextTopicCard from "@/components/dashboard/NextTopicCard";
import { StreakCalendar } from "@/components/profile/StreakCalendar";
import { TopicProgressCard } from "@/components/profile/TopicProgressCard";
import { levels, topics } from "@/data/topics";
import { calculateTopicCompletion, formatLearningTime, getMilestoneMessage, isTopicMastered } from "@/hooks/useProgressTracker";
import {
  buildLearningNotifications,
  buildLearningPathModel,
  estimateCurrentLevelCompletionMinutes,
  formatDuration,
  getRecommendedTopics,
  getWeakAreasToRevisit,
} from "@/lib/recommendationEngine";
import { getCoreVideoIds } from "@/lib/videoProgress";
import { useStore } from "@/store/useStore";

const glassCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_-30px_rgba(168,85,247,0.45)]";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.08, ease: "easeOut" as const },
  }),
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProfilePage() {
  const { data: session } = useSession();
  // Use individual selectors to prevent hydration issues with Map fields
  const selectedLevel = useStore((state) => state.selectedLevel);
  const completedTopics = useStore((state) => state.completedTopics ?? []);
  const topicProgress = useStore((state) => state.topicProgress ?? {});
  const learningStats = useStore((state) => state.learningStats);
  const dailyStreak = useStore((state) => state.dailyStreak);
  const activityLog = useStore((state) => state.activityLog ?? {});
  const problemHistory = useStore((state) => state.problemHistory ?? []);
  const conceptMastery = useStore((state) => {
    try {
      return state.conceptMastery ?? new Map();
    } catch {
      return new Map();
    }
  });
  const resetProgress = useStore((state) => state.resetProgress);
  const [memberSince] = useState(() => {
    const seededDate = new Date();
    seededDate.setDate(seededDate.getDate() - 30);
    return seededDate;
  });

  const topicLookup = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), []);
  const topicTitlesBySlug = useMemo(
    () => Object.fromEntries(topics.map((topic) => [topic.slug, topic.title])),
    []
  );

  const inProgressTopics = useMemo(
    () =>
      Object.entries(topicProgress)
        .filter(([, progress]) => progress.started && !progress.completedAt)
        .map(([slug, progress]) => ({ topic: topicLookup.get(slug), progress }))
        .filter((entry): entry is { topic: (typeof topics)[number]; progress: (typeof topicProgress)[string] } => Boolean(entry.topic))
        .sort((left, right) => (right.progress.lastAccessedAt ?? "").localeCompare(left.progress.lastAccessedAt ?? "")),
    [topicLookup, topicProgress]
  );

  const recentlyCompleted = useMemo(
    () =>
      Object.entries(topicProgress)
        .filter(([, progress]) => Boolean(progress.completedAt))
        .map(([slug, progress]) => ({ topic: topicLookup.get(slug), progress }))
        .filter((entry): entry is { topic: (typeof topics)[number]; progress: (typeof topicProgress)[string] } => Boolean(entry.topic))
        .sort((left, right) => (right.progress.completedAt ?? "").localeCompare(left.progress.completedAt ?? ""))
        .slice(0, 6),
    [topicLookup, topicProgress]
  );

  const todayKey = toDateKey(new Date());
  const todayTime = activityLog[todayKey]?.timeSpent ?? 0;
  const weekTime = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Object.entries(activityLog).reduce((total, [dateKey, activity]) => {
      const date = new Date(`${dateKey}T00:00:00`);
      const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
      return diffDays >= 0 && diffDays < 7 ? total + activity.timeSpent : total;
    }, 0);
  }, [activityLog]);

  const solvedProblems = problemHistory.filter((attempt) => attempt.isCorrect).length;
  const accuracy = problemHistory.length > 0 ? Math.round((solvedProblems / problemHistory.length) * 100) : 0;

  const levelCompletion = useMemo(
    () =>
      levels.map((level) => {
        const levelTopics = topics.filter((topic) => topic.level === level.id);
        const completed = levelTopics.filter((topic) => Boolean(topicProgress[topic.slug]?.completedAt)).length;
        const percentage = levelTopics.length > 0 ? Math.round((completed / levelTopics.length) * 100) : 0;

        return {
          ...level,
          total: levelTopics.length,
          completed,
          percentage,
        };
      }),
    [topicProgress]
  );

  const highlightMessage = useMemo(() => {
    if (dailyStreak.currentStreak >= 7) {
      return `🔥 ${dailyStreak.currentStreak}-day streak — consistency is becoming your superpower.`;
    }

    if (learningStats.topicsCompleted >= 5) {
      return "You have enough completed topics to start seeing deep DSA pattern overlap.";
    }

    return getMilestoneMessage(
      inProgressTopics[0]
        ? calculateTopicCompletion(inProgressTopics[0].progress, getCoreVideoIds(inProgressTopics[0].topic.youtubeVideos))
        : 0,
      inProgressTopics[0]
        ? isTopicMastered(inProgressTopics[0].progress, getCoreVideoIds(inProgressTopics[0].topic.youtubeVideos))
        : false
    );
  }, [dailyStreak.currentStreak, inProgressTopics, learningStats.topicsCompleted]);

  const recommendationContext = useMemo(
    () => ({ selectedLevel, completedTopics, topicProgress, problemHistory, conceptMastery }),
    [completedTopics, conceptMastery, problemHistory, selectedLevel, topicProgress]
  );
  const suggestedTopics = useMemo(() => getRecommendedTopics(recommendationContext, 5), [recommendationContext]);
  const weakAreas = useMemo(() => getWeakAreasToRevisit(recommendationContext, 3), [recommendationContext]);
  const estimatedLevelCompletion = useMemo(
    () => estimateCurrentLevelCompletionMinutes(recommendationContext),
    [recommendationContext]
  );
  const learningPathPreview = useMemo(
    () => buildLearningPathModel(recommendationContext, { levelFilter: selectedLevel ?? "all" }),
    [recommendationContext, selectedLevel]
  );
  const notifications = useMemo(() => buildLearningNotifications(recommendationContext), [recommendationContext]);

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`mx-auto max-w-2xl p-10 text-center ${glassCardClass}`}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10 text-4xl text-purple-200">
            👤
          </div>
          <h1 className="text-4xl font-semibold text-white">Sign in to unlock your progress cockpit</h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Save streaks, learning time, and topic mastery across sessions with Google sign-in.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google")}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-xl"
          >
            Sign in with Google
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.section
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className={`relative overflow-hidden p-8 md:p-10 ${glassCardClass}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-purple-200/80">
              <FiTrendingUp className="h-3.5 w-3.5" />
              Learning cockpit
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back, {session.user?.name ?? "DSA Explorer"}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{highlightMessage}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                <FiCalendar className="h-4 w-4 text-purple-200" />
                Member since {formatDate(memberSince.toISOString())}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                <FiBarChart2 className="h-4 w-4 text-emerald-300" />
                {accuracy}% practice accuracy
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FiTarget,
                label: "Topics completed",
                value: learningStats.topicsCompleted,
                note: `${learningStats.topicsStarted} started`,
              },
              {
                icon: HiMiniFire,
                label: "Current streak",
                value: `${dailyStreak.currentStreak} days`,
                note: `Best ${dailyStreak.longestStreak} days`,
              },
              {
                icon: FiClock,
                label: "Time this week",
                value: formatLearningTime(weekTime),
                note: `${formatLearningTime(todayTime)} today`,
              },
              {
                icon: FiBarChart2,
                label: "Quizzes taken",
                value: learningStats.quizzesTaken,
                note: `${solvedProblems} solved prompts`,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} whileHover={{ y: -3 }} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-purple-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.note}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className={`p-6 ${glassCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Topics in progress</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Keep the momentum going</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {inProgressTopics.length} active
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {inProgressTopics.length > 0 ? (
              inProgressTopics.map(({ topic, progress }) => (
                <TopicProgressCard
                  key={topic.slug}
                  topic={topic}
                  progress={progress}
                  completionPercentage={calculateTopicCompletion(progress, getCoreVideoIds(topic.youtubeVideos))}
                  mastered={isTopicMastered(progress, getCoreVideoIds(topic.youtubeVideos))}
                />
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
                Start a topic and your active learning queue will show up here.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 ${glassCardClass}`}>
            <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Recently completed</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your latest wins</h2>
            <div className="mt-6 space-y-3">
              {recentlyCompleted.length > 0 ? (
                recentlyCompleted.map(({ topic, progress }) => (
                  <div key={topic.slug} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {topic.icon} {topic.title}
                        </p>
                        <p className="text-sm text-slate-400">Completed on {formatDate(progress.completedAt)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        Done
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-slate-400">
                  Finish a topic to build your completion timeline.
                </p>
              )}
            </div>
          </div>

          <div className={`p-6 ${glassCardClass}`}>
            <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Learning time</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Every minute compounds</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Today", value: formatLearningTime(todayTime) },
                { label: "This week", value: formatLearningTime(weekTime) },
                { label: "Total", value: formatLearningTime(learningStats.totalTimeSpent) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <NextTopicCard recommendations={suggestedTopics} />

          <div className={`space-y-6 p-6 ${glassCardClass}`}>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Suggested next steps</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Personalized guidance from your current data</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Current level</p>
                <p className="mt-2 text-xl font-semibold text-white capitalize">{selectedLevel ?? "beginner"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Time to finish level</p>
                <p className="mt-2 text-xl font-semibold text-white">{formatDuration(estimatedLevelCompletion)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Top suggestion</p>
                <p className="mt-2 text-xl font-semibold text-white">{suggestedTopics[0]?.topic.title ?? "Arrays"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Encouraging notifications</p>
              <div className="mt-3 space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                    {notification.message}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Weak areas to revisit</p>
                <Link href="/learning-path" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
                  View roadmap →
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {weakAreas.length > 0 ? (
                  weakAreas.map((area) => (
                    <div key={area.topic.slug} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-white">{area.topic.title}</p>
                        <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                          {area.quizScore}% quiz score
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{area.primaryReason}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                    No weak areas detected right now — keep pushing your strongest track forward.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <LearningPath
          nodes={learningPathPreview.nodes}
          edges={learningPathPreview.edges}
          progressPercentage={learningPathPreview.progressPercentage}
          preview
          levelFilter={selectedLevel ?? "all"}
        />

        <StreakCalendar activityLog={activityLog} topicTitlesBySlug={topicTitlesBySlug} />
      </motion.section>

      <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className={`p-6 ${glassCardClass}`}>
          <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Completion by level</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">See where your depth is growing</h2>
          <div className="mt-6 space-y-5">
            {levelCompletion.map((level) => (
              <div key={level.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <span>{level.icon}</span>
                    {level.title}
                  </span>
                  <span>
                    {level.completed}/{level.total} • {level.percentage}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level.percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={resetProgress}
          className="inline-flex h-fit items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-200 transition-colors hover:border-red-400/40"
        >
          <FiRefreshCcw className="h-4 w-4" />
          Reset progress
        </motion.button>
      </motion.section>
    </div>
  );
}
