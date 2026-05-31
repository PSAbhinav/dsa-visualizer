import { levels, topics, type Level, type Topic } from "@/data/topics";

export const masteryCategories = ["Arrays", "Trees", "Graphs", "DP", "Algorithms"] as const;

export type MasteryCategory = (typeof masteryCategories)[number];

export interface TopicMastery {
  visualScore: number;
  quizScore: number;
  practiceScore: number;
  overallMastery: number;
}

export interface EfficiencyStats {
  averageQuizTime: number;
  averageQuizScore: number;
  conceptsImplemented: number;
  totalCodeExecutions: number;
}

export interface AnalyticsAttempt {
  problemId: string;
  topicSlug: string;
  userTimeComplexity: string;
  userSpaceComplexity: string;
  isCorrect: boolean;
  attemptedAt: string;
  quizScore?: number;
  quizTimeSeconds?: number;
  practiceScore?: number;
  codeExecutions?: number;
  visualTimeSpentSeconds?: number;
}

export interface CategoryMasteryDatum {
  category: MasteryCategory;
  mastery: number;
  visualScore: number;
  quizScore: number;
  practiceScore: number;
  topicCount: number;
  focus: string;
}

export interface QuizScatterDatum {
  id: string;
  topicSlug: string;
  topicTitle: string;
  score: number;
  timeMinutes: number;
  efficiency: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface VelocityDatum {
  week: string;
  label: string;
  topics: number;
  efficiency: number;
}

export interface TopicScoreDatum {
  topicSlug: string;
  title: string;
  category: MasteryCategory;
  mastery: number;
  averageUser: number;
  visualScore: number;
  quizScore: number;
  practiceScore: number;
}

export interface StrengthWeaknessItem {
  label: string;
  score: number;
  summary: string;
}

export interface AchievementStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  unlocked: boolean;
  progress: number;
  progressLabel: string;
  shareText: string;
}

export interface LevelMasteryDatum {
  level: Level;
  title: string;
  icon: string;
  mastery: number;
  completion: number;
}

const topicLookup = new Map(topics.map((topic) => [topic.slug, topic]));
const problemDifficultyLookup = new Map(
  topics.flatMap((topic) => topic.problems.map((problem) => [problem.id, problem.difficulty] as const))
);

const arraysKeywords = ["array", "string", "linked", "stack", "queue", "hash", "matrix", "pointer"];
const treesKeywords = ["tree", "bst", "heap", "trie", "segment"];
const graphsKeywords = ["graph", "network", "disjoint"];
const dpKeywords = ["dp", "dynamic"];
const averageUserBenchmarks: Record<MasteryCategory, number> = {
  Arrays: 68,
  Trees: 61,
  Graphs: 57,
  DP: 52,
  Algorithms: 64,
};

export const defaultEfficiencyStats: EfficiencyStats = {
  averageQuizTime: 0,
  averageQuizScore: 0,
  conceptsImplemented: 0,
  totalCodeExecutions: 0,
};

export function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateConceptImplementationPercentage(completedTopicsCount: number, totalTopics: number) {
  if (totalTopics <= 0) {
    return 0;
  }

  return clampScore((completedTopicsCount / totalTopics) * 100);
}

export function calculateQuizEfficiency(score: number, timeSeconds: number, targetTimeSeconds = 7 * 60) {
  if (!Number.isFinite(score) || score <= 0) {
    return 0;
  }

  const safeTime = Number.isFinite(timeSeconds) && timeSeconds > 0 ? timeSeconds : targetTimeSeconds;
  const speedFactor = Math.max(0.7, Math.min(1.3, targetTimeSeconds / safeTime));
  return clampScore(score * speedFactor);
}

export function calculateOverallMastery(visualScore: number, quizScore: number, practiceScore: number) {
  return clampScore(visualScore * 0.3 + quizScore * 0.35 + practiceScore * 0.35);
}

