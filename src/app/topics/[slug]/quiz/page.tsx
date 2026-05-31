"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { PageTransition } from "@/components/layout/PageTransition";
import { getQuizByTopicSlug } from "@/data/quizzes";
import { getTopicBySlug } from "@/data/topics";
import { useStore } from "@/store/useStore";

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TopicQuizPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const topic = getTopicBySlug(slug ?? "");
  const quiz = getQuizByTopicSlug(slug ?? "");
  const topicProgress = useStore((state) => (slug ? state.topicProgress[slug] : undefined));
  const bestScore = useStore((state) => {
    if (!slug) return 0;
    try {
      return state.bestScores?.get?.(slug) ?? 0;
    } catch {
      return 0;
    }
  });
  const quizHistory = useStore((state) => {
    if (!slug) return [];
    try {
      return state.quizHistory?.filter?.((attempt) => attempt.topicSlug === slug) ?? [];
    } catch {
      return [];
    }
  });
  const recordQuizAttempt = useStore((state) => state.recordQuizAttempt);

  const totalQuestions = quiz?.questions.length ?? 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Array<number | null>>(() =>
    Array.from({ length: quiz?.questions.length ?? 0 }, () => null)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const startedAtRef = useRef(0);
  const hasRecordedAttemptRef = useRef(false);

  const currentQuestion = quiz?.questions[currentIndex];
  const submittedAnswer = submittedAnswers[currentIndex] ?? null;
  const quizUnlocked = Boolean(topicProgress?.visualizerViewed) && Boolean(topicProgress?.algorithmRead);
  const score = useMemo(() => {
    if (!quiz) return 0;
    return Math.round(
      (submittedAnswers.filter((answer, index) => answer === quiz.questions[index]?.correctAnswer).length /
        quiz.questions.length) *
        100
    );
  }, [quiz, submittedAnswers]);

  // All useEffects MUST be before conditional returns (Rules of Hooks)
  useEffect(() => {
    if (!quiz || isComplete || status !== "authenticated") {
      return;
    }

    if (startedAtRef.current === 0) {
      startedAtRef.current = Date.now();
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isComplete, quiz, status]);

  useEffect(() => {
    if (!isComplete || !topic || !quiz || hasRecordedAttemptRef.current || status !== "authenticated") {
      return;
    }

    hasRecordedAttemptRef.current = true;
    const calculatedScore = Math.round((submittedAnswers.filter((answer, index) => answer === quiz.questions[index]?.correctAnswer).length / quiz.questions.length) * 100);

    recordQuizAttempt({
      topicSlug: topic.slug,
      score: calculatedScore,
      totalQuestions: quiz.questions.length,
      timeTaken: finalTime,
      attemptedAt: new Date().toISOString(),
    });
  }, [finalTime, isComplete, quiz, recordQuizAttempt, submittedAnswers, topic, status]);

  // Auth loading state
  if (status === "loading") {
    return (
      <PageTransition>
        <div className="flex min-h-[70vh] items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <p className="text-gray-400">Loading...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Auth required
  if (status === "unauthenticated") {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-gray-900/70 p-8 text-center"
          >
            <div className="mb-4 text-6xl">🔐</div>
            <h1 className="mb-3 text-3xl font-bold text-white">Sign In Required</h1>
            <p className="mb-6 text-gray-400">Please sign in to take quizzes and track your scores.</p>
            <button
              onClick={() => signIn("google")}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Sign in with Google
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer === null || !quiz) {
      return;
    }

    setSubmittedAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = selectedAnswer;
      return next;
    });
  };

  const handleContinue = () => {
    if (!quiz) {
      return;
    }

    if (currentIndex === quiz.questions.length - 1) {
      const capturedTime = Math.max(elapsedSeconds, 1);
      setFinalTime(capturedTime);
      setIsComplete(true);
      return;
    }

    setSelectedAnswer(null);
    setCurrentIndex((index) => index + 1);
  };

  const handleRetake = () => {
    if (!quiz) {
      return;
    }

    startedAtRef.current = Date.now();
    hasRecordedAttemptRef.current = false;
    setElapsedSeconds(0);
    setFinalTime(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmittedAnswers(Array.from({ length: quiz.questions.length }, () => null));
    setIsComplete(false);
  };

  if (!topic || !quiz) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="text-5xl">🧩</div>
            <h1 className="mt-4 text-3xl font-bold text-white">Quiz not found</h1>
            <p className="mt-3 text-slate-300">We could not find a quiz for this topic yet.</p>
            <Link
              href="/topics"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-purple-300/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
            >
              Back to topics
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!quizUnlocked) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Quiz locked</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Finish the core lesson first</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              To unlock the {topic.title} quiz, visit both the interactive visualizer and the algorithm walkthrough on the topic page.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className={`rounded-[1.4rem] border p-4 ${topicProgress?.visualizerViewed ? "border-emerald-300/30 bg-emerald-500/10" : "border-white/10 bg-black/20"}`}>
                <p className="text-sm font-semibold text-white">Visual section</p>
                <p className="mt-2 text-sm text-slate-300">{topicProgress?.visualizerViewed ? "Viewed" : "Not viewed yet"}</p>
              </div>
              <div className={`rounded-[1.4rem] border p-4 ${topicProgress?.algorithmRead ? "border-emerald-300/30 bg-emerald-500/10" : "border-white/10 bg-black/20"}`}>
                <p className="text-sm font-semibold text-white">Algorithm section</p>
                <p className="mt-2 text-sm text-slate-300">{topicProgress?.algorithmRead ? "Viewed" : "Not viewed yet"}</p>
              </div>
            </div>
            <Link
              href={`/topics/${topic.slug}`}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30"
            >
              Return to topic
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href={`/topics/${topic.slug}`} className="text-sm font-medium text-cyan-200 transition hover:text-cyan-100">
              ← Back to {topic.title}
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Interactive quiz</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">{topic.title} challenge</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Answer one question at a time, get immediate feedback, and finish with a full breakdown of your performance.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Time elapsed</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatTimer(isComplete ? finalTime : elapsedSeconds)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best score</p>
              <p className="mt-2 text-2xl font-semibold text-white">{bestScore}%</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attempts</p>
              <p className="mt-2 text-2xl font-semibold text-white">{quizHistory.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Progress</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {isComplete ? "Quiz finished" : `Question ${currentIndex + 1} of ${totalQuestions}`}
              </p>
            </div>
            <p className="text-sm text-slate-300">Immediate explanations unlock after each answer.</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/30">
            <motion.div
              animate={{ width: `${((isComplete ? totalQuestions : currentIndex + 1) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div key="results" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
              <QuizResults
                topicSlug={topic.slug}
                topicTitle={topic.title}
                questions={quiz.questions}
                answers={submittedAnswers.map((answer) => answer ?? -1)}
                score={score}
                timeTaken={finalTime}
                onRetake={handleRetake}
              />
            </motion.div>
          ) : currentQuestion ? (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <QuizCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQuestions}
                selectedAnswer={selectedAnswer}
                submittedAnswer={submittedAnswer}
                onSelectAnswer={setSelectedAnswer}
                onSubmit={handleSubmit}
                onContinue={handleContinue}
                isLastQuestion={currentIndex === totalQuestions - 1}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
