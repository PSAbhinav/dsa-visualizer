import { db, isFirebaseConfigured } from "@/lib/firebase";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import type { Level } from "@/data/topics";
import { defaultEfficiencyStats, type EfficiencyStats, type TopicMastery } from "@/lib/analytics";
import { getCompletedVideoIds, sanitizeVideoProgressEntry, type VideoProgressEntry } from "@/lib/videoProgress";
import type {
  ActivityLog,
  DailyStreak,
  LearningStats,
  PersistedProgressState,
  PlaygroundSubmission,
  ProblemAttempt,
  QuizAttempt,
  TopicProgressEntry,
  TopicProgressMap,
} from "@/store/useStore";

export interface UserProfile extends PersistedProgressState {
  email: string;
  name: string;
  image: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

type UserProfilePatch = Partial<UserProfile>;

const VALID_LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced", "pro"];
let hasWarnedAboutFirebaseAvailability = false;

const isLevel = (value: unknown): value is Level => VALID_LEVELS.includes(value as Level);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const uniqueStrings = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0))]
    : [];
const sanitizeString = (value: unknown): string => (typeof value === "string" ? value : "");

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

const sanitizeTopicProgressEntry = (value: unknown): TopicProgressEntry => {
  if (!isRecord(value)) {
    return {
      started: false,
      visualizerViewed: false,
      videosWatched: [],
      videoProgress: [],
      algorithmRead: false,
      timeSpent: 0,
    };
  }

  const legacyVideosWatched = uniqueStrings(value.videosWatched);
  const rawVideoProgress = Array.isArray(value.videoProgress) ? value.videoProgress : [];
  const videoProgress = rawVideoProgress
    .filter(
      (entry): entry is Partial<VideoProgressEntry> & Pick<VideoProgressEntry, "videoId"> =>
        isRecord(entry) && isString(entry.videoId)
    )
    .map((entry) => sanitizeVideoProgressEntry(entry));
  const mergedVideoProgress = [...videoProgress];
  const existingVideoIds = new Set(videoProgress.map((entry) => entry.videoId));

  legacyVideosWatched.forEach((videoId) => {
    if (!existingVideoIds.has(videoId)) {
      mergedVideoProgress.push(
        sanitizeVideoProgressEntry({
          videoId,
          watchedPercentage: 100,
          playbackSpeed: 1,
        })
      );
    }
  });

  return {
    started: Boolean(value.started),
    visualizerViewed: Boolean(value.visualizerViewed),
    videosWatched: getCompletedVideoIds({ videosWatched: legacyVideosWatched, videoProgress: mergedVideoProgress }),
    videoProgress: mergedVideoProgress,
    algorithmRead: Boolean(value.algorithmRead),
    quizScore: isNumber(value.quizScore) ? Math.max(0, Math.min(100, Math.round(value.quizScore))) : undefined,
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
    accumulator[slug] = sanitizeTopicProgressEntry(entry);
    return accumulator;
  }, {});
};

const sanitizeDailyStreak = (value: unknown): DailyStreak => {
  if (!isRecord(value)) {
    return {
      currentStreak: 0,
      lastActiveDate: "",
      longestStreak: 0,
    };
  }

  const currentStreak = isNumber(value.currentStreak) ? Math.max(0, Math.round(value.currentStreak)) : 0;
  const longestStreak = isNumber(value.longestStreak) ? Math.max(currentStreak, Math.round(value.longestStreak)) : currentStreak;

  return {
    currentStreak,
    lastActiveDate: isString(value.lastActiveDate) ? value.lastActiveDate : "",
    longestStreak,
  };
};

const sanitizeLearningStats = (value: unknown): LearningStats => {
  if (!isRecord(value)) {
    return {
      totalTimeSpent: 0,
      topicsStarted: 0,
      topicsCompleted: 0,
      quizzesTaken: 0,
    };
  }

  return {
    totalTimeSpent: isNumber(value.totalTimeSpent) ? Math.max(0, Math.round(value.totalTimeSpent)) : 0,
    topicsStarted: isNumber(value.topicsStarted) ? Math.max(0, Math.round(value.topicsStarted)) : 0,
    topicsCompleted: isNumber(value.topicsCompleted) ? Math.max(0, Math.round(value.topicsCompleted)) : 0,
    quizzesTaken: isNumber(value.quizzesTaken) ? Math.max(0, Math.round(value.quizzesTaken)) : 0,
  };
};

