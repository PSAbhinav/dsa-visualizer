import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Level } from "@/data/topics";
import {
  buildConceptMasteryMap,
  buildEfficiencyStats,
  calculateOverallMastery,
  clampScore,
  defaultEfficiencyStats,
  type AnalyticsAttempt,
  type EfficiencyStats,
  type TopicMastery,
} from "@/lib/analytics";

export type ProblemAttempt = AnalyticsAttempt;

export interface TopicProgressEntry {
  started: boolean;
  visualizerViewed: boolean;
  videosWatched: string[];
  algorithmRead: boolean;
  quizScore?: number;
  completedAt?: string;
  timeSpent: number;
  lastAccessedAt?: string;
}

export interface PlaygroundSubmission {
  topicSlug: string;
  code: string;
  language: string;
  output: string;
  passed: boolean;
  timestamp: string;
  executionTime?: string;
  memory?: number;
  status?: string;
  error?: string;
}

export interface QuizAttempt {
  topicSlug: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  attemptedAt: string;
}

export interface DailyStreak {
  currentStreak: number;
  lastActiveDate: string;
  longestStreak: number;
}

export interface DailyActivityEntry {
  date: string;
  timeSpent: number;
  topicsLearned: string[];
  activityCount: number;
}

export interface LearningStats {
  totalTimeSpent: number;
  topicsStarted: number;
  topicsCompleted: number;
  quizzesTaken: number;
}

export type TopicProgressMap = Record<string, TopicProgressEntry>;
export type ActivityLog = Record<string, DailyActivityEntry>;

export interface ProgressState {
  selectedLevel: Level | null;
  completedTopics: string[];
  problemHistory: ProblemAttempt[];
  topicProgress: TopicProgressMap;
  playgroundSubmissions: PlaygroundSubmission[];
  playgroundHistory: PlaygroundSubmission[];
  playgroundSuccessCount: number;
  playgroundFailureCount: number;
  quizHistory: QuizAttempt[];
  bestScores: Map<string, number>;
  dailyStreak: DailyStreak;
  learningStats: LearningStats;
  activityLog: ActivityLog;
  conceptMastery: Map<string, TopicMastery>;
  efficiencyStats: EfficiencyStats;
}

export interface PersistedProgressState {
  selectedLevel: Level | null;
  completedTopics: string[];
  problemHistory: ProblemAttempt[];
  topicProgress: TopicProgressMap;
  playgroundSubmissions: PlaygroundSubmission[];
  playgroundHistory: PlaygroundSubmission[];
  playgroundSuccessCount: number;
  playgroundFailureCount: number;
  quizHistory: QuizAttempt[];
  dailyStreak: DailyStreak;
  learningStats: LearningStats;
  activityLog: ActivityLog;
  conceptMasteryEntries: Array<[string, TopicMastery]>;
  bestScoreEntries: Array<[string, number]>;
  efficiencyStats: EfficiencyStats;
}

export interface AppState extends ProgressState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  setLevel: (level: Level) => void;
  markTopicStarted: (slug: string) => void;
  markVisualizerViewed: (slug: string) => void;
  markVideoWatched: (slug: string, videoId: string) => void;
  markAlgorithmRead: (slug: string) => void;
  setQuizScore: (slug: string, score: number) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  markTopicComplete: (slug: string) => void;
  addTopicTime: (slug: string, seconds: number) => void;
  recordDailyActivity: (topicSlug?: string, seconds?: number, timestamp?: string) => void;
  addPlaygroundSubmission: (submission: PlaygroundSubmission) => void;
  addProblemAttempt: (attempt: ProblemAttempt) => void;
  loadFromCloud: (data: Partial<PersistedProgressState>) => void;
  resetProgress: () => void;
}

export type PersistedAppState = PersistedProgressState;

const VALID_LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced", "pro"];
const QUIZ_MIN = 0;
const QUIZ_MAX = 100;

const createDefaultTopicProgressEntry = (): TopicProgressEntry => ({
  started: false,
  visualizerViewed: false,
  videosWatched: [],
  algorithmRead: false,
  timeSpent: 0,
});

const createDefaultDailyStreak = (): DailyStreak => ({
  currentStreak: 0,
  lastActiveDate: "",
  longestStreak: 0,
});

const createDefaultLearningStats = (): LearningStats => ({
  totalTimeSpent: 0,
  topicsStarted: 0,
  topicsCompleted: 0,
  quizzesTaken: 0,
});

