import { topics } from "@/data/topics";
import { topicPrerequisites } from "@/data/topicDependencies";

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
});
