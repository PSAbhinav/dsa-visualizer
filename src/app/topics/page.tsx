"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedComponents";
import { TOPIC_UNLOCK_SCORE, getMissingPrerequisites, isTopicUnlocked } from "@/data/topicDependencies";
import { getTopicBySlug, getTopicsByLevel, levels } from "@/data/topics";
import { useStore } from "@/store/useStore";

export default function TopicsPage() {
  const selectedLevel = useStore((state) => state.selectedLevel);
  const setLevel = useStore((state) => state.setLevel);
  const completedTopics = useStore((state) => state.completedTopics ?? []);
  const bestScores = useStore((state) => state.bestScores);
  const currentLevel = selectedLevel || "beginner";
  const topics = getTopicsByLevel(currentLevel);
  const levelInfo = levels.find((level) => level.id === currentLevel) ?? levels[0];
  const completedSet = new Set(completedTopics);

  return (
    <div className="responsive-container py-8 sm:py-10 lg:py-12">
      <FadeIn className="mb-10 sm:mb-12">
        <h1 className="text-responsive-display mb-4 font-bold text-white">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {levelInfo.icon} {levelInfo.title}
          </span>{" "}
          Topics
        </h1>
        <p className="text-responsive-body max-w-3xl text-gray-400">{levelInfo.description}</p>
      </FadeIn>

      <FadeIn delay={0.2} className="mb-8 sm:mb-10">
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex w-max min-w-full flex-nowrap gap-2 rounded-2xl border border-white/5 bg-gray-900/50 p-1.5 sm:w-fit sm:flex-wrap">
            {levels.map((level) => (
              <motion.button
                key={level.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLevel(level.id)}
                className={`relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                  currentLevel === level.id ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {currentLevel === level.id && (
                  <motion.div
                    layoutId="levelTab"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${level.color} opacity-20`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">
                  {level.icon} {level.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </FadeIn>

      <StaggerContainer
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {topics.map((topic, index) => {
          const unlocked = isTopicUnlocked(topic.slug, completedTopics, bestScores);
          const bestQuizScore = bestScores.get(topic.slug) ?? 0;
          const completed = completedSet.has(topic.slug) || bestQuizScore >= TOPIC_UNLOCK_SCORE;
          const missingPrerequisites = getMissingPrerequisites(topic.slug, completedTopics, bestScores);
          const unlockMessage = missingPrerequisites
            .map((slug) => getTopicBySlug(slug)?.title ?? slug)
            .join(", ");
          const card = (
            <motion.div
              whileHover={unlocked ? { scale: 1.02, y: -5 } : undefined}
              whileTap={unlocked ? { scale: 0.98 } : undefined}
              className={`group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border p-5 transition-all sm:p-6 ${
                unlocked
                  ? "border-white/10 bg-gray-900/50 hover:border-purple-500/30"
                  : "cursor-not-allowed border-white/5 bg-gray-950/70 opacity-65"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${topic.color} transition-opacity duration-500 ${
                  unlocked ? "opacity-0 group-hover:opacity-5" : "opacity-0"
                }`}
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <motion.span
                    className="text-3xl"
                    animate={unlocked ? { scale: [1, 1.1, 1] } : undefined}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {topic.icon}
                  </motion.span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white ${topic.color}`}>
                      {topic.algorithms.length} algo{topic.algorithms.length > 1 ? "s" : ""}
                    </span>
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                        completed
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                          : unlocked
                            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                            : "border-white/10 bg-white/5 text-gray-400"
                      }`}
                      aria-label={completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}
                    >
                      {completed ? "✓" : unlocked ? "→" : "🔒"}
                    </span>
                  </div>
                </div>

                <h3 className={`mb-2 text-xl font-bold transition-colors ${unlocked ? "text-white group-hover:text-purple-300" : "text-gray-300"}`}>
                  {topic.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-400 sm:mb-6">{topic.shortDescription}</p>

                <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    📝 {topic.problems.length} problem{topic.problems.length > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    ⚡ {topic.algorithms.length} algorithm{topic.algorithms.length > 1 ? "s" : ""}
                  </span>
                </div>

                {unlocked ? (
                  <span className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${completed ? "text-emerald-300" : "text-purple-300 opacity-80 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"}`}>
                    {completed ? (bestQuizScore >= TOPIC_UNLOCK_SCORE ? `Completed • ${bestQuizScore}% best quiz` : "Completed") : "Explore topic"}
                    <span aria-hidden="true">{completed ? "✓" : "→"}</span>
                  </span>
                ) : (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                    <p className="font-medium text-white">🔒 Topic locked</p>
                    <p className="mt-1 text-xs leading-6 text-gray-400">Complete {unlockMessage} to unlock.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );

          return (
            <StaggerItem key={topic.slug} className="h-full">
              {unlocked ? (
                <Link href={`/topics/${topic.slug}`} className="block h-full">
                  {card}
                </Link>
              ) : (
                <div className="block h-full" aria-disabled="true">
                  {card}
                </div>
              )}
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