const createDefaultProgressState = (): ProgressState => ({
  selectedLevel: null,
  completedTopics: [],
  problemHistory: [],
  topicProgress: {},
  playgroundSubmissions: [],
  playgroundHistory: [],
  playgroundSuccessCount: 0,
  playgroundFailureCount: 0,
  quizHistory: [],
  bestScores: new Map<string, number>(),
  dailyStreak: createDefaultDailyStreak(),
  learningStats: createDefaultLearningStats(),
  activityLog: {},
  conceptMastery: new Map<string, TopicMastery>(),
  efficiencyStats: defaultEfficiencyStats,
});

const isLevel = (value: unknown): value is Level => VALID_LEVELS.includes(value as Level);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const uniqueStrings = (values: unknown): string[] =>
  Array.isArray(values)
    ? [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))]
    : [];

const toDateKey = (value: string | Date = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getYesterdayKey = (dateKey: string): string => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
};

const isTopicMastery = (value: unknown): value is TopicMastery => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNumber(value.visualScore) &&
    isNumber(value.quizScore) &&
    isNumber(value.practiceScore) &&
    isNumber(value.overallMastery)
  );
};

const isProblemAttempt = (value: unknown): value is ProblemAttempt => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.problemId) &&
    isString(value.topicSlug) &&
    isString(value.userTimeComplexity) &&
    isString(value.userSpaceComplexity) &&
    typeof value.isCorrect === "boolean" &&
    isString(value.attemptedAt) &&
    (value.quizScore === undefined || isNumber(value.quizScore)) &&
    (value.quizTimeSeconds === undefined || isNumber(value.quizTimeSeconds)) &&
    (value.practiceScore === undefined || isNumber(value.practiceScore)) &&
    (value.codeExecutions === undefined || isNumber(value.codeExecutions)) &&
    (value.visualTimeSpentSeconds === undefined || isNumber(value.visualTimeSpentSeconds))
  );
};

const isQuizAttempt = (value: unknown): value is QuizAttempt => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.topicSlug) &&
    isNumber(value.score) &&
    isNumber(value.totalQuestions) &&
    isNumber(value.timeTaken) &&
    isString(value.attemptedAt)
  );
};

const sanitizeTopicProgressEntry = (value: unknown): TopicProgressEntry => {
  if (!isRecord(value)) {
    return createDefaultTopicProgressEntry();
  }

  return {
    started: Boolean(value.started),
    visualizerViewed: Boolean(value.visualizerViewed),
    videosWatched: uniqueStrings(value.videosWatched),
    algorithmRead: Boolean(value.algorithmRead),
    quizScore: isNumber(value.quizScore) ? clamp(Math.round(value.quizScore), QUIZ_MIN, QUIZ_MAX) : undefined,
    completedAt: isString(value.completedAt) ? value.completedAt : undefined,
    timeSpent: isNumber(value.timeSpent) ? Math.max(0, Math.round(value.timeSpent)) : 0,
    lastAccessedAt: isString(value.lastAccessedAt) ? value.lastAccessedAt : undefined,
  };
};

const sanitizeTopicProgressMap = (value: unknown): TopicProgressMap => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<TopicProgressMap>((accumulator, [slug, entry]) => {
    if (!slug) {
      return accumulator;
    }

    accumulator[slug] = sanitizeTopicProgressEntry(entry);
    return accumulator;
  }, {});
};

const sanitizeQuizHistory = (value: unknown): QuizAttempt[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isQuizAttempt)
    .map((attempt) => ({
      ...attempt,
      score: clamp(Math.round(attempt.score), QUIZ_MIN, QUIZ_MAX),
      totalQuestions: Math.max(1, Math.round(attempt.totalQuestions)),
      timeTaken: Math.max(0, Math.round(attempt.timeTaken)),
    }));
};

const sanitizeBestScoreEntries = (value: unknown): Map<string, number> => {
  if (!Array.isArray(value)) {
    return new Map<string, number>();
  }

  return new Map<string, number>(
    value
      .map((entry) => {
        if (!Array.isArray(entry) || entry.length !== 2 || !isString(entry[0]) || !isNumber(entry[1])) {
          return null;
        }

        return [entry[0], clamp(Math.round(entry[1]), QUIZ_MIN, QUIZ_MAX)] as [string, number];
      })
      .filter((entry): entry is [string, number] => Boolean(entry))
  );
};

