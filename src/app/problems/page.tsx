"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiEye,
  FiFilter,
  FiLoader,
  FiSearch,
  FiSliders,
} from "react-icons/fi";
import { topics } from "@/data/topics";
import { useStore } from "@/store/useStore";
import { PageTransition } from "@/components/layout/PageTransition";

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
type SortOption = "difficulty" | "topic" | "status";
type ProblemStatus = "solved" | "attempted" | "unsolved";

const glassCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_-30px_rgba(168,85,247,0.42)]";

const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 } as const;
const statusOrder = { solved: 0, attempted: 1, unsolved: 2 } as const;

export default function ProblemsPage() {
  const router = useRouter();
  const { selectedLevel, problemHistory } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [topicFilter, setTopicFilter] = useState("All topics");
  const [sortBy, setSortBy] = useState<SortOption>("difficulty");
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [loadingProblemId, setLoadingProblemId] = useState<string | null>(null);

  const filteredTopics = useMemo(
    () => (selectedLevel ? topics.filter((topic) => topic.level === selectedLevel) : topics),
    [selectedLevel]
  );

  const historyByProblem = useMemo(() => {
    const entries = new Map<string, typeof problemHistory>();

    problemHistory.forEach((attempt) => {
      const existing = entries.get(attempt.problemId) ?? [];
      existing.push(attempt);
      entries.set(attempt.problemId, existing);
    });

    return entries;
  }, [problemHistory]);

  const allProblems = useMemo(
    () =>
      filteredTopics.flatMap((topic) =>
        topic.problems.map((problem) => {
          const attempts = historyByProblem.get(problem.id) ?? [];
          const status: ProblemStatus = attempts.some((attempt) => attempt.isCorrect)
            ? "solved"
            : attempts.length > 0
              ? "attempted"
              : "unsolved";

          return {
            ...problem,
            topicTitle: topic.title,
            topicSlug: topic.slug,
            topicIcon: topic.icon,
            level: topic.level,
            status,
            attempts: attempts.length,
            acceptedAttempts: attempts.filter((attempt) => attempt.isCorrect).length,
          };
        })
      ),
    [filteredTopics, historyByProblem]
  );

  const topicOptions = useMemo(() => ["All topics", ...filteredTopics.map((topic) => topic.title)], [filteredTopics]);

  const totalProblems = allProblems.length;
  const solvedCount = allProblems.filter((problem) => problem.status === "solved").length;
  const attemptedCount = allProblems.filter((problem) => problem.status !== "unsolved").length;
  const acceptanceRate = attemptedCount > 0 ? Math.round((solvedCount / attemptedCount) * 100) : 0;

  const visibleProblems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...allProblems]
      .filter((problem) => {
        const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter;
        const matchesTopic = topicFilter === "All topics" || problem.topicTitle === topicFilter;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          problem.title.toLowerCase().includes(normalizedSearch) ||
          problem.description.toLowerCase().includes(normalizedSearch) ||
          problem.topicTitle.toLowerCase().includes(normalizedSearch);

        return matchesDifficulty && matchesTopic && matchesSearch;
      })
      .sort((left, right) => {
        if (sortBy === "difficulty") {
          return difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty] || left.title.localeCompare(right.title);
        }

        if (sortBy === "topic") {
          return left.topicTitle.localeCompare(right.topicTitle) || left.title.localeCompare(right.title);
        }

        return statusOrder[left.status] - statusOrder[right.status] || left.title.localeCompare(right.title);
      });
  }, [allProblems, difficultyFilter, searchTerm, sortBy, topicFilter]);

  const selectedProblem =
    visibleProblems.find((problem) => problem.id === selectedProblemId) ??
    allProblems.find((problem) => problem.id === selectedProblemId) ??
    null;

  const difficultySummary = [
    { label: "Easy", count: allProblems.filter((problem) => problem.difficulty === "Easy").length, tone: "text-emerald-300" },
    { label: "Medium", count: allProblems.filter((problem) => problem.difficulty === "Medium").length, tone: "text-yellow-300" },
    { label: "Hard", count: allProblems.filter((problem) => problem.difficulty === "Hard").length, tone: "text-rose-300" },
  ];

  const handleSolve = (problemId: string, topicSlug: string) => {
    setLoadingProblemId(problemId);
    router.push(`/playground?problem=${encodeURIComponent(problemId)}&topic=${encodeURIComponent(topicSlug)}`);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={`relative overflow-hidden p-8 md:p-10 ${glassCardClass}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_26%)]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-purple-200/80">
                <FiFilter className="h-3.5 w-3.5" />
                Problems workspace
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Production-ready practice board</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-300">
                Filter by difficulty, topic, or search intent, then jump into the playground with a starter solution or review the full problem details.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
                {difficultySummary.map((entry) => (
                  <span key={entry.label} className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                    <span className={entry.tone}>{entry.count}</span> {entry.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[420px]">
              {[
                { label: "Total problems", value: totalProblems, tone: "text-white" },
                { label: "Solved", value: solvedCount, tone: "text-emerald-300" },
                { label: "Acceptance rate", value: `${acceptanceRate}%`, tone: "text-purple-200" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className={`mt-8 p-6 ${glassCardClass}`}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_auto_auto_auto]">
            <label className="relative block">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, topic, or concept"
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-purple-400/40"
              />
            </label>

            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
              {["All", "Easy", "Medium", "Hard"].map((option) => {
                const active = difficultyFilter === option;

                return (
                  <motion.button
                    key={option}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDifficultyFilter(option as DifficultyFilter)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400">
              <FiFilter className="h-4 w-4 text-purple-200" />
              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value)}
                className="w-full bg-transparent text-white outline-none"
              >
                {topicOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400">
              <FiSliders className="h-4 w-4 text-purple-200" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="w-full bg-transparent text-white outline-none"
              >
                <option value="difficulty" className="bg-gray-950 text-white">
                  Sort: Difficulty
                </option>
                <option value="topic" className="bg-gray-950 text-white">
                  Sort: Topic
                </option>
                <option value="status" className="bg-gray-950 text-white">
                  Sort: Status
                </option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
              <FiBarChart2 className="h-4 w-4 text-purple-200" />
              Showing {visibleProblems.length} of {totalProblems} problems
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
              <FiCheckCircle className="h-4 w-4 text-emerald-300" />
              {attemptedCount} attempted in your history
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          className="mt-8"
        >
          <AnimatePresence mode="popLayout">
            {visibleProblems.length > 0 ? (
              <motion.div layout className="grid gap-4 xl:grid-cols-2">
                {visibleProblems.map((problem, index) => {
                  const difficultyTone =
                    problem.difficulty === "Easy"
                      ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/20"
                      : problem.difficulty === "Medium"
                        ? "bg-yellow-500/15 text-yellow-100 border-yellow-400/20"
                        : "bg-rose-500/15 text-rose-100 border-rose-400/20";

                  const statusConfig =
                    problem.status === "solved"
                      ? { label: "Solved", icon: FiCheckCircle, tone: "text-emerald-300", dot: "bg-emerald-400" }
                      : problem.status === "attempted"
                        ? { label: "Attempted", icon: FiBarChart2, tone: "text-amber-300", dot: "bg-amber-400" }
                        : { label: "Unsolved", icon: FiCircle, tone: "text-gray-400", dot: "bg-gray-500" };

                  const StatusIcon = statusConfig.icon;
                  const isOpening = loadingProblemId === problem.id;

                  return (
                    <motion.article
                      layout
                      key={problem.id}
                      initial={{ opacity: 0, y: 24, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.98 }}
                      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                      whileHover={{ y: -5 }}
                      className={`group flex h-full flex-col p-6 ${glassCardClass}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg">{problem.topicIcon}</span>
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.26em] text-gray-300">
                              {problem.topicTitle}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyTone}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold text-white transition-colors group-hover:text-purple-200">
                            {problem.title}
                          </h3>
                        </div>

                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${statusConfig.tone}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </div>
                      </div>

                      <p className="mt-4 flex-1 text-sm leading-7 text-gray-300">{problem.description}</p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-gray-300">
                          Time <span className="ml-2 font-mono text-emerald-300">{problem.expectedTimeComplexity}</span>
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-gray-300">
                          Space <span className="ml-2 font-mono text-sky-300">{problem.expectedSpaceComplexity}</span>
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-gray-300">
                          Attempts <span className="ml-2 font-semibold text-white">{problem.attempts}</span>
                        </span>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: isOpening ? 1 : 1.02 }}
                          whileTap={{ scale: isOpening ? 1 : 0.98 }}
                          onClick={() => handleSolve(problem.id, problem.topicSlug)}
                          disabled={Boolean(loadingProblemId)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isOpening ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiArrowRight className="h-4 w-4" />}
                          {isOpening ? "Opening playground..." : "Solve"}
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedProblemId(problem.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-purple-400/30 hover:bg-white/5"
                        >
                          <FiEye className="h-4 w-4" />
                          View details
                        </motion.button>

                        <Link
                          href={`/topics/${problem.topicSlug}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-purple-400/30 hover:bg-white/5"
                        >
                          Lesson
                        </Link>

                        {problem.leetcodeUrl && (
                          <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={problem.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-3 text-sm font-medium text-orange-100 transition-colors hover:border-orange-300/40 hover:bg-orange-500/15"
                          >
                            LeetCode
                            <FiExternalLink className="h-4 w-4" />
                          </motion.a>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-10 text-center ${glassCardClass}`}
              >
                <h2 className="text-2xl font-semibold text-white">No problems match those filters</h2>
                <p className="mt-3 text-gray-400">Try adjusting the search, difficulty, or topic to widen the results.</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm("");
                    setDifficultyFilter("All");
                    setTopicFilter("All topics");
                    setSortBy("difficulty");
                  }}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:border-purple-400/30 hover:bg-purple-500/10"
                >
                  Clear filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <AnimatePresence>
          {selectedProblem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-10 backdrop-blur-md"
              onClick={() => setSelectedProblemId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
                className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-8 ${glassCardClass}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedProblemId(null)}
                  className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-purple-400/30 hover:text-white"
                >
                  Close
                </button>

                <div className="pr-14">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.26em] text-gray-300">
                      {selectedProblem.topicIcon} {selectedProblem.topicTitle}
                    </span>
                    <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-purple-200">
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold text-white">{selectedProblem.title}</h2>
                  <p className="mt-4 text-base leading-8 text-gray-300">{selectedProblem.description}</p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-gray-400">Expected time</p>
                    <p className="mt-2 font-mono text-lg text-emerald-300">{selectedProblem.expectedTimeComplexity}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-gray-400">Expected space</p>
                    <p className="mt-2 font-mono text-lg text-sky-300">{selectedProblem.expectedSpaceComplexity}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="mt-2 text-lg font-semibold capitalize text-white">{selectedProblem.status}</p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
                  <h3 className="text-lg font-semibold text-white">Hints</h3>
                  <div className="mt-4 space-y-3">
                    {selectedProblem.hints.map((hint, index) => (
                      <motion.div
                        key={`${selectedProblem.id}-${index}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-gray-300"
                      >
                        <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-xs font-semibold text-purple-200">
                          {index + 1}
                        </span>
                        {hint}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleSolve(selectedProblem.id, selectedProblem.topicSlug)}
                    disabled={Boolean(loadingProblemId)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingProblemId === selectedProblem.id ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiArrowRight className="h-4 w-4" />}
                    {loadingProblemId === selectedProblem.id ? "Opening playground..." : "Solve in playground"}
                  </button>
                  <Link
                    href={`/topics/${selectedProblem.topicSlug}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white"
                  >
                    Open lesson
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                  {selectedProblem.leetcodeUrl && (
                    <a
                      href={selectedProblem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-3 text-sm font-medium text-orange-100 transition-colors hover:border-orange-300/40 hover:bg-orange-500/15"
                    >
                      Open on LeetCode
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
