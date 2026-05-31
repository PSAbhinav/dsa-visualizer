import { levels, topics, type Level, type Topic } from "@/data/topics";
import { topicPrerequisites } from "@/data/topicDependencies";
import type { TopicMastery } from "@/lib/analytics";
import type { ProblemAttempt, TopicProgressMap } from "@/store/useStore";

export const QUIZ_RECOMMENDATION_THRESHOLD = 70;

const levelOrder = levels.reduce<Record<Level, number>>((accumulator, level, index) => {
  accumulator[level.id] = index;
  return accumulator;
}, {} as Record<Level, number>);

const topicOrder = new Map(topics.map((topic, index) => [topic.slug, index]));

const estimatedMinutesByLevel: Record<Level, number> = {
  beginner: 65,
  intermediate: 95,
  advanced: 125,
  pro: 155,
};

const topicLookup = new Map(topics.map((topic) => [topic.slug, topic]));

const directDependents = Object.entries(topicPrerequisites).reduce<Record<string, string[]>>((accumulator, [topicSlug, prerequisites]) => {
  prerequisites.forEach((prerequisite) => {
    accumulator[prerequisite] = [...(accumulator[prerequisite] ?? []), topicSlug];
  });
  return accumulator;
}, {});

function collectDependents(topicSlug: string, visited = new Set<string>()) {
  const dependents = directDependents[topicSlug] ?? [];

  dependents.forEach((dependentSlug) => {
    if (!visited.has(dependentSlug)) {
      visited.add(dependentSlug);
      collectDependents(dependentSlug, visited);
    }
  });

  return visited;
}

const futureUnlockValue = topics.reduce<Record<string, number>>((accumulator, topic) => {
  accumulator[topic.slug] = collectDependents(topic.slug).size;
  return accumulator;
}, {});

export interface RecommendationPrerequisite {
  slug: string;
  title: string;
  completed: boolean;
}

export interface RecommendationContext {
  selectedLevel: Level | null;
  completedTopics: string[];
  topicProgress?: TopicProgressMap;
  problemHistory?: ProblemAttempt[];
  conceptMastery?: Map<string, TopicMastery>;
}

export interface TopicRecommendation {
  topic: Topic;
  score: number;
  reasons: string[];
  primaryReason: string;
  prerequisiteStatus: RecommendationPrerequisite[];
  completedPrerequisites: number;
  missingPrerequisites: string[];
  unlocked: boolean;
  shouldRevisit: boolean;
  quizScore?: number;
  masteryScore?: number;
  completionPercentage: number;
  dependentTopicsCount: number;
  estimatedMinutes: number;
}

export type LearningPathStatus = "completed" | "current" | "available" | "locked";

export interface LearningPathNode {
  topic: Topic;
  status: LearningPathStatus;
  completionPercentage: number;
  quizScore?: number;
  masteryScore?: number;
  recommendationRank?: number;
  prerequisiteStatus: RecommendationPrerequisite[];
}

export interface LearningPathEdge {
  from: string;
  to: string;
  satisfied: boolean;
}

export interface LearningPathModel {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  progressPercentage: number;
}