const isPlaygroundSubmission = (value: unknown): value is PlaygroundSubmission => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.topicSlug) &&
    isString(value.code) &&
    isString(value.language) &&
    isString(value.output) &&
    typeof value.passed === "boolean" &&
    (value.timestamp === undefined || isString(value.timestamp)) &&
    (value.executionTime === undefined || isString(value.executionTime)) &&
    (value.memory === undefined || isNumber(value.memory)) &&
    (value.status === undefined || isString(value.status)) &&
    (value.error === undefined || isString(value.error))
  );
};

const sanitizeDailyStreak = (value: unknown): DailyStreak => {
  if (!isRecord(value)) {
    return createDefaultDailyStreak();
  }

  const currentStreak = isNumber(value.currentStreak) ? Math.max(0, Math.round(value.currentStreak)) : 0;
  const longestStreak = isNumber(value.longestStreak) ? Math.max(currentStreak, Math.round(value.longestStreak)) : currentStreak;

  return {
    currentStreak,
    lastActiveDate: isString(value.lastActiveDate) ? value.lastActiveDate : "",
    longestStreak,
  };
};

const sanitizeDailyActivityEntry = (dateKey: string, value: unknown): DailyActivityEntry | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    date: isString(value.date) ? value.date : dateKey,
    timeSpent: isNumber(value.timeSpent) ? Math.max(0, Math.round(value.timeSpent)) : 0,
    topicsLearned: uniqueStrings(value.topicsLearned),
    activityCount: isNumber(value.activityCount) ? Math.max(0, Math.round(value.activityCount)) : 0,
  };
};

const sanitizeActivityLog = (value: unknown): ActivityLog => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<ActivityLog>((accumulator, [dateKey, entry]) => {
    const sanitizedEntry = sanitizeDailyActivityEntry(dateKey, entry);

    if (sanitizedEntry) {
      accumulator[dateKey] = sanitizedEntry;
    }

    return accumulator;
  }, {});
};

const sanitizeConceptMasteryEntries = (value: unknown): Map<string, TopicMastery> => {
  if (!Array.isArray(value)) {
    return new Map<string, TopicMastery>();
  }

  return new Map<string, TopicMastery>(
    value
      .map((entry) => {
        if (!Array.isArray(entry) || entry.length !== 2 || !isString(entry[0]) || !isTopicMastery(entry[1])) {
          return null;
        }

        return [entry[0], entry[1]] as [string, TopicMastery];
      })
      .filter((entry): entry is [string, TopicMastery] => Boolean(entry))
  );
};

const sanitizeEfficiencyStats = (value: unknown): EfficiencyStats => {
  if (!isRecord(value)) {
    return defaultEfficiencyStats;
  }

  return {
    averageQuizTime: isNumber(value.averageQuizTime) ? Math.max(0, Math.round(value.averageQuizTime)) : 0,
    averageQuizScore: isNumber(value.averageQuizScore) ? clampScore(value.averageQuizScore) : 0,
    conceptsImplemented: isNumber(value.conceptsImplemented) ? Math.max(0, Math.round(value.conceptsImplemented)) : 0,
    totalCodeExecutions: isNumber(value.totalCodeExecutions) ? Math.max(0, Math.round(value.totalCodeExecutions)) : 0,
  };
};