function getDifficultyWeight(difficulty: "Easy" | "Medium" | "Hard") {
  if (difficulty === "Easy") return 1;
  if (difficulty === "Hard") return 1.18;
  return 1.08;
}

function getTopicSignal(topicSlug: string) {
  return Math.max(1, topics.findIndex((topic) => topic.slug === topicSlug) + 1);
}

function deriveAttemptMetrics(attempt: AnalyticsAttempt, index: number) {
  const topicSignal = getTopicSignal(attempt.topicSlug);
  const difficulty = problemDifficultyLookup.get(attempt.problemId) ?? "Medium";
  const difficultyWeight = getDifficultyWeight(difficulty);
  const baselineScore = attempt.isCorrect ? 90 : 61;
  const complexityBonus = attempt.userTimeComplexity.startsWith("O(") ? 4 : 0;
  const score = clampScore(
    attempt.quizScore ?? baselineScore + complexityBonus + (topicSignal % 5) * 2 - (difficulty === "Hard" ? 2 : 0) + (index % 3)
  );
  const quizTimeSeconds = Math.max(
    120,
    Math.round(
      attempt.quizTimeSeconds ??
        (difficulty === "Easy" ? 240 : difficulty === "Hard" ? 540 : 360) * (attempt.isCorrect ? 0.9 : 1.08) +
          (topicSignal % 4) * 25
    )
  );
  const practiceScore = clampScore(
    attempt.practiceScore ??
      (attempt.isCorrect ? 86 : 58) + Math.round((attempt.userSpaceComplexity.startsWith("O(") ? 3 : 0) + (difficultyWeight - 1) * 10)
  );
  const codeExecutions = Math.max(1, Math.round(attempt.codeExecutions ?? (attempt.isCorrect ? 2 : 4) + (topicSignal % 3)));
  const visualTimeSpentSeconds = Math.max(
    90,
    Math.round(attempt.visualTimeSpentSeconds ?? 6 * 60 + (attempt.isCorrect ? 120 : 30) + (topicSignal % 4) * 45)
  );

  return {
    difficulty,
    score,
    quizTimeSeconds,
    practiceScore,
    codeExecutions,
    visualTimeSpentSeconds,
    efficiency: calculateQuizEfficiency(score, quizTimeSeconds),
  };
}

export function getTopicCategory(topicLike: Pick<Topic, "slug" | "title" | "visualizerType"> | string): MasteryCategory {
  const topic = typeof topicLike === "string" ? topicLookup.get(topicLike) : topicLike;
  const topicValue = topic ? `${topic.slug} ${topic.title} ${topic.visualizerType}` : String(topicLike);
  const value = topicValue.toLowerCase();

  if (graphsKeywords.some((keyword) => value.includes(keyword))) {
    return "Graphs";
  }

  if (dpKeywords.some((keyword) => value.includes(keyword))) {
    return "DP";
  }

  if (treesKeywords.some((keyword) => value.includes(keyword))) {
    return "Trees";
  }

  if (arraysKeywords.some((keyword) => value.includes(keyword))) {
    return "Arrays";
  }

  return "Algorithms";
}

