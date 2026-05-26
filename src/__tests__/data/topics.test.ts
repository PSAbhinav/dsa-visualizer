import { getTopicBySlug, getTopicsByLevel, topics } from '@/data/topics';
import type { Level } from '@/data/types';

describe('topics data', () => {
  it.each<readonly [Level, number]>([
    ['beginner', 9],
    ['intermediate', 8],
    ['advanced', 7],
    ['pro', 5],
  ])('getTopicsByLevel returns %i topics for %s', (level, expectedCount) => {
    expect(getTopicsByLevel(level)).toHaveLength(expectedCount);
  });

  it('getTopicBySlug returns the expected topic', () => {
    const topic = getTopicBySlug('arrays');

    expect(topic).toMatchObject({
      slug: 'arrays',
      title: 'Arrays',
      level: 'beginner',
      visualizerType: 'array',
    });
    expect(topic?.algorithms.length).toBeGreaterThan(0);
    expect(topic?.problems.length).toBeGreaterThan(0);
  });

  it('all topics expose the required top-level fields', () => {
    topics.forEach((topic) => {
      expect(topic.title).toBeTruthy();
      expect(topic.slug).toBeTruthy();
      expect(topic.shortDescription).toBeTruthy();
      expect(topic.detailedExplanation).toBeTruthy();
      expect(topic.algorithms.length).toBeGreaterThan(0);
      expect(topic.problems.length).toBeGreaterThan(0);
    });
  });

  it('all algorithms include a name and pseudocode', () => {
    topics.forEach((topic) => {
      topic.algorithms.forEach((algorithm) => {
        expect(algorithm.name).toBeTruthy();
        expect(algorithm.pseudocode.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('all problems include title, difficulty, and a link', () => {
    topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        expect(problem.title).toBeTruthy();
        expect(problem.difficulty).toMatch(/^(Easy|Medium|Hard)$/);
        expect(problem.leetcodeUrl).toMatch(/^https?:\/\//);
      });
    });
  });
});
