import { buildLearningNotifications, getRecommendedTopics, getWeakAreasToRevisit } from "@/lib/recommendationEngine";

describe("recommendationEngine", () => {
  it("recommends unlocked follow-up topics after prerequisites are complete", () => {
    const recommendations = getRecommendedTopics({
      selectedLevel: "beginner",
      completedTopics: ["arrays", "searching"],
      topicProgress: {
        arrays: {
          started: true,
          visualizerViewed: true,
          videosWatched: ["intro"],
          algorithmRead: true,
          quizScore: 88,
          completedAt: new Date().toISOString(),
          timeSpent: 480,
        },
        searching: {
          started: true,
          visualizerViewed: true,
          videosWatched: [],
          algorithmRead: true,
          quizScore: 82,
          completedAt: new Date().toISOString(),
          timeSpent: 360,
        },
      },
    });

    expect(recommendations.some((recommendation) => recommendation.topic.slug === "sorting-algorithms")).toBe(true);
    expect(recommendations[0]?.unlocked).toBe(true);
  });

  it("surfaces low-scoring completed topics for revisit", () => {
    const weakAreas = getWeakAreasToRevisit({
      selectedLevel: "intermediate",
      completedTopics: ["arrays"],
      topicProgress: {
        arrays: {
          started: true,
          visualizerViewed: true,
          videosWatched: ["overview"],
          algorithmRead: true,
          quizScore: 62,
          completedAt: new Date().toISOString(),
          timeSpent: 420,
        },
      },
    });

    expect(weakAreas[0]?.topic.slug).toBe("arrays");
    expect(weakAreas[0]?.shouldRevisit).toBe(true);
  });

  it("generates encouraging notifications based on progress", () => {
    const notifications = buildLearningNotifications({
      selectedLevel: "intermediate",
      completedTopics: ["arrays"],
      topicProgress: {
        arrays: {
          started: true,
          visualizerViewed: true,
          videosWatched: ["overview"],
          algorithmRead: true,
          quizScore: 91,
          completedAt: new Date().toISOString(),
          timeSpent: 420,
        },
        graphs: {
          started: true,
          visualizerViewed: true,
          videosWatched: ["intro"],
          algorithmRead: true,
          quizScore: 88,
          timeSpent: 390,
        },
      },
    });

    expect(notifications.some((notification) => notification.message.includes("Sorting Algorithms"))).toBe(true);
    expect(notifications.some((notification) => notification.message.includes("Advanced Graph Algorithms"))).toBe(true);
  });
});