const sanitizeActivityLog = (value: unknown): ActivityLog => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<ActivityLog>((accumulator, [dateKey, entry]) => {
    if (!isRecord(entry)) {
      return accumulator;
    }

    accumulator[dateKey] = {
      date: isString(entry.date) ? entry.date : dateKey,
      timeSpent: isNumber(entry.timeSpent) ? Math.max(0, Math.round(entry.timeSpent)) : 0,
      topicsLearned: uniqueStrings(entry.topicsLearned),
      activityCount: isNumber(entry.activityCount) ? Math.max(0, Math.round(entry.activityCount)) : 0,
    };
    return accumulator;
  }, {});
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

const sanitizeConceptMasteryEntries = (value: unknown): Array<[string, TopicMastery]> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2 || !isString(entry[0]) || !isTopicMastery(entry[1])) {
        return null;
      }

      return [entry[0], entry[1]] as [string, TopicMastery];
    })
    .filter((entry): entry is [string, TopicMastery] => Boolean(entry));
};

const sanitizeEfficiencyStats = (value: unknown): EfficiencyStats => {
  if (!isRecord(value)) {
    return defaultEfficiencyStats;
  }

  return {
    averageQuizTime: isNumber(value.averageQuizTime) ? Math.max(0, Math.round(value.averageQuizTime)) : 0,
    averageQuizScore: isNumber(value.averageQuizScore) ? Math.max(0, Math.min(100, Math.round(value.averageQuizScore))) : 0,
    conceptsImplemented: isNumber(value.conceptsImplemented) ? Math.max(0, Math.round(value.conceptsImplemented)) : 0,
    totalCodeExecutions: isNumber(value.totalCodeExecutions) ? Math.max(0, Math.round(value.totalCodeExecutions)) : 0,
  };
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

const sanitizeQuizHistory = (value: unknown): QuizAttempt[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isQuizAttempt).map((attempt) => ({
    ...attempt,
    questionIdsShown: uniqueStrings((attempt as unknown as Record<string, unknown>).questionIdsShown),
  }));
};

const sanitizeBestScoreEntries = (value: unknown): Array<[string, number]> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2 || !isString(entry[0]) || !isNumber(entry[1])) {
        return null;
      }

      return [entry[0], Math.max(0, Math.min(100, Math.round(entry[1])))] as [string, number];
    })
    .filter((entry): entry is [string, number] => Boolean(entry));
};

