import { getQuizByTopicSlug, getRandomizedQuiz, quizzes } from "@/data/quizzes";
import { topics } from "@/data/topics";

describe("quizzes data", () => {
  it("creates a quiz for every topic", () => {
    expect(quizzes).toHaveLength(topics.length);
    topics.forEach((topic) => {
      expect(getQuizByTopicSlug(topic.slug)?.topicSlug).toBe(topic.slug);
    });
  });

  it("expands every topic to a larger question pool", () => {
    quizzes.forEach((quiz) => {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(15);
      expect(quiz.questions.length).toBeLessThanOrEqual(20);
    });
  });

  it("contains at least 400 validated questions overall", () => {
    const totalQuestions = quizzes.reduce((count, quiz) => count + quiz.questions.length, 0);
    expect(totalQuestions).toBeGreaterThanOrEqual(400);
  });

  it("keeps each quiz question well-formed", () => {
    quizzes.forEach((quiz) => {
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

  it("builds randomized quizzes that prioritize unseen questions", () => {
    const quiz = quizzes[0];
    const unseenQuestionIds = quiz.questions.slice(0, 8).map((question) => question.id);
    const seenQuestionIds = quiz.questions.slice(8).map((question) => question.id);
    const randomizedQuiz = getRandomizedQuiz(quiz.topicSlug, 8, seenQuestionIds);

    expect(randomizedQuiz).toBeDefined();
    expect(randomizedQuiz?.questions).toHaveLength(8);
    expect(new Set(randomizedQuiz?.questions.map((question) => question.id)).size).toBe(8);
    expect(randomizedQuiz?.questions.map((question) => question.id).sort()).toEqual(unseenQuestionIds.sort());

    randomizedQuiz?.questions.forEach((question) => {
      expect(question.options[question.correctAnswer]).toBeTruthy();
    });
  });
});
