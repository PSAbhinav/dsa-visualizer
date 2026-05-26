import { db, isFirebaseConfigured } from "@/lib/firebase";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import type { Level } from "@/data/topics";
import type { ProblemAttempt } from "@/store/useStore";

export interface UserProfile {
  email: string;
  name: string;
  image: string;
  selectedLevel: Level | null;
  completedTopics: string[];
  problemHistory: ProblemAttempt[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

type UserProfilePatch = Partial<UserProfile>;

const VALID_LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced", "pro"];
let hasWarnedAboutFirebaseAvailability = false;

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

const sanitizeString = (value: unknown): string => (typeof value === "string" ? value : "");

const sanitizeUserProfile = (data: DocumentData | undefined): UserProfile => ({
  email: sanitizeString(data?.email),
  name: sanitizeString(data?.name),
  image: sanitizeString(data?.image),
  selectedLevel: isLevel(data?.selectedLevel) ? data.selectedLevel : null,
  completedTopics: Array.isArray(data?.completedTopics)
    ? [...new Set(data.completedTopics.filter((topic): topic is string => typeof topic === "string"))]
    : [],
  problemHistory: Array.isArray(data?.problemHistory)
    ? data.problemHistory.filter(isProblemAttempt)
    : [],
  createdAt: data?.createdAt,
  updatedAt: data?.updatedAt,
});

const sanitizeUserProfilePatch = (data: UserProfilePatch): UserProfilePatch => {
  const patch: UserProfilePatch = {};

  if ("email" in data) patch.email = sanitizeString(data.email);
  if ("name" in data) patch.name = sanitizeString(data.name);
  if ("image" in data) patch.image = sanitizeString(data.image);
  if ("selectedLevel" in data) patch.selectedLevel = isLevel(data.selectedLevel) ? data.selectedLevel : null;
  if ("completedTopics" in data) {
    patch.completedTopics = Array.isArray(data.completedTopics)
      ? [...new Set(data.completedTopics.filter((topic): topic is string => typeof topic === "string"))]
      : [];
  }
  if ("problemHistory" in data) {
    patch.problemHistory = Array.isArray(data.problemHistory)
      ? data.problemHistory.filter(isProblemAttempt)
      : [];
  }

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
        completedTopics: [...new Set(completedTopics.filter((topic): topic is string => typeof topic === "string"))],
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