const buildConceptMasteryFromState = (
  state: Pick<ProgressState, "completedTopics" | "problemHistory" | "topicProgress" | "playgroundSubmissions">,
  seedMastery = new Map<string, TopicMastery>()
): Map<string, TopicMastery> => {
  const base = buildConceptMasteryMap({
    completedTopics: state.completedTopics,
    problemHistory: state.problemHistory,
    seedMastery,
  });
  const completedSet = new Set(state.completedTopics);

  Object.entries(state.topicProgress).forEach(([slug, progress]) => {
    const existing = base.get(slug) ?? {
      visualScore: 0,
      quizScore: 0,
      practiceScore: 0,
      overallMastery: 0,
    };
    const topicSubmissions = state.playgroundSubmissions.filter((submission) => submission.topicSlug === slug);
    const topicAttempts = state.problemHistory.filter((attempt) => attempt.topicSlug === slug);
    const passedSubmissions = topicSubmissions.filter((submission) => submission.passed).length;
    const correctAttempts = topicAttempts.filter((attempt) => attempt.isCorrect).length;
    const visualSignals = clampScore(
      (progress.timeSpent / (12 * 60)) * 100 +
        (progress.visualizerViewed ? 10 : 0) +
        progress.videosWatched.length * 4 +
        (progress.algorithmRead ? 6 : 0)
    );
    const quizScore =
      typeof progress.quizScore === "number"
        ? clampScore(existing.quizScore * 0.25 + progress.quizScore * 0.75)
        : existing.quizScore;
    const practiceFromSubmissions =
      topicSubmissions.length > 0
        ? clampScore((passedSubmissions / topicSubmissions.length) * 75 + Math.min(25, topicSubmissions.length * 5))
        : 0;
    const practiceFromAttempts =
      topicAttempts.length > 0
        ? clampScore((correctAttempts / topicAttempts.length) * 75 + Math.min(25, topicAttempts.length * 4))
        : 0;
    const practiceScore = clampScore(
      Math.max(existing.practiceScore, practiceFromSubmissions * 0.6 + practiceFromAttempts * 0.4 + (completedSet.has(slug) ? 8 : 0))
    );
    const visualScore = clampScore(Math.max(existing.visualScore, visualSignals, completedSet.has(slug) ? 78 : 0));

    base.set(slug, {
      visualScore,
      quizScore,
      practiceScore,
      overallMastery: calculateOverallMastery(visualScore, quizScore, practiceScore),
    });
  });

  return base;
};

const buildEfficiencyStatsFromState = (
  state: Pick<ProgressState, "completedTopics" | "problemHistory" | "topicProgress" | "playgroundSubmissions" | "quizHistory">,
  conceptMastery: Map<string, TopicMastery>,
  seededStats = defaultEfficiencyStats
): EfficiencyStats => {
  const derived = buildEfficiencyStats({
    completedTopics: state.completedTopics,
    problemHistory: state.problemHistory,
    conceptMastery,
  });
  const quizScores =
    state.quizHistory.length > 0
      ? state.quizHistory.map((attempt) => attempt.score)
      : Object.values(state.topicProgress)
          .map((progress) => progress.quizScore)
          .filter((score): score is number => typeof score === "number");
  const explicitQuizTimes =
    state.quizHistory.length > 0
      ? state.quizHistory.map((attempt) => attempt.timeTaken)
      : state.problemHistory.map((attempt) => attempt.quizTimeSeconds).filter((time): time is number => typeof time === "number");
  const estimatedQuizTimes =
    explicitQuizTimes.length > 0
      ? explicitQuizTimes
      : quizScores.map((score, index) => Math.max(180, Math.round(480 - score * 2 + index * 15)));
  const completedSet = new Set(state.completedTopics);
  const implementationCount = Object.entries(state.topicProgress).filter(
    ([slug, progress]) => Boolean(progress.completedAt) || completedSet.has(slug) || progress.started
  ).length;

  return {
    averageQuizTime:
      estimatedQuizTimes.length > 0
        ? Math.round(estimatedQuizTimes.reduce((sum, value) => sum + value, 0) / estimatedQuizTimes.length)
        : Math.max(derived.averageQuizTime, seededStats.averageQuizTime),
    averageQuizScore:
      quizScores.length > 0
        ? clampScore((derived.averageQuizScore + quizScores.reduce((sum, value) => sum + value, 0) / quizScores.length) / 2)
        : Math.max(derived.averageQuizScore, seededStats.averageQuizScore),
    conceptsImplemented: Math.max(derived.conceptsImplemented, implementationCount, seededStats.conceptsImplemented),
    totalCodeExecutions: Math.max(
      derived.totalCodeExecutions,
      state.playgroundSubmissions.length + state.problemHistory.length,
      seededStats.totalCodeExecutions
    ),
  };
};

