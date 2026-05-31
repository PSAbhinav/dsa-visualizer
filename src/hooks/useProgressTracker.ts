"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { useStore, type AppState, type TopicProgressEntry } from "@/store/useStore";

export const QUIZ_PASS_SCORE = 70;

export function calculateTopicCompletion(progress?: TopicProgressEntry | null): number {
  if (!progress) {
    return 0;
  }

  let completion = 0;

  if (progress.visualizerViewed) completion += 25;
  if (progress.videosWatched.length > 0) completion += 25;
  if (progress.algorithmRead) completion += 25;
  if ((progress.quizScore ?? 0) >= QUIZ_PASS_SCORE) completion += 25;

  return completion;
}

export function isTopicMastered(progress?: TopicProgressEntry | null): boolean {
  return calculateTopicCompletion(progress) === 100;
}

export function formatLearningTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${safeSeconds}s`;
}

export function formatRelativeDate(value?: string): string {
  if (!value) {
    return "Just getting started";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getMilestoneMessage(completion: number, mastered: boolean): string {
  if (mastered) {
    return "You mastered this topic — amazing work.";
  }

  if (completion >= 75) {
    return "You are one strong finish away from mastery.";
  }

  if (completion >= 50) {
    return "Momentum unlocked — keep stacking sections.";
  }

  if (completion >= 25) {
    return "Great start. One more section and this topic will click.";
  }

  return "Pick a tab and build the habit one section at a time.";
}

interface UseProgressTrackerResult {
  topicProgress?: TopicProgressEntry;
  completionPercentage: number;
  mastered: boolean;
  timeSpent: number;
  milestoneMessage: string;
  currentStreak: number;
  getCompletionPercentage: (slug: string) => number;
  isMastered: (slug: string) => boolean;
  markVisualizerViewed: () => void;
  markAlgorithmRead: () => void;
  markVideoWatched: (videoId: string) => void;
  setQuizScore: (score: number) => void;
  markComplete: () => void;
  addPlaygroundSubmission: AppState["addPlaygroundSubmission"];
}

export function useProgressTracker(topicSlug?: string): UseProgressTrackerResult {
  const toast = useToast();
  const topicProgressMap = useStore((state) => state.topicProgress);
  const dailyStreak = useStore((state) => state.dailyStreak);
  const markTopicStarted = useStore((state) => state.markTopicStarted);
  const storeMarkVisualizerViewed = useStore((state) => state.markVisualizerViewed);
  const storeMarkAlgorithmRead = useStore((state) => state.markAlgorithmRead);
  const storeMarkVideoWatched = useStore((state) => state.markVideoWatched);
  const storeSetQuizScore = useStore((state) => state.setQuizScore);
  const storeMarkComplete = useStore((state) => state.markTopicComplete);
  const addTopicTime = useStore((state) => state.addTopicTime);
  const recordDailyActivity = useStore((state) => state.recordDailyActivity);
  const addPlaygroundSubmission = useStore((state) => state.addPlaygroundSubmission);

  const topicProgress = topicSlug ? topicProgressMap[topicSlug] : undefined;
  const completionPercentage = useMemo(() => calculateTopicCompletion(topicProgress), [topicProgress]);
  const mastered = useMemo(() => isTopicMastered(topicProgress), [topicProgress]);
  const timeSpent = topicProgress?.timeSpent ?? 0;
  const milestoneMessage = useMemo(
    () => getMilestoneMessage(completionPercentage, mastered),
    [completionPercentage, mastered]
  );
  const lastCompletionRef = useRef(completionPercentage);
  const lastStreakRef = useRef(dailyStreak.currentStreak);
  const hasMountedRef = useRef(false);
  const activeStartRef = useRef<number | null>(null);
  const activeStateRef = useRef(false);

  const flushTrackedTime = useCallback(() => {
    if (!topicSlug || !activeStateRef.current || activeStartRef.current === null) {
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - activeStartRef.current) / 1000);

    if (elapsedSeconds > 0) {
      addTopicTime(topicSlug, elapsedSeconds);
    }

    activeStartRef.current = Date.now();
  }, [addTopicTime, topicSlug]);

  const pauseTracking = useCallback(() => {
    flushTrackedTime();
    activeStateRef.current = false;
    activeStartRef.current = null;
  }, [flushTrackedTime]);

  const resumeTracking = useCallback(() => {
    if (!topicSlug || activeStateRef.current) {
      return;
    }

    activeStateRef.current = true;
    activeStartRef.current = Date.now();
    recordDailyActivity(topicSlug, 0);
  }, [recordDailyActivity, topicSlug]);

  useEffect(() => {
    if (!topicSlug) {
      return;
    }

    markTopicStarted(topicSlug);
    resumeTracking();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTracking();
        return;
      }

      resumeTracking();
    };

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        flushTrackedTime();
      }
    }, 30000);

    window.addEventListener("focus", resumeTracking);
    window.addEventListener("blur", pauseTracking);
    window.addEventListener("beforeunload", flushTrackedTime);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", resumeTracking);
      window.removeEventListener("blur", pauseTracking);
      window.removeEventListener("beforeunload", flushTrackedTime);
      pauseTracking();
    };
  }, [flushTrackedTime, markTopicStarted, pauseTracking, recordDailyActivity, resumeTracking, topicSlug]);

  useEffect(() => {
    if (!topicSlug) {
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      lastCompletionRef.current = completionPercentage;
      lastStreakRef.current = dailyStreak.currentStreak;
      return;
    }

    if (completionPercentage > lastCompletionRef.current) {
      toast.success(
        completionPercentage === 100 ? "Topic progress maxed out!" : `Progress updated to ${completionPercentage}%`,
        getMilestoneMessage(completionPercentage, mastered)
      );
    }

    if (dailyStreak.currentStreak > lastStreakRef.current && dailyStreak.currentStreak > 1) {
      toast.info(
        `🔥 ${dailyStreak.currentStreak}-day streak!`,
        "Consistency is turning into real mastery."
      );
    }

    lastCompletionRef.current = completionPercentage;
    lastStreakRef.current = dailyStreak.currentStreak;
  }, [completionPercentage, dailyStreak.currentStreak, mastered, toast, topicSlug]);

  const getCompletionPercentage = useCallback(
    (slug: string) => calculateTopicCompletion(topicProgressMap[slug]),
    [topicProgressMap]
  );

  const getMasteredState = useCallback((slug: string) => isTopicMastered(topicProgressMap[slug]), [topicProgressMap]);

  const markVisualizerViewed = useCallback(() => {
    if (!topicSlug) return;
    storeMarkVisualizerViewed(topicSlug);
  }, [storeMarkVisualizerViewed, topicSlug]);

  const markAlgorithmRead = useCallback(() => {
    if (!topicSlug) return;
    storeMarkAlgorithmRead(topicSlug);
  }, [storeMarkAlgorithmRead, topicSlug]);

  const markVideoWatched = useCallback(
    (videoId: string) => {
      if (!topicSlug) return;
      storeMarkVideoWatched(topicSlug, videoId);
    },
    [storeMarkVideoWatched, topicSlug]
  );

  const setQuizScore = useCallback(
    (score: number) => {
      if (!topicSlug) return;
      storeSetQuizScore(topicSlug, score);
      if (score >= QUIZ_PASS_SCORE) {
        toast.success("Quiz checkpoint cleared", "You are officially in mastery territory.");
      }
    },
    [storeSetQuizScore, toast, topicSlug]
  );

  const markComplete = useCallback(() => {
    if (!topicSlug) return;
    storeMarkComplete(topicSlug);
    toast.success(
      mastered ? "Topic mastered" : "Topic marked complete",
      mastered ? "You closed the loop on every section." : "Nice work — keep revisiting it to lock in mastery."
    );
  }, [mastered, storeMarkComplete, toast, topicSlug]);

  return {
    topicProgress,
    completionPercentage,
    mastered,
    timeSpent,
    milestoneMessage,
    currentStreak: dailyStreak.currentStreak,
    getCompletionPercentage,
    isMastered: getMasteredState,
    markVisualizerViewed,
    markAlgorithmRead,
    markVideoWatched,
    setQuizScore,
    markComplete,
    addPlaygroundSubmission,
  };
}