export function buildConceptMasteryMap({
  completedTopics,
  problemHistory,
  seedMastery,
}: {
  completedTopics: string[];
  problemHistory: AnalyticsAttempt[];
  seedMastery?: Map<string, TopicMastery>;
}) {
  const mastery = new Map(seedMastery ?? []);
  const completedSet = new Set(completedTopics);

  topics.forEach((topic) => {
    const topicAttempts = problemHistory.filter((attempt) => attempt.topicSlug === topic.slug);
    const existing = mastery.get(topic.slug);

    if (topicAttempts.length === 0 && !completedSet.has(topic.slug) && !existing) {
      return;
    }

    if (topicAttempts.length === 0) {
      const visualScore = existing?.visualScore ?? (completedSet.has(topic.slug) ? 78 : 0);
      const quizScore = existing?.quizScore ?? (completedSet.has(topic.slug) ? 72 : 0);
      const practiceScore = existing?.practiceScore ?? (completedSet.has(topic.slug) ? 70 : 0);
      mastery.set(topic.slug, {
        visualScore,
        quizScore,
        practiceScore,
        overallMastery: calculateOverallMastery(visualScore, quizScore, practiceScore),
      });
      return;
    }

    const metrics = topicAttempts.map(deriveAttemptMetrics);
    const visualTargetSeconds = completedSet.has(topic.slug) ? 11 * 60 : 14 * 60;
    const visualScore = clampScore(
      ((existing?.visualScore ?? 0) * 0.15) +
        (metrics.reduce((sum, entry) => sum + entry.visualTimeSpentSeconds, 0) / visualTargetSeconds) * 85 +
        (completedSet.has(topic.slug) ? 12 : 0)
    );
    const quizScore = clampScore(
      (existing?.quizScore ?? 0) * 0.1 + metrics.reduce((sum, entry) => sum + entry.score, 0) / metrics.length
    );
    const practiceScore = clampScore(
      (existing?.practiceScore ?? 0) * 0.1 + metrics.reduce((sum, entry) => sum + entry.practiceScore, 0) / metrics.length +
        (completedSet.has(topic.slug) ? 5 : 0)
    );

    mastery.set(topic.slug, {
      visualScore,
      quizScore,
      practiceScore,
      overallMastery: calculateOverallMastery(visualScore, quizScore, practiceScore),
    });
  });

  return mastery;
}

export function buildEfficiencyStats({
  problemHistory,
  completedTopics,
  conceptMastery,
}: {
  problemHistory: AnalyticsAttempt[];
  completedTopics: string[];
  conceptMastery: Map<string, TopicMastery>;
}): EfficiencyStats {
  const metrics = problemHistory.map(deriveAttemptMetrics);
  const masteryValues = [...conceptMastery.values()];

  return {
    averageQuizTime: metrics.length > 0 ? Math.round(metrics.reduce((sum, entry) => sum + entry.quizTimeSeconds, 0) / metrics.length) : 0,
    averageQuizScore:
      metrics.length > 0
        ? clampScore(metrics.reduce((sum, entry) => sum + entry.score, 0) / metrics.length)
        : clampScore(masteryValues.reduce((sum, entry) => sum + entry.quizScore, 0) / Math.max(masteryValues.length, 1)),
    conceptsImplemented: Math.max(
      completedTopics.length,
      [...conceptMastery.entries()].filter(([, mastery]) => mastery.practiceScore >= 70 || mastery.overallMastery >= 75).length
    ),
    totalCodeExecutions: metrics.reduce((sum, entry) => sum + entry.codeExecutions, 0),
  };
}

