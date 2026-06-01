"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { FiArrowRight, FiBarChart2, FiBookOpen, FiClock, FiHelpCircle, FiPlayCircle, FiTarget, FiUser } from "react-icons/fi";
import { HiMiniFire, HiMiniSparkles } from "react-icons/hi2";
import LearningPath from "@/components/dashboard/LearningPath";
import { FloatingParticles } from "@/components/ui/AnimatedComponents";
import { topics } from "@/data/topics";
import { calculateTopicCompletion, formatLearningTime, formatRelativeDate, getMilestoneMessage } from "@/hooks/useProgressTracker";
import { buildLearningPathModel, getRecommendedTopics, type TopicRecommendation } from "@/lib/recommendationEngine";
import { getCoreVideoIds } from "@/lib/videoProgress";
import { useStore } from "@/store/useStore";

interface AuthenticatedDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  href: string;
}

const glassCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_20px_80px_-30px_rgba(34,211,238,0.28)] backdrop-blur-2xl";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.08, ease: "easeOut" as const },
  }),
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "DSA Explorer";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "No recent activity yet";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function RecommendedTopicCard({ recommendation, index }: { recommendation: TopicRecommendation; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 shadow-xl shadow-cyan-950/10 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">#{index + 1} recommended</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{recommendation.topic.icon} {recommendation.topic.title}</h3>
        </div>
        <div className="group/tooltip relative">
          <button
            type="button"
            title={recommendation.primaryReason}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200"
            aria-label={`Why ${recommendation.topic.title} is recommended`}
          >
            <FiHelpCircle className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-sm text-slate-200 opacity-0 shadow-2xl shadow-black/40 transition duration-200 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100">
            <p className="font-semibold text-white">Why recommended</p>
            <p className="mt-2 text-slate-300">{recommendation.primaryReason}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-300">{recommendation.reasons[0] ?? recommendation.primaryReason}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{recommendation.completionPercentage}% complete</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">~{recommendation.estimatedMinutes} min</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {recommendation.shouldRevisit ? "Revisit" : recommendation.unlocked ? "Ready now" : "Build toward it"}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Unlock impact: {recommendation.dependentTopicsCount} future topic{recommendation.dependentTopicsCount === 1 ? "" : "s"}</p>
        <Link
          href={`/topics/${recommendation.topic.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Quick start
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function AuthenticatedDashboard({ user }: AuthenticatedDashboardProps) {
  const selectedLevel = useStore((state) => state.selectedLevel);
  const completedTopics = useStore((state) => state.completedTopics ?? []);
  const topicProgress = useStore((state) => state.topicProgress ?? {});
  const learningStats = useStore((state) => state.learningStats);
  const dailyStreak = useStore((state) => state.dailyStreak);
  const activityLog = useStore((state) => state.activityLog ?? {});
  const problemHistory = useStore((state) => state.problemHistory ?? []);
  const quizHistory = useStore((state) => state.quizHistory ?? []);
  const conceptMastery = useStore((state) => {
    try {
      return state.conceptMastery ?? new Map();
    } catch {
      return new Map();
    }
  });

  const topicLookup = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), []);
  const todayKey = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);
  const todayTime = activityLog[todayKey]?.timeSpent ?? 0;

  const recommendationContext = useMemo(
    () => ({ selectedLevel, completedTopics, topicProgress, problemHistory, conceptMastery }),
    [completedTopics, conceptMastery, problemHistory, selectedLevel, topicProgress]
  );
  const recommendedTopics = useMemo(() => getRecommendedTopics(recommendationContext, 4), [recommendationContext]);
  const learningPathPreview = useMemo(
    () => buildLearningPathModel(recommendationContext, { levelFilter: selectedLevel ?? "all" }),
    [recommendationContext, selectedLevel]
  );

  const currentTopicEntry = useMemo(
    () =>
      Object.entries(topicProgress)
        .map(([slug, progress]) => ({ topic: topicLookup.get(slug), progress }))
        .filter(
          (entry): entry is { topic: (typeof topics)[number]; progress: (typeof topicProgress)[string] } =>
            Boolean(entry.topic) && Boolean(entry.progress.started || entry.progress.lastAccessedAt || entry.progress.completedAt)
        )
        .sort((left, right) => (right.progress.lastAccessedAt ?? right.progress.completedAt ?? "").localeCompare(left.progress.lastAccessedAt ?? left.progress.completedAt ?? ""))[0],
    [topicLookup, topicProgress]
  );

  const continueTopic = currentTopicEntry?.topic ?? recommendedTopics[0]?.topic ?? topicLookup.get("arrays") ?? topics[0];
  const continueProgress = currentTopicEntry?.progress;
  const continueCompletion = continueProgress
    ? calculateTopicCompletion(continueProgress, getCoreVideoIds(continueTopic.youtubeVideos))
    : recommendedTopics[0]?.completionPercentage ?? 0;
  const quizAverage = useMemo(() => {
    const scores =
      quizHistory.length > 0
        ? quizHistory.map((attempt) => attempt.score)
        : Object.values(topicProgress)
            .map((progress) => progress.quizScore)
            .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) {
      return 0;
    }

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [quizHistory, topicProgress]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    quizHistory.forEach((attempt) => {
      const topic = topicLookup.get(attempt.topicSlug);
      activities.push({
        id: `quiz-${attempt.topicSlug}-${attempt.attemptedAt}`,
        title: `Quiz completed: ${topic?.title ?? "Topic"}`,
        detail: `Scored ${attempt.score}% across ${attempt.totalQuestions} questions`,
        timestamp: attempt.attemptedAt,
        href: `/topics/${attempt.topicSlug}/quiz`,
      });
    });

    problemHistory.forEach((attempt) => {
      const topic = topicLookup.get(attempt.topicSlug);
      activities.push({
        id: `problem-${attempt.problemId}-${attempt.attemptedAt}`,
        title: `${attempt.isCorrect ? "Solved" : "Attempted"} practice: ${topic?.title ?? "Topic"}`,
        detail: attempt.isCorrect ? "Nice work turning concept knowledge into problem-solving reps." : "Keep iterating — another attempt will sharpen the pattern.",
        timestamp: attempt.attemptedAt,
        href: "/problems",
      });
    });

    Object.entries(topicProgress).forEach(([slug, progress]) => {
      const topic = topicLookup.get(slug);
      if (!topic) {
        return;
      }

      if (progress.completedAt) {
        activities.push({
          id: `complete-${slug}-${progress.completedAt}`,
          title: `Completed topic: ${topic.title}`,
          detail: "You added another concept to your finished roadmap.",
          timestamp: progress.completedAt,
          href: `/topics/${slug}`,
        });
      }

      if (progress.lastAccessedAt && !progress.completedAt) {
        activities.push({
          id: `study-${slug}-${progress.lastAccessedAt}`,
          title: `Studied ${topic.title}`,
          detail: `${calculateTopicCompletion(progress, getCoreVideoIds(topic.youtubeVideos))}% complete`,
          timestamp: progress.lastAccessedAt,
          href: `/topics/${slug}`,
        });
      }
    });

    return activities.sort((left, right) => right.timestamp.localeCompare(left.timestamp)).slice(0, 5);
  }, [problemHistory, quizHistory, topicLookup, topicProgress]);

  const quickActions = [
    {
      href: `/topics/${continueTopic.slug}/quiz`,
      label: "Start Quiz",
      description: `Test yourself on ${continueTopic.title}`,
      icon: FiPlayCircle,
    },
    {
      href: "/problems",
      label: "Practice Problems",
      description: "Apply what you just learned",
      icon: FiTarget,
    },
    {
      href: "/profile",
      label: "View Profile",
      description: "Review deeper performance insights",
      icon: FiUser,
    },
  ];

  const initials = getInitials(user.name, user.email);

  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-gray-950 text-white"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
        }}
      />
      <FloatingParticles />
      <div className="absolute left-0 top-12 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.section
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className={`relative overflow-hidden p-8 md:p-10 ${glassCardClass}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/90">
                <HiMiniSparkles className="h-3.5 w-3.5" />
                Your learning hub
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-semibold text-white"
                  style={
                    user.image
                      ? {
                          backgroundImage: `linear-gradient(rgba(15,23,42,0.1), rgba(15,23,42,0.1)), url(${user.image})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }
                >
                  {user.image ? <span className="sr-only">{user.name ?? "User avatar"}</span> : initials}
                </div>
                <div>
                  <h1 className="text-4xl font-semibold text-white">Welcome back, {user.name ?? "DSA Explorer"}!</h1>
                  <p className="mt-2 max-w-2xl text-lg leading-8 text-slate-300">
                    {continueProgress
                      ? getMilestoneMessage(continueCompletion, continueCompletion === 100)
                      : "Your next best concepts are ready — jump back in while the momentum is warm."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2">
                  <HiMiniFire className="h-4 w-4 text-orange-300" />
                  Current streak: {dailyStreak.currentStreak} day{dailyStreak.currentStreak === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <FiBookOpen className="h-4 w-4 text-cyan-300" />
                  Focus: {selectedLevel ?? "all levels"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Topics completed", value: learningStats.topicsCompleted || completedTopics.length, note: `${learningStats.topicsStarted} started`, icon: FiTarget },
                { label: "Quiz avg", value: `${quizAverage}%`, note: `${quizHistory.length} attempts logged`, icon: FiBarChart2 },
                { label: "Time spent today", value: formatLearningTime(todayTime), note: `${learningStats.totalTimeSpent > 0 ? formatLearningTime(learningStats.totalTimeSpent) : "0s"} total`, icon: FiClock },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} whileHover={{ y: -3 }} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
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

        <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <div className={`p-6 ${glassCardClass}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Continue learning</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{continueTopic.title}</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {continueCompletion}% complete
              </span>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{continueTopic.shortDescription}</p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <span>Progress toward mastery</span>
                <span>{formatTimestamp(continueProgress?.lastAccessedAt)}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(continueCompletion, continueProgress?.started ? 12 : 6)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                />
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Last activity</p>
                  <p className="mt-1 font-semibold text-white">{formatRelativeDate(continueProgress?.lastAccessedAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Time invested</p>
                  <p className="mt-1 font-semibold text-white">{formatLearningTime(continueProgress?.timeSpent ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Next move</p>
                  <p className="mt-1 font-semibold text-white">{continueCompletion >= 70 ? "Wrap up the quiz" : "Finish one more section"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/topics/${continueTopic.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-300 hover:to-violet-400"
              >
                {continueProgress?.started ? "Continue" : "Start now"}
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/topics/${continueTopic.slug}/quiz`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Start quiz
              </Link>
            </div>
          </div>

          <div className={`p-6 ${glassCardClass}`}>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Quick actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Jump to what matters next</h2>
            <div className="mt-6 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{action.label}</p>
                        <p className="text-sm text-slate-400">{action.description}</p>
                      </div>
                    </div>
                    <FiArrowRight className="h-5 w-5 text-slate-500 transition group-hover:text-cyan-200" />
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants} className={`mt-8 p-6 ${glassCardClass}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Recommended next topics</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Personalized topics based on your progress</h2>
            </div>
            <Link href="/topics" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              Browse all topics
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {recommendedTopics.map((recommendation, index) => (
              <RecommendedTopicCard key={recommendation.topic.slug} recommendation={recommendation} index={index} />
            ))}
          </div>
        </motion.section>

        <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="mt-8 flex flex-col gap-6">
          {/* Interactive Roadmap - Full Width */}
          <div className={`w-full p-2 ${glassCardClass}`}>
            <LearningPath
              nodes={learningPathPreview.nodes}
              edges={learningPathPreview.edges}
              progressPercentage={learningPathPreview.progressPercentage}
              preview
              levelFilter={selectedLevel ?? "all"}
            />
          </div>

          {/* Learning Path Mini-View - Below the roadmap */}
          <div className={`w-full p-6 ${glassCardClass}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Learning path mini-view</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">See your place on the roadmap</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Your current position is highlighted in the roadmap preview, making it easy to understand what is done, what is unlocked, and what comes next.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 min-w-[240px]">
                  <p className="text-sm text-slate-400">Current focus</p>
                  <p className="mt-2 text-xl font-semibold text-white">{continueTopic.title}</p>
                  <p className="mt-2 text-sm text-slate-300 line-clamp-2">{recommendedTopics[0]?.primaryReason ?? "You are on a strong path — keep stacking wins."}</p>
                </div>

                <Link
                  href="/learning-path"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200 whitespace-nowrap"
                >
                  Open full learning path
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants} className={`mt-8 p-6 ${glassCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your last 5 actions</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={activity.href}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    <div>
                      <p className="font-semibold text-white">{activity.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{activity.detail}</p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <p>{formatTimestamp(activity.timestamp)}</p>
                      <p className="mt-1 transition group-hover:text-cyan-200">Open →</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
                Start a topic or take a quiz and your activity feed will light up here.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}
