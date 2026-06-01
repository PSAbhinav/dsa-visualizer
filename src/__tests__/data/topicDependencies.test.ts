import { topics } from "@/data/topics";
import {
  TOPIC_UNLOCK_SCORE,
  getMissingPrerequisites,
  getTopicPrerequisites,
  isTopicUnlocked,
  topicPrerequisites,
} from "@/data/topicDependencies";

describe("topicPrerequisites", () => {
  it("defines prerequisites for every topic slug", () => {
    const topicSlugs = topics.map((topic) => topic.slug).sort();
    const dependencySlugs = Object.keys(topicPrerequisites).sort();

    expect(dependencySlugs).toEqual(topicSlugs);
  });

  it("only references valid topic slugs", () => {
    const topicSlugSet = new Set(topics.map((topic) => topic.slug));

    Object.entries(topicPrerequisites).forEach(([slug, prerequisites]) => {
      expect(topicSlugSet.has(slug)).toBe(true);
      prerequisites.forEach((prerequisite) => {
        expect(topicSlugSet.has(prerequisite)).toBe(true);
      });
    });
  });

  it("returns the configured prerequisite chain", () => {
    expect(getTopicPrerequisites("queues")).toEqual(["stacks"]);
    expect(getTopicPrerequisites("graphs")).toEqual(["binary-trees"]);
    expect(getTopicPrerequisites("arrays")).toEqual([]);
  });

  it("only unlocks topics after every prerequisite quiz is passed", () => {
    const bestScores = new Map<string, number>([
      ["arrays", TOPIC_UNLOCK_SCORE],
      ["linked-lists", TOPIC_UNLOCK_SCORE],
    ]);

    expect(isTopicUnlocked("stacks", [], bestScores)).toBe(true);
    expect(isTopicUnlocked("queues", [], bestScores)).toBe(false);
    expect(isTopicUnlocked("arrays", [], new Map())).toBe(true);
  });

  it("lists only the missing prerequisites", () => {
    const bestScores = new Map<string, number>([["arrays", TOPIC_UNLOCK_SCORE]]);

    expect(getMissingPrerequisites("stacks", [], bestScores)).toEqual(["linked-lists"]);
    expect(getMissingPrerequisites("linked-lists", [], bestScores)).toEqual([]);
  });
});
