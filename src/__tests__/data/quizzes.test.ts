import { getQuizByTopicSlug, quizzes } from "@/data/quizzes";
import { topics } from "@/data/topics";

describe("quizzes data", () => {
  it("creates a quiz for every topic", () => {
    expect(quizzes).toHaveLength(topics.length);
    topics.forEach((topic) => {
      expect(getQuizByTopicSlug(topic.slug)?.topicSlug).toBe(topic.slug);
    });
  });

  it("contains at least 150 validated questions overall", () => {
    const totalQuestions = quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);
    expect(totalQuestions).toBeGreaterThanOrEqual(150);
  });

  it("keeps each quiz question well-formed", () => {
    quizzes.forEach((quiz) => {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(5);
      expect(quiz.questions.length).toBeLessThanOrEqual(10);

      quiz.questions.forEach((question) => {
        expect(question.id).toBeTruthy();
        expect(question.question).toBeTruthy();
        expect(question.options.length).toBeGreaterThanOrEqual(4);
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(question.options.length);
        expect(question.explanation).toBeTruthy();
        expect(["easy", "medium", "hard"]).toContain(question.difficulty);
      });
    });
  });
});