export interface RecommendationNotification {
  id: string;
  message: string;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function average(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCompletedSet(completedTopics: string[], topicProgress?: TopicProgressMap) {
  const completedSet = new Set(completedTopics);

  Object.entries(topicProgress ?? {}).forEach(([slug, progress]) => {
    if (progress.completedAt) {
      completedSet.add(slug);
    }
  });

  return completedSet;
}

function getCompletionPercentage(progress?: TopicProgressMap[string]) {
  if (!progress) {
    return 0;
  }

  const completion =
    (progress.visualizerViewed ? 20 : 0) +
    Math.min(progress.videosWatched.length, 3) * 10 +
    (progress.algorithmRead ? 20 : 0) +
    (typeof progress.quizScore === "number" ? clamp(progress.quizScore, 0, 100) * 0.3 : 0) +
    clamp((progress.timeSpent / (12 * 60)) * 100, 0, 100) * 0.2;

  return clamp(Math.round(completion), 0, 100);
}

export function deriveTopicQuizScores(topicProgress?: TopicProgressMap, problemHistory: ProblemAttempt[] = []) {
  const scores: Record<string, number> = {};

  topics.forEach((topic) => {
    const collectedScores: number[] = [];
    const progressScore = topicProgress?.[topic.slug]?.quizScore;

    if (typeof progressScore === "number") {
      collectedScores.push(progressScore);
    }

    problemHistory
      .filter((attempt) => attempt.topicSlug === topic.slug)
      .forEach((attempt) => {
        if (typeof attempt.quizScore === "number") {
          collectedScores.push(attempt.quizScore);
        } else {
          collectedScores.push(attempt.isCorrect ? 85 : 55);
        }
      });

    const topicAverage = average(collectedScores);

    if (typeof topicAverage === "number") {
      scores[topic.slug] = clamp(Math.round(topicAverage), 0, 100);
    }
  });

  return scores;
}

function getLevelAlignmentBonus(topicLevel: Level, selectedLevel: Level | null) {
  if (!selectedLevel) {
    return 12 - levelOrder[topicLevel] * 2;
  }

  const difference = levelOrder[topicLevel] - levelOrder[selectedLevel];

  if (difference === 0) {
    return 24;
  }

  if (difference === -1) {
    return 18;
  }

  if (difference === 1) {
    return 8;
  }

  return difference < -1 ? 10 : 0;
}

function buildReasons(
  topic: Topic,
  prerequisites: RecommendationPrerequisite[],
  unlocked: boolean,
  shouldRevisit: boolean,
  quizScore: number | undefined,
  completionPercentage: number,
  selectedLevel: Level | null,
  dependentTopicsCount: number,
) {
  const reasons: string[] = [];
  const completedPrerequisiteTitles = prerequisites.filter((item) => item.completed).map((item) => item.title);
  const missingPrerequisiteTitles = prerequisites.filter((item) => !item.completed).map((item) => item.title);

  if (shouldRevisit && typeof quizScore === "number") {
    reasons.push(`Your latest quiz performance here is ${quizScore}%, so a quick revisit should strengthen this concept.`);
  }

  if (completionPercentage > 0 && completionPercentage < 100) {
    reasons.push(`You are already ${completionPercentage}% of the way through ${topic.title}.`);
  }

  if (unlocked && completedPrerequisiteTitles.length > 0) {
    reasons.push(`You have already completed ${completedPrerequisiteTitles.join(", ")}, which unlocks this topic.`);
  }

  if (unlocked && prerequisites.length === 0) {
    reasons.push(`${topic.title} is a foundation topic with no prerequisites, so you can jump in right away.`);
  }

  if (!unlocked && missingPrerequisiteTitles.length > 0) {
    reasons.push(`Finish ${missingPrerequisiteTitles.join(", ")} first to fully unlock this topic.`);
  }

  if (selectedLevel && topic.level === selectedLevel) {
    reasons.push(`It matches your ${selectedLevel} learning focus.`);
  }

  if (dependentTopicsCount > 0) {
    reasons.push(`It unlocks ${dependentTopicsCount} future ${dependentTopicsCount === 1 ? "topic" : "topics"}, making it a high-impact next step.`);
  }

  return reasons;
}

function getEstimatedMinutes(topic: Topic, completionPercentage: number) {
  const baseline = estimatedMinutesByLevel[topic.level];
  return Math.max(20, Math.round(baseline * (1 - completionPercentage / 100)));
}

export function getRecommendedTopics(context: RecommendationContext, limit = topics.length) {
  const completedSet = getCompletedSet(context.completedTopics, context.topicProgress);
  const quizScores = deriveTopicQuizScores(context.topicProgress, context.problemHistory ?? []);
  const anyHistory =
    completedSet.size > 0 ||
    Object.values(context.topicProgress ?? {}).some((progress) => progress.started) ||
    (context.problemHistory?.length ?? 0) > 0;

  const recommendations = topics
    .map<TopicRecommendation | null>((topic, topicIndex) => {
      const progress = context.topicProgress?.[topic.slug];
      const prerequisites = (topicPrerequisites[topic.slug] ?? []).map((slug) => ({
        slug,
        title: topicLookup.get(slug)?.title ?? slug,
        completed: completedSet.has(slug),
      }));
      const completedPrerequisites = prerequisites.filter((item) => item.completed).length;
      const missingPrerequisites = prerequisites.filter((item) => !item.completed).map((item) => item.slug);
      const unlocked = missingPrerequisites.length === 0;
      const completionPercentage = getCompletionPercentage(progress);
      const quizScore = quizScores[topic.slug];
      const masteryScore = context.conceptMastery?.get(topic.slug)?.overallMastery;
      const shouldRevisit = Boolean(typeof quizScore === "number" && quizScore < QUIZ_RECOMMENDATION_THRESHOLD && (completedSet.has(topic.slug) || progress?.started));
      const completed = completedSet.has(topic.slug);

      if (completed && !shouldRevisit) {
        return null;
      }

      let score = 18;
      score += getLevelAlignmentBonus(topic.level, context.selectedLevel);
      score += futureUnlockValue[topic.slug] * 2.4;
      score += completionPercentage * 0.22;
      score += topicIndex * -0.15;

      if (progress?.started && !completed) {
        score += 26;
      }

      if (unlocked) {
        score += prerequisites.length === 0 ? (anyHistory ? 10 : 18) : 34 + completedPrerequisites * 6;
      } else {
        score -= missingPrerequisites.length * 15;
        score += completedPrerequisites * 3;
      }

      if (!anyHistory && prerequisites.length === 0) {
        score += 14;
      }

      if (shouldRevisit && typeof quizScore === "number") {
        score += 32 + (QUIZ_RECOMMENDATION_THRESHOLD - quizScore) * 0.8;
      }

      if (typeof masteryScore === "number") {
        score += masteryScore >= 80 ? 8 : masteryScore < 60 ? 6 : 0;
      }

      if (context.selectedLevel && levelOrder[topic.level] < levelOrder[context.selectedLevel] && !unlocked) {
        score += 8;
      }

      const dependentTopicsCount = futureUnlockValue[topic.slug];
      const reasons = buildReasons(
        topic,
        prerequisites,
        unlocked,
        shouldRevisit,
        quizScore,
        completionPercentage,
        context.selectedLevel,
        dependentTopicsCount,
      );

      return {
        topic,
        score,
        reasons,
        primaryReason: reasons[0] ?? `This is a strong next step for your ${context.selectedLevel ?? "current"} learning path.`,
        prerequisiteStatus: prerequisites,
        completedPrerequisites,
        missingPrerequisites,
        unlocked,
        shouldRevisit,
        quizScore,
        masteryScore,
        completionPercentage,
        dependentTopicsCount,
        estimatedMinutes: getEstimatedMinutes(topic, completionPercentage),
      };
    })
    .filter((recommendation): recommendation is TopicRecommendation => Boolean(recommendation))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.unlocked !== right.unlocked) {
        return Number(right.unlocked) - Number(left.unlocked);
      }

      return (topicOrder.get(left.topic.slug) ?? 0) - (topicOrder.get(right.topic.slug) ?? 0);
    });

  return recommendations.slice(0, limit);
}

