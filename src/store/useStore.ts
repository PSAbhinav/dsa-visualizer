import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Level } from "@/data/topics";

export interface ProblemAttempt {
  problemId: string;
  topicSlug: string;
  userTimeComplexity: string;
  userSpaceComplexity: string;
  isCorrect: boolean;
  attemptedAt: string;
}

export interface ProgressState {
  selectedLevel: Level | null;
  completedTopics: string[];
  problemHistory: ProblemAttempt[];
}

export interface AppState extends ProgressState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  setLevel: (level: Level) => void;
  markTopicComplete: (slug: string) => void;
  addProblemAttempt: (attempt: ProblemAttempt) => void;
  loadFromCloud: (data: Partial<ProgressState>) => void;
  resetProgress: () => void;
}

export type PersistedAppState = ProgressState;

const VALID_LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced", "pro"];

const createDefaultProgressState = (): ProgressState => ({
  selectedLevel: null,
  completedTopics: [],
  problemHistory: [],
});

const isLevel = (value: unknown): value is Level => VALID_LEVELS.includes(value as Level);

const isProblemAttempt = (value: unknown): value is ProblemAttempt => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const attempt = value as Record<string, unknown>;

  return (
    typeof attempt.problemId === "string" &&
    typeof attempt.topicSlug === "string" &&
    typeof attempt.userTimeComplexity === "string" &&
    typeof attempt.userSpaceComplexity === "string" &&
    typeof attempt.isCorrect === "boolean" &&
    typeof attempt.attemptedAt === "string"
  );
};

const sanitizeProgressState = (data: Partial<ProgressState> | undefined): ProgressState => ({
  selectedLevel: isLevel(data?.selectedLevel) ? data.selectedLevel : null,
  completedTopics: Array.isArray(data?.completedTopics)
    ? [...new Set(data.completedTopics.filter((topic): topic is string => typeof topic === "string"))]
    : [],
  problemHistory: Array.isArray(data?.problemHistory)
    ? data.problemHistory.filter(isProblemAttempt)
    : [],
});

export const getProgressSnapshot = (
  state: Pick<AppState, "selectedLevel" | "completedTopics" | "problemHistory">
): ProgressState => ({
  selectedLevel: state.selectedLevel,
  completedTopics: [...state.completedTopics],
  problemHistory: [...state.problemHistory],
});

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...createDefaultProgressState(),
      userId: null,
      setUserId: (id) => set({ userId: id }),
      setLevel: (level) => set({ selectedLevel: level }),
      markTopicComplete: (slug) =>
        set((state) => ({
          completedTopics: slug
            ? [...new Set([...state.completedTopics, slug])]
            : state.completedTopics,
        })),
      addProblemAttempt: (attempt) =>
        set((state) => ({
          problemHistory: [...state.problemHistory, attempt],
        })),
      loadFromCloud: (data) => set(sanitizeProgressState(data)),
      resetProgress: () => set(createDefaultProgressState()),
    }),
    {
      name: "dsa-visualizer-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => getProgressSnapshot(state),
      version: 1,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizeProgressState((persistedState as Partial<ProgressState>) ?? undefined),
      }),
    }
  )
);