export function calculateStreakDays(attempts: Pick<AnalyticsAttempt, "attemptedAt" | "isCorrect">[], referenceDate = new Date()) {
  const normalizedDays = new Set(
    attempts
      .filter((attempt) => attempt.isCorrect)
      .map((attempt) => new Date(attempt.attemptedAt))
      .filter((date) => Number.isFinite(date.getTime()))
      .map((date) => date.toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  while (normalizedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildCategoryMasteryData(conceptMastery: Map<string, TopicMastery>, scopedTopics: Topic[] = topics): CategoryMasteryDatum[] {
  return masteryCategories.map((category) => {
    const topicSlugs = scopedTopics.filter((topic) => getTopicCategory(topic) === category).map((topic) => topic.slug);
    const entries = topicSlugs.map((slug) => conceptMastery.get(slug)).filter((value): value is TopicMastery => Boolean(value));
    const topicCount = topicSlugs.length;
    const visualScore = entries.length > 0 ? clampScore(entries.reduce((sum, entry) => sum + entry.visualScore, 0) / entries.length) : 0;
    const quizScore = entries.length > 0 ? clampScore(entries.reduce((sum, entry) => sum + entry.quizScore, 0) / entries.length) : 0;
    const practiceScore = entries.length > 0 ? clampScore(entries.reduce((sum, entry) => sum + entry.practiceScore, 0) / entries.length) : 0;
    const focus =
      visualScore <= quizScore && visualScore <= practiceScore
        ? "Spend a little longer in the visual playground"
        : quizScore <= practiceScore
        ? "Quick quizzes can sharpen recall here"
        : "Implement this pattern once more to lock it in";

    return {
      category,
      mastery: clampScore(entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.overallMastery, 0) / entries.length : 0),
      visualScore,
      quizScore,
      practiceScore,
      topicCount,
      focus,
    };
  });
}

export function buildQuizScatterData(problemHistory: AnalyticsAttempt[], scopedTopics: Topic[] = topics): QuizScatterDatum[] {
  const scopedTopicSlugs = new Set(scopedTopics.map((topic) => topic.slug));

  const entries = problemHistory
    .filter((attempt) => scopedTopicSlugs.has(attempt.topicSlug))
    .map((attempt, index) => {
      const derived = deriveAttemptMetrics(attempt, index);
      return {
        id: `${attempt.problemId}-${attempt.attemptedAt}-${index}`,
        topicSlug: attempt.topicSlug,
        topicTitle: topicLookup.get(attempt.topicSlug)?.title ?? attempt.topicSlug,
        score: derived.score,
        timeMinutes: Number((derived.quizTimeSeconds / 60).toFixed(1)),
        efficiency: derived.efficiency,
        difficulty: derived.difficulty,
      };
    });

  if (entries.length > 0) {
    return entries.slice(-14);
  }

  return scopedTopics.slice(0, 5).map((topic, index) => ({
    id: `${topic.slug}-mock`,
    topicSlug: topic.slug,
    topicTitle: topic.title,
    score: 68 + index * 6,
    timeMinutes: Number((7.2 - index * 0.6).toFixed(1)),
    efficiency: 64 + index * 7,
    difficulty: index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Hard",
  }));
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function buildLearningVelocityData(
  problemHistory: AnalyticsAttempt[],
  scopedTopics: Topic[] = topics,
  referenceDate = new Date()
): VelocityDatum[] {
  const scopedTopicSlugs = new Set(scopedTopics.map((topic) => topic.slug));
  const buckets = new Map<string, { label: string; topics: Set<string>; efficiencies: number[] }>();

  for (let index = 0; index < 6; index += 1) {
    const weekStart = startOfWeek(new Date(referenceDate));
    weekStart.setDate(weekStart.getDate() - (5 - index) * 7);
    const key = weekStart.toISOString().slice(0, 10);
    buckets.set(key, { label: formatWeekLabel(weekStart), topics: new Set<string>(), efficiencies: [] });
  }

  problemHistory.forEach((attempt, index) => {
    if (!scopedTopicSlugs.has(attempt.topicSlug)) {
      return;
    }

    const date = new Date(attempt.attemptedAt);
    if (!Number.isFinite(date.getTime())) {
      return;
    }

    const key = startOfWeek(date).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) {
      return;
    }

    bucket.topics.add(attempt.topicSlug);
    bucket.efficiencies.push(deriveAttemptMetrics(attempt, index).efficiency);
  });

  const data = [...buckets.entries()].map(([week, bucket]) => ({
    week,
    label: bucket.label,
    topics: bucket.topics.size,
    efficiency: bucket.efficiencies.length > 0 ? clampScore(bucket.efficiencies.reduce((sum, value) => sum + value, 0) / bucket.efficiencies.length) : 0,
  }));

  if (data.some((entry) => entry.topics > 0)) {
    return data;
  }

  return data.map((entry, index) => ({
    ...entry,
    topics: Math.max(0, Math.min(scopedTopics.length, index === data.length - 1 ? 2 : index % 3 === 0 ? 1 : 0)),
    efficiency: 58 + index * 6,
  }));
}

export function buildTopicScoreData(conceptMastery: Map<string, TopicMastery>, scopedTopics: Topic[] = topics): TopicScoreDatum[] {
  return scopedTopics
    .map((topic) => {
      const mastery = conceptMastery.get(topic.slug);
      const category = getTopicCategory(topic);
      return {
        topicSlug: topic.slug,
        title: topic.title,
        category,
        mastery: mastery?.overallMastery ?? 0,
        averageUser: averageUserBenchmarks[category],
        visualScore: mastery?.visualScore ?? 0,
        quizScore: mastery?.quizScore ?? 0,
        practiceScore: mastery?.practiceScore ?? 0,
      };
    })
    .filter((entry) => entry.mastery > 0)
    .sort((left, right) => right.mastery - left.mastery);
}

export function calculateLearningConsistencyScore(streakDays: number, velocityData: VelocityDatum[]) {
  const activeWeeks = velocityData.filter((entry) => entry.topics > 0).length;
  return clampScore(streakDays * 10 + activeWeeks * 7);
}

export function calculateOverallEfficiencyScore({
  implementationPercentage,
  averageMastery,
  averageQuizEfficiency,
  consistencyScore,
}: {
  implementationPercentage: number;
  averageMastery: number;
  averageQuizEfficiency: number;
  consistencyScore: number;
}) {
  return clampScore(
    implementationPercentage * 0.25 + averageMastery * 0.35 + averageQuizEfficiency * 0.25 + consistencyScore * 0.15
  );
}

export function buildStrengthWeaknessBreakdown(categoryData: CategoryMasteryDatum[]) {
  const ranked = [...categoryData].sort((left, right) => right.mastery - left.mastery);
  const toSummary = (entry: CategoryMasteryDatum, tone: "strength" | "weakness"): StrengthWeaknessItem => ({
    label: entry.category,
    score: entry.mastery,
    summary:
      tone === "strength"
        ? `${entry.category} is compounding nicely — keep shipping implementations here.`
        : `${entry.focus} in ${entry.category.toLowerCase()} to raise your next milestone.`,
  });

  return {
    strengths: ranked.slice(0, 2).map((entry) => toSummary(entry, "strength")),
    weaknesses: ranked.slice(-2).reverse().map((entry) => toSummary(entry, "weakness")),
  };
}

export function buildAreasToImprove(categoryData: CategoryMasteryDatum[], topicData: TopicScoreDatum[]) {
  const weakestCategories = [...categoryData].sort((left, right) => left.mastery - right.mastery).slice(0, 2);
  const weakestTopics = [...topicData].sort((left, right) => left.mastery - right.mastery).slice(0, 2);
  const recommendations = [
    ...weakestCategories.map((entry) => `${entry.category}: ${entry.focus}`),
    ...weakestTopics.map((entry) => `${entry.title}: revisit one implementation and then retake a quick quiz.`),
  ];

  return recommendations.length > 0
    ? recommendations
    : ["Start one topic walkthrough, finish its quiz, and run the playground once to unlock personalized recommendations."];
}

export function buildAchievementStatuses({
  problemHistory,
  conceptMastery,
  streakDays,
  scopedTopics = topics,
}: {
  problemHistory: AnalyticsAttempt[];
  conceptMastery: Map<string, TopicMastery>;
  streakDays: number;
  scopedTopics?: Topic[];
}): AchievementStatus[] {
  const scopedTopicSlugs = new Set(scopedTopics.map((topic) => topic.slug));
  const metrics = problemHistory
    .filter((attempt) => scopedTopicSlugs.has(attempt.topicSlug))
    .map((attempt, index) => ({ attempt, derived: deriveAttemptMetrics(attempt, index) }));
  const fastQuizzes = metrics.filter((entry) => entry.derived.quizTimeSeconds <= 5 * 60 && entry.derived.score >= 70).length;
  const perfectScore = metrics.some((entry) => entry.derived.score === 100);
  const arrayTopics = scopedTopics.filter((topic) => getTopicCategory(topic) === "Arrays");
  const masteredArrays = arrayTopics.length > 0 && arrayTopics.every((topic) => (conceptMastery.get(topic.slug)?.overallMastery ?? 0) >= 90);

  return [
    {
      id: "speed-learner",
      title: "Speed Learner",
      description: "Complete 5 quizzes in under 5 minutes with quality answers.",
      icon: "⚡",
      accent: "from-cyan-400/35 via-blue-500/25 to-purple-500/20",
      unlocked: fastQuizzes >= 5,
      progress: Math.min(100, (fastQuizzes / 5) * 100),
      progressLabel: `${Math.min(fastQuizzes, 5)}/5 fast quizzes`,
      shareText: "I just unlocked Speed Learner in my DSA Visualizer journey ⚡",
    },
    {
      id: "perfect-score",
      title: "Perfect Score",
      description: "Hit 100% on any quiz and lock in the concept with confidence.",
      icon: "💯",
      accent: "from-amber-400/35 via-yellow-500/25 to-orange-500/20",
      unlocked: perfectScore,
      progress: perfectScore ? 100 : Math.max(0, ...metrics.map((entry) => entry.derived.score)),
      progressLabel: perfectScore ? "Unlocked" : `${Math.max(0, ...metrics.map((entry) => entry.derived.score), 0)}% best quiz`,
      shareText: "Perfect Score unlocked — one of my quizzes just landed at 100% 💯",
    },
    {
      id: "consistent-coder",
      title: "Consistent Coder",
      description: "Build a 7-day streak and prove your momentum is real.",
      icon: "🔥",
      accent: "from-orange-400/35 via-rose-500/25 to-pink-500/20",
      unlocked: streakDays >= 7,
      progress: Math.min(100, (streakDays / 7) * 100),
      progressLabel: `${Math.min(streakDays, 7)}/7 day streak`,
      shareText: "Consistency pays off — I just hit a 7-day coding streak 🔥",
    },
    {
      id: "master-of-arrays",
      title: "Master of Arrays",
      description: "Reach 90%+ mastery across every array-driven topic in scope.",
      icon: "📦",
      accent: "from-emerald-400/35 via-teal-500/25 to-cyan-500/20",
      unlocked: masteredArrays,
      progress:
        arrayTopics.length > 0
          ? clampScore(
              arrayTopics.reduce((sum, topic) => sum + (conceptMastery.get(topic.slug)?.overallMastery ?? 0), 0) / arrayTopics.length
            )
          : 0,
      progressLabel: masteredArrays
        ? "Unlocked"
        : `${arrayTopics.filter((topic) => (conceptMastery.get(topic.slug)?.overallMastery ?? 0) >= 90).length}/${arrayTopics.length} topics at 90%+`,
      shareText: "Master of Arrays unlocked — my array pattern mastery is now elite 📦",
    },
  ];
}

export function buildLevelMasteryData(conceptMastery: Map<string, TopicMastery>, completedTopics: string[]): LevelMasteryDatum[] {
  const completedSet = new Set(completedTopics);

  return levels.map((level) => {
    const levelTopics = topics.filter((topic) => topic.level === level.id);
    const masteredTopics = levelTopics.map((topic) => conceptMastery.get(topic.slug)).filter((value): value is TopicMastery => Boolean(value));

    return {
      level: level.id,
      title: level.title,
      icon: level.icon,
      mastery: clampScore(masteredTopics.reduce((sum, entry) => sum + entry.overallMastery, 0) / Math.max(masteredTopics.length, 1)),
      completion: calculateConceptImplementationPercentage(
        levelTopics.filter((topic) => completedSet.has(topic.slug)).length,
        levelTopics.length
      ),
    };
  });
}

export function averageScore(values: number[]) {
  return clampScore(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}
