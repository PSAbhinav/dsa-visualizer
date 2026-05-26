"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiSettings,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { HiMiniFire } from "react-icons/hi2";
import { levels, topics } from "@/data/topics";
import { useStore } from "@/store/useStore";

const glassCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_-30px_rgba(168,85,247,0.45)]";

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: index * 0.12, ease: "easeOut" as const },
  }),
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-semibold text-white">{safeValue}%</span>
        <span className="mt-1 text-xs uppercase tracking-[0.3em] text-purple-200/70">complete</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { selectedLevel, completedTopics, problemHistory, resetProgress } = useStore();
  const [streakDays] = useState(3);

  const visibleTopics = useMemo(
    () => (selectedLevel ? topics.filter((topic) => topic.level === selectedLevel) : topics),
    [selectedLevel]
  );

  const completedCount = useMemo(
    () => completedTopics.filter((slug) => visibleTopics.some((t) => t.slug === slug)).length,
    [completedTopics, visibleTopics]
  );

  const totalTopics = visibleTopics.length;
  const completionRate = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const currentLevel = levels.find((l) => l.id === selectedLevel) || levels[0];
  const memberSince = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  // Create a map from problemId to difficulty
  const problemDifficultyMap = useMemo(() => {
    const map = new Map<string, string>();
    visibleTopics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        map.set(problem.id, problem.difficulty);
      });
    });
    return map;
  }, [visibleTopics]);

  const solvedProblems = problemHistory.filter((p) => p.isCorrect);
  const totalAttempts = problemHistory.length;
  const acceptanceRate = totalAttempts > 0 ? Math.round((solvedProblems.length / totalAttempts) * 100) : 0;

  const allProblems = useMemo(() => visibleTopics.flatMap((t) => t.problems), [visibleTopics]);

  const difficultyStats = [
    {
      difficulty: "Easy",
      count: solvedProblems.filter((p) => problemDifficultyMap.get(p.problemId) === "Easy").length,
      total: allProblems.filter((p) => p.difficulty === "Easy").length,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      difficulty: "Medium",
      count: solvedProblems.filter((p) => problemDifficultyMap.get(p.problemId) === "Medium").length,
      total: allProblems.filter((p) => p.difficulty === "Medium").length,
      color: "bg-amber-500",
      textColor: "text-amber-400",
    },
    {
      difficulty: "Hard",
      count: solvedProblems.filter((p) => problemDifficultyMap.get(p.problemId) === "Hard").length,
      total: allProblems.filter((p) => p.difficulty === "Hard").length,
      color: "bg-rose-500",
      textColor: "text-rose-400",
    },
  ];

  const achievements = [
    {
      title: "First Topic",
      description: "Complete your first DSA topic",
      earned: completedTopics.length >= 1,
      gradient: "from-purple-500/25 to-fuchsia-500/20",
    },
    {
      title: "Problem Solver",
      description: "Solve 10 practice problems",
      earned: solvedProblems.length >= 10,
      gradient: "from-blue-500/25 to-cyan-500/20",
    },
    {
      title: "7-Day Streak",
      description: "Practice daily for a week",
      earned: streakDays >= 7,
      gradient: "from-orange-500/25 to-rose-500/20",
    },
  ];

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
          <h1 className="text-4xl font-semibold text-white">Your DSA journey deserves a real dashboard</h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Sign in with Google to unlock profile analytics, achievements, and progress tracking.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google")}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-xl"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* User Card */}
      <motion.section
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className={`relative overflow-hidden p-8 md:p-10 ${glassCardClass}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {session.user?.image ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                src={session.user.image}
                alt={session.user.name || "Profile avatar"}
                className="h-28 w-28 rounded-[2rem] border border-white/15 object-cover shadow-2xl"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/15 bg-white/5 text-4xl font-semibold text-purple-200">
                {session.user?.name?.charAt(0) ?? "U"}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-purple-200/80">
                <span>{currentLevel.icon}</span>
                {currentLevel.title} learner
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{session.user?.name ?? "DSA Explorer"}</h1>
              <p className="mt-2 text-base text-gray-300">{session.user?.email ?? "No email connected"}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <FiCalendar className="h-4 w-4 text-purple-200" />
                  Member since {formatDate(memberSince)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                  <FiTrendingUp className="h-4 w-4 text-emerald-300" />
                  {acceptanceRate}% practice accuracy
                </span>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-purple-400/30"
          >
            <FiEdit3 className="h-4 w-4" />
            Edit profile
          </motion.button>
        </div>
      </motion.section>

      {/* Stats Dashboard */}
      <motion.section
        custom={1}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-8"
      >
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-200/60">Stats dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Your progress overview</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          <motion.div whileHover={{ y: -4 }} className={`p-6 ${glassCardClass}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
              <FiTarget className="h-4 w-4" />
              Topics completed
            </div>
            <div className="mt-4 flex flex-col items-center gap-4">
              <ProgressRing value={completionRate} />
              <p className="text-lg font-semibold text-white">{completedCount} / {totalTopics} topics</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className={`p-6 ${glassCardClass}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
              <FiBarChart2 className="h-4 w-4" />
              Problems solved
            </div>
            <div className="mt-5 space-y-4">
              {difficultyStats.map((entry) => (
                <div key={entry.difficulty}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={entry.textColor}>{entry.difficulty}</span>
                    <span className="text-gray-400">{entry.count}/{entry.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: entry.total > 0 ? `${(entry.count / entry.total) * 100}%` : "0%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${entry.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className={`p-6 ${glassCardClass}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
              <HiMiniFire className="h-4 w-4" />
              Current streak
            </div>
            <div className="mt-6 flex flex-col items-center">
              <span className="text-6xl font-bold text-orange-400">{streakDays}</span>
              <span className="mt-2 text-sm text-gray-400">days in a row</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className={`p-6 ${glassCardClass}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
              <FiClock className="h-4 w-4" />
              Total attempts
            </div>
            <div className="mt-6 flex flex-col items-center">
              <span className="text-5xl font-bold text-white">{totalAttempts}</span>
              <span className="mt-2 text-sm text-gray-400">{solvedProblems.length} solved</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Achievements */}
      <motion.section
        custom={2}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mt-8"
      >
        <div className={`p-6 ${glassCardClass}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-purple-200">
              <FiAward className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-200/60">Achievements</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Badge cabinet</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + index * 0.08, duration: 0.45 }}
                whileHover={{ y: -3 }}
                className={`rounded-2xl border p-4 ${
                  achievement.earned
                    ? `border-white/10 bg-gradient-to-r ${achievement.gradient}`
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{achievement.title}</p>
                    <p className="mt-1 text-sm text-gray-300">{achievement.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      achievement.earned
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {achievement.earned ? "Earned" : "Locked"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        custom={3}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className={`mt-8 p-6 ${glassCardClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-purple-200">
            <FiSettings className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Settings</h2>
        </div>

        <div className="mt-6 flex gap-4">
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={resetProgress}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-200 transition-colors hover:border-red-400/40"
          >
            Reset progress
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