const recalculateProgressState = (
  state: Omit<ProgressState, "conceptMastery" | "efficiencyStats"> & {
    conceptMastery?: Map<string, TopicMastery>;
    efficiencyStats?: EfficiencyStats;
  }
): ProgressState => {
  const completedFromProgress = Object.entries(state.topicProgress)
    .filter(([, progress]) => Boolean(progress.completedAt))
    .map(([slug]) => slug);
  const completedTopics = [...new Set([...state.completedTopics, ...completedFromProgress])];
  const topicEntries = Object.values(state.topicProgress);
  const totalTimeSpent = topicEntries.reduce((total, progress) => total + progress.timeSpent, 0);
  const playgroundHistory = state.playgroundHistory.length > 0 ? state.playgroundHistory : state.playgroundSubmissions;
  const playgroundSuccessCount = playgroundHistory.filter((submission) => submission.passed).length;
  const playgroundFailureCount = playgroundHistory.length - playgroundSuccessCount;
  const normalizedState = {
    ...state,
    completedTopics,
    playgroundSubmissions: playgroundHistory,
    playgroundHistory,
    playgroundSuccessCount,
    playgroundFailureCount,
  };
  const conceptMastery = buildConceptMasteryFromState(normalizedState, state.conceptMastery);
  const efficiencyStats = buildEfficiencyStatsFromState(normalizedState, conceptMastery, state.efficiencyStats);

  return {
    ...normalizedState,
    conceptMastery,
    efficiencyStats,
    learningStats: {
      totalTimeSpent,
      topicsStarted: topicEntries.filter((progress) => progress.started).length,
      topicsCompleted: completedTopics.length,
      quizzesTaken: state.quizHistory.length,
    },
    dailyStreak: {
      ...state.dailyStreak,
      longestStreak: Math.max(state.dailyStreak.currentStreak, state.dailyStreak.longestStreak),
    },
  };
};

const sanitizeProgressState = (data: Partial<PersistedProgressState> | undefined): ProgressState => {
  const topicProgress = sanitizeTopicProgressMap(data?.topicProgress);
  const playgroundHistory = Array.isArray(data?.playgroundHistory)
    ? data.playgroundHistory.filter(isPlaygroundSubmission)
    : Array.isArray(data?.playgroundSubmissions)
      ? data.playgroundSubmissions.filter(isPlaygroundSubmission)
      : [];
  const baseState = {
    selectedLevel: isLevel(data?.selectedLevel) ? data.selectedLevel : null,
    completedTopics: uniqueStrings(data?.completedTopics),
    problemHistory: Array.isArray(data?.problemHistory) ? data.problemHistory.filter(isProblemAttempt) : [],
    topicProgress,
    playgroundSubmissions: playgroundHistory,
    playgroundHistory,
    playgroundSuccessCount: isNumber(data?.playgroundSuccessCount) ? Math.max(0, Math.round(data.playgroundSuccessCount)) : 0,
    playgroundFailureCount: isNumber(data?.playgroundFailureCount) ? Math.max(0, Math.round(data.playgroundFailureCount)) : 0,
    quizHistory: sanitizeQuizHistory(data?.quizHistory),
    bestScores: sanitizeBestScoreEntries(data?.bestScoreEntries),
    dailyStreak: sanitizeDailyStreak(data?.dailyStreak),
    learningStats: createDefaultLearningStats(),
    activityLog: sanitizeActivityLog(data?.activityLog),
    conceptMastery: sanitizeConceptMasteryEntries(data?.conceptMasteryEntries),
    efficiencyStats: sanitizeEfficiencyStats(data?.efficiencyStats),
  };

  return recalculateProgressState(baseState);
};

const updateDailyStreak = (dailyStreak: DailyStreak, dateKey: string): DailyStreak => {
  if (!dateKey) {
    return dailyStreak;
  }

  if (dailyStreak.lastActiveDate === dateKey) {
    return {
      ...dailyStreak,
      longestStreak: Math.max(dailyStreak.currentStreak, dailyStreak.longestStreak),
    };
  }

  const isConsecutiveDay = dailyStreak.lastActiveDate === getYesterdayKey(dateKey);
  const currentStreak = isConsecutiveDay ? Math.max(1, dailyStreak.currentStreak + 1) : 1;

  return {
    currentStreak,
    lastActiveDate: dateKey,
    longestStreak: Math.max(currentStreak, dailyStreak.longestStreak),
  };
};

const applyActivity = (
  state: ProgressState,
  topicSlug?: string,
  seconds = 0,
  timestamp = new Date().toISOString(),
  countIncrement = seconds > 0 ? 1 : 0
): ProgressState => {
  const dateKey = toDateKey(timestamp);
  const existingActivity = state.activityLog[dateKey] ?? {
    date: dateKey,
    timeSpent: 0,
    topicsLearned: [],
    activityCount: 0,
  };

  return {
    ...state,
    dailyStreak: updateDailyStreak(state.dailyStreak, dateKey),
    activityLog: {
      ...state.activityLog,
      [dateKey]: {
        date: dateKey,
        timeSpent: existingActivity.timeSpent + Math.max(0, Math.round(seconds)),
        topicsLearned: topicSlug ? [...new Set([...existingActivity.topicsLearned, topicSlug])] : existingActivity.topicsLearned,
        activityCount: existingActivity.activityCount + Math.max(0, Math.round(countIncrement)),
      },
    },
  };
};

