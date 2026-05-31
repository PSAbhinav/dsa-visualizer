"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Highlight, themes } from "prism-react-renderer";
import type { QuizQuestion } from "@/data/types";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  submittedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onSubmit: () => void;
  onContinue: () => void;
  isLastQuestion: boolean;
}

const difficultyClasses: Record<QuizQuestion["difficulty"], string> = {
  easy: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  medium: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  hard: "border-rose-400/30 bg-rose-500/10 text-rose-100",
};

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  submittedAnswer,
  onSelectAnswer,
  onSubmit,
  onContinue,
  isLastQuestion,
}: QuizCardProps) {
  const hasSubmitted = submittedAnswer !== null;
  const answeredCorrectly = submittedAnswer === question.correctAnswer;

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl"
    >
      <div className="border-b border-white/10 bg-white/5 px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200">Question {questionNumber}</p>
            <p className="mt-2 text-sm text-slate-300">Choose the best answer before moving on.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
              {questionNumber} / {totalQuestions}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${difficultyClasses[question.difficulty]}`}>
              {question.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold leading-8 text-white sm:text-2xl">{question.question}</h2>
        </div>

        {question.codeSnippet && (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>Code snippet</span>
              <span>JavaScript</span>
            </div>
            <Highlight theme={themes.vsDark} code={question.codeSnippet.trim()} language="tsx">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={`${className} overflow-x-auto px-4 py-4 text-sm`} style={style}>
                  {tokens.map((line, lineIndex) => (
                    <div key={lineIndex} {...getLineProps({ line })} className="table-row">
                      <span className="table-cell select-none pr-4 text-right text-slate-500">{lineIndex + 1}</span>
                      <span className="table-cell">
                        {line.map((token, tokenIndex) => (
                          <span key={tokenIndex} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        )}

        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = hasSubmitted && index === question.correctAnswer;
            const isWrongSelection = hasSubmitted && index === submittedAnswer && submittedAnswer !== question.correctAnswer;

            return (
              <motion.button
                key={`${question.id}-${option}`}
                type="button"
                whileHover={hasSubmitted ? undefined : { scale: 1.01, y: -2 }}
                whileTap={hasSubmitted ? undefined : { scale: 0.99 }}
                onClick={() => !hasSubmitted && onSelectAnswer(index)}
                className={`flex w-full items-start gap-4 rounded-[1.35rem] border px-4 py-4 text-left transition-all sm:px-5 ${
                  isCorrect
                    ? "border-emerald-300/50 bg-emerald-500/15 text-emerald-50"
                    : isWrongSelection
                      ? "border-rose-300/50 bg-rose-500/15 text-rose-50"
                      : isSelected
                        ? "border-purple-300/40 bg-purple-500/15 text-white"
                        : "border-white/10 bg-black/20 text-slate-200 hover:border-purple-300/30 hover:bg-white/10"
                } ${hasSubmitted ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    isCorrect
                      ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                      : isWrongSelection
                        ? "border-rose-300/50 bg-rose-400/20 text-rose-100"
                        : isSelected
                          ? "border-purple-300/50 bg-purple-400/20 text-purple-100"
                          : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 leading-7">{option}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`rounded-[1.5rem] border p-5 ${
                answeredCorrectly
                  ? "border-emerald-300/30 bg-emerald-500/10"
                  : "border-rose-300/30 bg-rose-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                    answeredCorrectly
                      ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-100"
                      : "border-rose-300/40 bg-rose-400/20 text-rose-100"
                  }`}
                >
                  {answeredCorrectly ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="m7 7 10 10M17 7 7 17" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </motion.div>
                <div className="space-y-2">
                  <p className={`text-lg font-semibold ${answeredCorrectly ? "text-emerald-100" : "text-rose-100"}`}>
                    {answeredCorrectly ? "Correct answer" : "Not quite"}
                  </p>
                  {!answeredCorrectly && (
                    <p className="text-sm text-rose-100/90">
                      Correct answer: <span className="font-semibold">{question.options[question.correctAnswer]}</span>
                    </p>
                  )}
                  <p className="text-sm leading-7 text-slate-200">{question.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            {hasSubmitted ? "Review the explanation, then continue." : "Pick one answer and submit to get instant feedback."}
          </p>
          {hasSubmitted ? (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-400 hover:to-fuchsia-400"
            >
              {isLastQuestion ? "See results" : "Next question"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={selectedAnswer !== null ? { y: -1 } : undefined}
              whileTap={selectedAnswer !== null ? { scale: 0.98 } : undefined}
              onClick={onSubmit}
              disabled={selectedAnswer === null}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit answer
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
