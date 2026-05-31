"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizQuestion } from "@/data/types";

interface QuizResultsProps {
  topicSlug: string;
  topicTitle: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  timeTaken: number;
  onRetake: () => void;
}

const gradeScale = [
  { min: 90, grade: "A", label: "Outstanding" },
  { min: 80, grade: "B", label: "Strong work" },
  { min: 70, grade: "C", label: "Solid understanding" },
  { min: 60, grade: "D", label: "Needs another pass" },
  { min: 0, grade: "F", label: "Keep practicing" },
] as const;

const confettiColors = ["#22d3ee", "#a855f7", "#f472b6", "#34d399", "#facc15"];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function PerfectScoreConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        left: `${5 + index * 4.5}%`,
        delay: index * 0.08,
        duration: 2.4 + (index % 5) * 0.2,
        rotate: index % 2 === 0 ? 150 : -150,
        color: confettiColors[index % confettiColors.length],
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: [0, 260], opacity: [0, 1, 1, 0], rotate: piece.rotate }}
          transition={{ duration: piece.duration, delay: piece.delay, repeat: Infinity, ease: "easeOut" }}
          className="absolute top-0 h-3 w-2 rounded-full"
          style={{ left: piece.left, backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}

export function QuizResults({ topicSlug, topicTitle, questions, answers, score, timeTaken, onRetake }: QuizResultsProps) {
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const totalQuestions = questions.length;
  const gradeInfo = gradeScale.find((item) => score >= item.min) ?? gradeScale[gradeScale.length - 1];
  const correctCount = questions.filter((question, index) => answers[index] === question.correctAnswer).length;
  const wrongQuestions = questions
    .map((question, index) => ({ question, index, selectedAnswer: answers[index] }))
    .filter((entry) => entry.selectedAnswer !== entry.question.correctAnswer);
  const perfectScore = score === 100;

  const handleShare = async () => {
    const message = `I scored ${correctCount}/${totalQuestions} (${score}%) on the ${topicTitle} quiz in the DSA Visualizer.`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${topicTitle} Quiz Score`,
          text: message,
          url: `${window.location.origin}/topics/${topicSlug}/quiz`,
        });
        setShareMessage("Score shared successfully.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        setShareMessage("Score copied to clipboard.");
        return;
      }
    } catch {
      setShareMessage("Sharing was cancelled.");
      return;
    }

    setShareMessage("Sharing is not available on this device.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-purple-950/25 backdrop-blur-2xl sm:p-8"
    >
      {perfectScore && <PerfectScoreConfetti />}

      <div className="relative z-10 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Quiz complete</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{topicTitle} results</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {gradeInfo.label}. You answered {correctCount} of {totalQuestions} questions correctly in {formatTime(timeTaken)}.
            </p>
            {perfectScore && (
              <p className="mt-4 inline-flex rounded-full border border-amber-300/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100">
                Perfect score unlocked ✨
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-cyan-300/25 bg-cyan-500/10 p-5">
              <p className="text-sm text-cyan-100/80">Final score</p>
              <p className="mt-2 text-4xl font-bold text-white">{score}%</p>
              <p className="mt-2 text-sm text-cyan-100">Grade {gradeInfo.grade}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">Time taken</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatTime(timeTaken)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">Breakdown</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-100">{correctCount} correct</span>
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-100">{totalQuestions - correctCount} incorrect</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {questions.map((question, index) => {
            const correct = answers[index] === question.correctAnswer;
            return (
              <div
                key={question.id}
                className={`rounded-[1.35rem] border px-4 py-4 ${
                  correct ? "border-emerald-300/25 bg-emerald-500/10" : "border-rose-300/25 bg-rose-500/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">Q{index + 1}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${correct ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
                    {correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200">{question.question}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWrongAnswers((value) => !value)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-purple-300/30 hover:bg-white/10"
          >
            {showWrongAnswers ? "Hide wrong answers" : "Review wrong answers"}
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetake}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30"
          >
            Retake quiz
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="inline-flex items-center justify-center rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
          >
            Share score
          </motion.button>
          <Link
            href={`/topics/${topicSlug}`}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
          >
            Back to topic
          </Link>
        </div>

        {shareMessage && <p className="text-sm text-cyan-100/90">{shareMessage}</p>}

        {showWrongAnswers && (
          <div className="space-y-4">
            {wrongQuestions.length === 0 ? (
              <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                No wrong answers to review — you nailed every question.
              </div>
            ) : (
              wrongQuestions.map(({ question, index, selectedAnswer }) => (
                <div key={`${question.id}-review`} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Question {index + 1}: {question.question}
                    </h3>
                    <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100">Review</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
                    <p>
                      Your answer: <span className="font-semibold text-rose-100">{question.options[selectedAnswer] ?? "No answer"}</span>
                    </p>
                    <p>
                      Correct answer: <span className="font-semibold text-emerald-100">{question.options[question.correctAnswer]}</span>
                    </p>
                    <p>{question.explanation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