export function getWeakAreasToRevisit(context: RecommendationContext, limit = 3) {
  return getRecommendedTopics(context)
    .filter((recommendation) => recommendation.shouldRevisit)
    .sort((left, right) => (left.quizScore ?? 100) - (right.quizScore ?? 100))
    .slice(0, limit);
}

export function estimateCurrentLevelCompletionMinutes(context: RecommendationContext) {
  const level = context.selectedLevel ?? "beginner";
  const completedSet = getCompletedSet(context.completedTopics, context.topicProgress);

  return topics
    .filter((topic) => topic.level === level)
    .reduce((total, topic) => {
      if (completedSet.has(topic.slug)) {
        return total;
      }

      return total + getEstimatedMinutes(topic, getCompletionPercentage(context.topicProgress?.[topic.slug]));
    }, 0);
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "Less than 1 hour";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

export function buildLearningPathModel(
  context: RecommendationContext,
  options: { levelFilter?: Level | "all" } = {},
): LearningPathModel {
  const recommendations = getRecommendedTopics(context);
  const recommendationRank = new Map(recommendations.map((recommendation, index) => [recommendation.topic.slug, index + 1]));
  const completedSet = getCompletedSet(context.completedTopics, context.topicProgress);
  const quizScores = deriveTopicQuizScores(context.topicProgress, context.problemHistory ?? []);
  const filteredTopics =
    options.levelFilter && options.levelFilter !== "all"
      ? topics.filter((topic) => topic.level === options.levelFilter)
      : topics;
  const visibleSlugs = new Set(filteredTopics.map((topic) => topic.slug));

  const nodes = filteredTopics.map<LearningPathNode>((topic) => {
    const progress = context.topicProgress?.[topic.slug];
    const prerequisites = (topicPrerequisites[topic.slug] ?? []).map((slug) => ({
      slug,
      title: topicLookup.get(slug)?.title ?? slug,
      completed: completedSet.has(slug),
    }));
    const unlocked = prerequisites.every((item) => item.completed);
    const completionPercentage = getCompletionPercentage(progress);
    const completed = completedSet.has(topic.slug);
    const started = Boolean(progress?.started && !completed);
    const status: LearningPathStatus = completed ? "completed" : started ? "current" : unlocked ? "available" : "locked";

    return {
      topic,
      status,
      completionPercentage,
      quizScore: quizScores[topic.slug],
      masteryScore: context.conceptMastery?.get(topic.slug)?.overallMastery,
      recommendationRank: recommendationRank.get(topic.slug),
      prerequisiteStatus: prerequisites,
    };
  });

  const edges = filteredTopics.flatMap<LearningPathEdge>((topic) =>
    (topicPrerequisites[topic.slug] ?? [])
      .filter((dependency) => visibleSlugs.has(dependency))
      .map((dependency) => ({
        from: dependency,
        to: topic.slug,
        satisfied: completedSet.has(dependency),
      })),
  );

  const completedNodes = nodes.filter((node) => node.status === "completed").length;
  const progressPercentage = nodes.length > 0 ? Math.round((completedNodes / nodes.length) * 100) : 0;

  return {
    nodes,
    edges,
    progressPercentage,
  };
}

export function buildLearningNotifications(context: RecommendationContext) {
  const recommendations = getRecommendedTopics(context, 5);
  const notifications: RecommendationNotification[] = [];
  const completedSet = getCompletedSet(context.completedTopics, context.topicProgress);
  const selectedLevel = context.selectedLevel ?? "beginner";
  const selectedLevelIndex = levels.findIndex((level) => level.id === selectedLevel);
  const currentLevelTopics = topics.filter((topic) => topic.level === selectedLevel);
  const remainingCurrentLevel = currentLevelTopics.filter((topic) => !completedSet.has(topic.slug));
  const nextLevel = levels[selectedLevelIndex + 1];
  const arraysNextStep = recommendations.find((recommendation) => recommendation.topic.slug === "sorting-algorithms");

  if (completedSet.has("arrays") && arraysNextStep) {
    notifications.push({
      id: "arrays-next-step",
      message: "You’ve mastered Arrays! Sorting Algorithms is a great next step.",
    });
  }

  if (nextLevel && remainingCurrentLevel.length > 0) {
    notifications.push({
      id: "level-progress",
      message: `Complete ${remainingCurrentLevel.length} more ${remainingCurrentLevel.length === 1 ? "topic" : "topics"} to reach ${nextLevel.title}!`,
    });
  }

  const graphStrength = Math.max(
    context.conceptMastery?.get("graphs")?.overallMastery ?? 0,
    deriveTopicQuizScores(context.topicProgress, context.problemHistory ?? []).graphs ?? 0,
  );

  if (graphStrength >= 80 && !completedSet.has("advanced-graph-algorithms")) {
    notifications.push({
      id: "advanced-graphs",
      message: "Your graph skills are strong. Try Advanced Graph Algorithms!",
    });
  }

  if (notifications.length === 0) {
    const nextSuggestion = recommendations[0];

    if (nextSuggestion) {
      notifications.push({
        id: "next-best-step",
        message: `Next up: ${nextSuggestion.topic.title}. ${nextSuggestion.primaryReason}`,
      });
    } else {
      notifications.push({
        id: "welcome-path",
        message: "Start with Arrays or Basic Math to unlock the rest of your learning path.",
      });
    }
  }

  return notifications.slice(0, 3);
}