const updateTopicProgress = (
  state: ProgressState,
  slug: string,
  updater: (progress: TopicProgressEntry, timestamp: string) => TopicProgressEntry,
  options?: {
    seconds?: number;
    timestamp?: string;
    countIncrement?: number;
  }
): ProgressState => {
  if (!slug) {
    return state;
  }

  const timestamp = options?.timestamp ?? new Date().toISOString();
  const currentProgress = state.topicProgress[slug] ?? createDefaultTopicProgressEntry();
  const nextProgress = updater(currentProgress, timestamp);
  const withTopicProgress: ProgressState = {
    ...state,
    topicProgress: {
      ...state.topicProgress,
      [slug]: {
        ...nextProgress,
        started: true,
        lastAccessedAt: timestamp,
      },
    },
  };

  return recalculateProgressState(
    applyActivity(withTopicProgress, slug, options?.seconds ?? 0, timestamp, options?.countIncrement ?? 1)
  );
};

export const getProgressSnapshot = (state: Pick<AppState, keyof ProgressState>): PersistedProgressState => ({
  selectedLevel: state.selectedLevel,
  completedTopics: [...state.completedTopics],
  problemHistory: [...state.problemHistory],
  topicProgress: Object.fromEntries(
    Object.entries(state.topicProgress).map(([slug, progress]) => [
      slug,
      {
        ...progress,
        videosWatched: [...progress.videosWatched],
      },
    ])
  ),
  playgroundSubmissions: state.playgroundSubmissions.map((submission) => ({ ...submission })),
  playgroundHistory: state.playgroundHistory.map((submission) => ({ ...submission })),
  playgroundSuccessCount: state.playgroundSuccessCount,
  playgroundFailureCount: state.playgroundFailureCount,
  quizHistory: state.quizHistory.map((attempt) => ({ ...attempt })),
  dailyStreak: { ...state.dailyStreak },
  learningStats: { ...state.learningStats },
  activityLog: Object.fromEntries(
    Object.entries(state.activityLog).map(([dateKey, activity]) => [
      dateKey,
      {
        ...activity,
        topicsLearned: [...activity.topicsLearned],
      },
    ])
  ),
  conceptMasteryEntries: [...state.conceptMastery.entries()],
  bestScoreEntries: [...state.bestScores.entries()],
  efficiencyStats: { ...state.efficiencyStats },
});

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...createDefaultProgressState(),
      userId: null,
      setUserId: (id) => set({ userId: id }),
      setLevel: (level) => set({ selectedLevel: level }),
      markTopicStarted: (slug) =>
        set((state) =>
          updateTopicProgress(
            state,
            slug,
            (progress, timestamp) => ({
              ...progress,
              started: true,
              lastAccessedAt: timestamp,
            }),
            { countIncrement: 1 }
          )
        ),
      markVisualizerViewed: (slug) =>
        set((state) =>
          updateTopicProgress(
            state,
            slug,
            (progress) => ({
              ...progress,
              visualizerViewed: true,
            }),
            { countIncrement: 1 }
          )
        ),
      markVideoWatched: (slug, videoId) =>
        set((state) =>
          updateTopicProgress(
            state,
            slug,
            (progress) => ({
              ...progress,
              videosWatched: videoId ? [...new Set([...progress.videosWatched, videoId])] : progress.videosWatched,
            }),
            { countIncrement: 1 }
          )
        ),
      markAlgorithmRead: (slug) =>
        set((state) =>
          updateTopicProgress(
            state,
            slug,
            (progress) => ({
              ...progress,
              algorithmRead: true,
            }),
            { countIncrement: 1 }
          )
        ),
      setQuizScore: (slug, score) =>
        set((state) => {
          const safeScore = clamp(Math.round(score), QUIZ_MIN, QUIZ_MAX);
          const bestScores = new Map(state.bestScores);

          if (slug) {
            bestScores.set(slug, Math.max(bestScores.get(slug) ?? 0, safeScore));
          }

          return updateTopicProgress(
            {
              ...state,
              bestScores,
            },
            slug,
            (progress) => ({
              ...progress,
              quizScore: safeScore,
            }),
            { countIncrement: 1 }
          );
        }),
      recordQuizAttempt: (attempt) =>
        set((state) => {
          if (!isQuizAttempt(attempt)) {
            return state;
          }

          const timestamp = attempt.attemptedAt || new Date().toISOString();
          const topicSlug = attempt.topicSlug;
          const score = clamp(Math.round(attempt.score), QUIZ_MIN, QUIZ_MAX);
          const totalQuestions = Math.max(1, Math.round(attempt.totalQuestions));
          const timeTaken = Math.max(0, Math.round(attempt.timeTaken));
          const bestScores = new Map(state.bestScores);

          if (topicSlug) {
            bestScores.set(topicSlug, Math.max(bestScores.get(topicSlug) ?? 0, score));
          }

          return updateTopicProgress(
            {
              ...state,
              bestScores,
              quizHistory: [
                ...state.quizHistory,
                {
                  topicSlug,
                  score,
                  totalQuestions,
                  timeTaken,
                  attemptedAt: timestamp,
                },
              ],
            },
            topicSlug,
            (progress) => ({
              ...progress,
              quizScore: Math.max(progress.quizScore ?? 0, score),
            }),
            { timestamp, countIncrement: 1 }
          );
        }),
      markTopicComplete: (slug) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          return updateTopicProgress(
            {
              ...state,
              completedTopics: slug ? [...new Set([...state.completedTopics, slug])] : state.completedTopics,
            },
            slug,
            (progress) => ({
              ...progress,
              completedAt: progress.completedAt ?? timestamp,
            }),
            { timestamp, countIncrement: 1 }
          );
        }),
      addTopicTime: (slug, seconds) =>
        set((state) => {
          const safeSeconds = Math.max(0, Math.round(seconds));
          if (!slug || safeSeconds === 0) {
            return state;
          }

          const timestamp = new Date().toISOString();
          return updateTopicProgress(
            state,
            slug,
            (progress) => ({
              ...progress,
              timeSpent: progress.timeSpent + safeSeconds,
            }),
            { seconds: safeSeconds, timestamp, countIncrement: 0 }
          );
        }),
      recordDailyActivity: (topicSlug, seconds = 0, timestamp) =>
        set((state) =>
          recalculateProgressState(
            applyActivity(state, topicSlug, Math.max(0, Math.round(seconds)), timestamp, seconds > 0 || topicSlug ? 1 : 0)
          )
        ),
      addPlaygroundSubmission: (submission) =>
        set((state) => {
          if (!isPlaygroundSubmission(submission)) {
            return state;
          }

          const timestamp = submission.timestamp || new Date().toISOString();
          const nextSubmission: PlaygroundSubmission = {
            ...submission,
            timestamp,
          };
          const nextState: ProgressState = {
            ...state,
            playgroundSubmissions: [...state.playgroundSubmissions, nextSubmission],
            playgroundHistory: [...state.playgroundHistory, nextSubmission],
            playgroundSuccessCount: state.playgroundSuccessCount + (nextSubmission.passed ? 1 : 0),
            playgroundFailureCount: state.playgroundFailureCount + (nextSubmission.passed ? 0 : 1),
          };

          return recalculateProgressState(applyActivity(nextState, submission.topicSlug, 0, timestamp, 1));
        }),
      addProblemAttempt: (attempt) =>
        set((state) => {
          if (!isProblemAttempt(attempt)) {
            return state;
          }

          const timestamp = attempt.attemptedAt || new Date().toISOString();
          const nextState: ProgressState = {
            ...state,
            problemHistory: [...state.problemHistory, { ...attempt, attemptedAt: timestamp }],
          };

          return recalculateProgressState(applyActivity(nextState, attempt.topicSlug, 0, timestamp, 1));
        }),
      loadFromCloud: (data) => set((state) => ({ ...sanitizeProgressState(data), userId: state.userId })),
      resetProgress: () =>
        set((state) => ({
          ...createDefaultProgressState(),
          userId: state.userId,
        })),
    }),
    {
      name: "dsa-visualizer-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => getProgressSnapshot(state),
      version: 4,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizeProgressState((persistedState as Partial<PersistedProgressState>) ?? undefined),
      }),
    }
  )
);