const sanitizeUserProfile = (data: DocumentData | undefined): UserProfile => {
  const playgroundHistory = Array.isArray(data?.playgroundHistory)
    ? data.playgroundHistory.filter(isPlaygroundSubmission)
    : Array.isArray(data?.playgroundSubmissions)
      ? data.playgroundSubmissions.filter(isPlaygroundSubmission)
      : [];

  return {
    email: sanitizeString(data?.email),
    name: sanitizeString(data?.name),
    image: sanitizeString(data?.image),
    selectedLevel: isLevel(data?.selectedLevel) ? data.selectedLevel : null,
    completedTopics: uniqueStrings(data?.completedTopics),
    problemHistory: Array.isArray(data?.problemHistory) ? data.problemHistory.filter(isProblemAttempt) : [],
    topicProgress: sanitizeTopicProgressMap(data?.topicProgress),
    playgroundSubmissions: playgroundHistory,
    playgroundHistory,
    playgroundSuccessCount: isNumber(data?.playgroundSuccessCount)
      ? Math.max(0, Math.round(data.playgroundSuccessCount))
      : playgroundHistory.filter((submission) => submission.passed).length,
    playgroundFailureCount: isNumber(data?.playgroundFailureCount)
      ? Math.max(0, Math.round(data.playgroundFailureCount))
      : playgroundHistory.filter((submission) => !submission.passed).length,
    quizHistory: sanitizeQuizHistory(data?.quizHistory),
    bestScoreEntries: sanitizeBestScoreEntries(data?.bestScoreEntries),
    dailyStreak: sanitizeDailyStreak(data?.dailyStreak),
    learningStats: sanitizeLearningStats(data?.learningStats),
    activityLog: sanitizeActivityLog(data?.activityLog),
    conceptMasteryEntries: sanitizeConceptMasteryEntries(data?.conceptMasteryEntries),
    efficiencyStats: sanitizeEfficiencyStats(data?.efficiencyStats),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
};

const sanitizeUserProfilePatch = (data: UserProfilePatch): UserProfilePatch => {
  const patch: UserProfilePatch = {};

  if ("email" in data) patch.email = sanitizeString(data.email);
  if ("name" in data) patch.name = sanitizeString(data.name);
  if ("image" in data) patch.image = sanitizeString(data.image);
  if ("selectedLevel" in data) patch.selectedLevel = isLevel(data.selectedLevel) ? data.selectedLevel : null;
  if ("completedTopics" in data) patch.completedTopics = uniqueStrings(data.completedTopics);
  if ("problemHistory" in data) {
    patch.problemHistory = Array.isArray(data.problemHistory) ? data.problemHistory.filter(isProblemAttempt) : [];
  }
  if ("topicProgress" in data) patch.topicProgress = sanitizeTopicProgressMap(data.topicProgress);
  if ("playgroundSubmissions" in data || "playgroundHistory" in data) {
    const playgroundHistory = Array.isArray(data.playgroundHistory)
      ? data.playgroundHistory.filter(isPlaygroundSubmission)
      : Array.isArray(data.playgroundSubmissions)
        ? data.playgroundSubmissions.filter(isPlaygroundSubmission)
        : [];

    patch.playgroundSubmissions = playgroundHistory;
    patch.playgroundHistory = playgroundHistory;
  }
  if ("playgroundSuccessCount" in data) {
    patch.playgroundSuccessCount = isNumber(data.playgroundSuccessCount)
      ? Math.max(0, Math.round(data.playgroundSuccessCount))
      : 0;
  }
  if ("playgroundFailureCount" in data) {
    patch.playgroundFailureCount = isNumber(data.playgroundFailureCount)
      ? Math.max(0, Math.round(data.playgroundFailureCount))
      : 0;
  }
  if ("quizHistory" in data) {
    patch.quizHistory = sanitizeQuizHistory(data.quizHistory);
  }
  if ("bestScoreEntries" in data) {
    patch.bestScoreEntries = sanitizeBestScoreEntries(data.bestScoreEntries);
  }
  if ("dailyStreak" in data) patch.dailyStreak = sanitizeDailyStreak(data.dailyStreak);
  if ("learningStats" in data) patch.learningStats = sanitizeLearningStats(data.learningStats);
  if ("activityLog" in data) patch.activityLog = sanitizeActivityLog(data.activityLog);
  if ("conceptMasteryEntries" in data) {
    patch.conceptMasteryEntries = sanitizeConceptMasteryEntries(data.conceptMasteryEntries);
  }
  if ("efficiencyStats" in data) patch.efficiencyStats = sanitizeEfficiencyStats(data.efficiencyStats);

  return patch;
};

const isFirestoreAvailable = (): boolean => {
  if (db && isFirebaseConfigured) {
    return true;
  }

  if (!hasWarnedAboutFirebaseAvailability) {
    console.warn("[firestore] Firebase is unavailable. Cloud sync is disabled.");
    hasWarnedAboutFirebaseAvailability = true;
  }

  return false;
};

const logFirestoreError = (operation: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : "Unknown Firestore error";
  console.error(`[firestore] ${operation} failed: ${message}`);
};

const getUserDocument = (userId: string) => doc(db!, "users", userId);

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId || !isFirestoreAvailable()) {
    return null;
  }

  try {
    const snapshot = await getDoc(getUserDocument(userId));
    return snapshot.exists() ? sanitizeUserProfile(snapshot.data()) : null;
  } catch (error) {
    logFirestoreError("load user profile", error);
    return null;
  }
}

export async function saveUserProfile(userId: string, data: UserProfilePatch): Promise<boolean> {
  if (!userId || !isFirestoreAvailable()) {
    return false;
  }

  try {
    await setDoc(
      getUserDocument(userId),
      {
        ...sanitizeUserProfilePatch(data),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    logFirestoreError("save user profile", error);
    return false;
  }
}

export async function appendProblemAttempt(userId: string, attempt: ProblemAttempt): Promise<boolean> {
  if (!userId || !isFirestoreAvailable() || !isProblemAttempt(attempt)) {
    return false;
  }

  try {
    await setDoc(
      getUserDocument(userId),
      {
        problemHistory: arrayUnion(attempt),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    logFirestoreError("append problem attempt", error);
    return false;
  }
}

export async function markTopicCompleteInDB(userId: string, completedTopics: string[]): Promise<boolean> {
  if (!userId || !isFirestoreAvailable()) {
    return false;
  }

  try {
    await setDoc(
      getUserDocument(userId),
      {
        completedTopics: uniqueStrings(completedTopics),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    logFirestoreError("mark topic complete", error);
    return false;
  }
}
