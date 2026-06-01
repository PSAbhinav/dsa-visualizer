export const TOPIC_UNLOCK_SCORE = 70;

type TopicScoreLookup = Map<string, number> | Record<string, number> | undefined;

export const topicPrerequisites: Record<string, string[]> = {
  arrays: [],
  strings: [],
  "basic-math": [],
  "linked-lists": ["arrays"],
  stacks: ["arrays", "linked-lists"],
  queues: ["stacks"],
  "sorting-algorithms": ["arrays"],
  searching: ["arrays"],
  "matrix-2d-arrays": ["arrays"],
  "two-pointers-sliding-window": ["arrays", "strings"],
  "hash-tables": ["arrays", "strings"],
  "recursion-backtracking": ["basic-math", "arrays"],
  "binary-trees": ["linked-lists"],
  "binary-search-trees": ["binary-trees", "searching"],
  heaps: ["binary-trees", "arrays"],
  "greedy-algorithms": ["sorting-algorithms", "arrays"],
  "oops-concepts": ["linked-lists"],
  graphs: ["binary-trees"],
  "dynamic-programming": ["recursion-backtracking", "arrays"],
  tries: ["strings", "binary-trees"],
  "divide-and-conquer": ["recursion-backtracking", "sorting-algorithms"],
  "bit-manipulation": ["basic-math", "arrays"],
  "segment-trees": ["binary-trees", "arrays"],
  "disjoint-set": ["graphs"],
  "advanced-graph-algorithms": ["graphs", "heaps", "disjoint-set"],
  "advanced-string-algorithms": ["strings", "tries", "dynamic-programming"],
  "advanced-dp": ["dynamic-programming", "bit-manipulation", "divide-and-conquer"],
  "network-flow": ["graphs", "advanced-graph-algorithms"],
  "computational-geometry": ["basic-math", "divide-and-conquer"],
};

const getBestScore = (topicSlug: string, bestScores?: TopicScoreLookup): number => {
  if (!bestScores) {
    return 0;
  }

  if (bestScores instanceof Map) {
    return bestScores.get(topicSlug) ?? 0;
  }

  return typeof bestScores[topicSlug] === "number" ? bestScores[topicSlug] : 0;
};

const hasPassedTopic = (topicSlug: string, bestScores?: TopicScoreLookup): boolean =>
  getBestScore(topicSlug, bestScores) >= TOPIC_UNLOCK_SCORE;

export const getTopicPrerequisites = (topicSlug: string): string[] => topicPrerequisites[topicSlug] ?? [];

export const isTopicUnlocked = (topicSlug: string, completedTopics: string[] = [], bestScores?: TopicScoreLookup): boolean => {
  if (completedTopics.includes(topicSlug) || hasPassedTopic(topicSlug, bestScores)) {
    return true;
  }

  const prerequisites = getTopicPrerequisites(topicSlug);

  if (prerequisites.length === 0) {
    return true;
  }

  return prerequisites.every((prerequisite) => hasPassedTopic(prerequisite, bestScores));
};

export const getMissingPrerequisites = (topicSlug: string, completedTopics: string[] = [], bestScores?: TopicScoreLookup): string[] => {
  void completedTopics;
  return getTopicPrerequisites(topicSlug).filter((prerequisite) => !hasPassedTopic(prerequisite, bestScores));
};
