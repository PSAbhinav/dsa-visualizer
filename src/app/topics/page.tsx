"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedComponents";
import { getTopicsByLevel, levels } from "@/data/topics";
import { useStore } from "@/store/useStore";

export default function TopicsPage() {
  const { selectedLevel, setLevel } = useStore();
  const currentLevel = selectedLevel || "beginner";
  const topics = getTopicsByLevel(currentLevel);
  const levelInfo = levels.find((level) => level.id === currentLevel) ?? levels[0];

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
          {topics.map((topic, index) => (
            <StaggerItem key={topic.slug} className="h-full">
              <Link href={`/topics/${topic.slug}`} className="block h-full">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 p-5 transition-all hover:border-purple-500/30 sm:p-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <motion.span
                        className="text-3xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {topic.icon}
                      </motion.span>
                      <span className={`rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white ${topic.color}`}>
                        {topic.algorithms.length} algo{topic.algorithms.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-purple-300">
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

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-300 opacity-80 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      Explore topic
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
  );
}
