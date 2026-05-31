"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCode,
  FiCpu,
  FiExternalLink,
  FiInfo,
  FiPlay,
  FiRotateCcw,
  FiTarget,
  FiTerminal,
} from "react-icons/fi";

import CodeEditor from "@/components/playground/CodeEditor";
import OutputConsole, { type OutputConsoleResult } from "@/components/playground/OutputConsole";
import { getProblemContext, getProblemTemplate, type ProblemTemplateContext } from "@/components/playground/ProblemTemplates";
import {
  getPlaygroundTemplate,
  playgroundTopicOptions,
  resolvePlaygroundTopic,
} from "@/components/playground/PlaygroundTemplates";
import { type ProgrammingLanguage } from "@/data/topics";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/ui/Toast";

const languageOptions: Array<{ value: ProgrammingLanguage; label: string }> = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

function getResultSummary(result: OutputConsoleResult | null) {
  if (!result) {
    return "Ready to run";
  }

  if (result.passed) {
    return "Execution succeeded";
  }

  if (result.stderr || result.compileOutput || result.message) {
    return "Execution failed";
  }

  return result.status ?? "Execution finished";
}

function PlaygroundFallback() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl animate-pulse flex-col gap-6">
        <div className="h-40 rounded-[2rem] border border-white/10 bg-slate-900/70" />
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="h-[560px] rounded-[2rem] border border-white/10 bg-slate-900/70" />
          <div className="h-[560px] rounded-[2rem] border border-white/10 bg-slate-900/70" />
        </div>
      </div>
    </div>
  );
}

interface PlaygroundWorkspaceProps {
  problemContext: ProblemTemplateContext | null;
  requestedProblem: boolean;
  resolvedTopic: string;
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  onTopicChange: (topic: string) => void;
}

function PlaygroundWorkspace({
  problemContext,
  requestedProblem,
  resolvedTopic,
  selectedLanguage,
  onLanguageChange,
  onTopicChange,
}: PlaygroundWorkspaceProps) {
  const { success, error: showError, info, warning } = useToast();
  const playgroundHistory = useStore((state) => state.playgroundHistory);
  const playgroundSuccessCount = useStore((state) => state.playgroundSuccessCount);
  const playgroundFailureCount = useStore((state) => state.playgroundFailureCount);
  const addPlaygroundSubmission = useStore((state) => state.addPlaygroundSubmission);
  const addProblemAttempt = useStore((state) => state.addProblemAttempt);

  const activeTopic = useMemo(
    () => playgroundTopicOptions.find((topic) => topic.slug === resolvedTopic) ?? playgroundTopicOptions[0],
    [resolvedTopic]
  );
  const initialTemplate = problemContext
    ? getProblemTemplate(problemContext, selectedLanguage)
    : getPlaygroundTemplate(resolvedTopic, selectedLanguage);
  const [code, setCode] = useState(initialTemplate);
  const [result, setResult] = useState<OutputConsoleResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [userTimeComplexity, setUserTimeComplexity] = useState("");
  const [userSpaceComplexity, setUserSpaceComplexity] = useState("");
  const [showMarkSolved, setShowMarkSolved] = useState(false);
  const recentRuns = useMemo(() => [...playgroundHistory].reverse().slice(0, 5), [playgroundHistory]);

  const recordProblemAttempt = (isCorrect: boolean, attemptedAt: string) => {
    if (!problemContext) {
      return;
    }

    addProblemAttempt({
      problemId: problemContext.problem.id,
      topicSlug: problemContext.topic.slug,
      userTimeComplexity: userTimeComplexity.trim() || "Not provided",
      userSpaceComplexity: userSpaceComplexity.trim() || "Not provided",
      isCorrect,
      attemptedAt,
      codeExecutions: 1,
    });
  };

  const handleReset = () => {
    setCode(initialTemplate);
    setResult(null);
    setHintsExpanded(false);
    setShowMarkSolved(false);
    setUserTimeComplexity("");
    setUserSpaceComplexity("");
    info("Template reset", problemContext ? "Reloaded the problem starter code." : "Loaded the starter template again.");
  };

  const handleRun = async () => {
    if (!code.trim()) {
      showError("Missing code", "Add some code before running the playground.");
      return;
    }

    setIsRunning(true);
    setResult(null);
    setShowMarkSolved(false);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });

      const payload = (await response.json()) as OutputConsoleResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Execution failed.");
      }

      const finalResult: OutputConsoleResult = {
        ...payload,
        output:
          payload.output ??
          payload.stdout ??
          payload.stderr ??
          payload.compileOutput ??
          payload.message ??
          "Program finished with no output.",
      };

      const timestamp = new Date().toISOString();
      setResult(finalResult);
      addPlaygroundSubmission({
        code,
        language: selectedLanguage,
        output: finalResult.output ?? "",
        passed: Boolean(finalResult.passed),
        topicSlug: resolvedTopic,
        timestamp,
        executionTime: finalResult.executionTime ?? undefined,
        memory: finalResult.memory ?? undefined,
        status: finalResult.status,
        error: finalResult.stderr ?? finalResult.compileOutput ?? finalResult.message ?? undefined,
      });

      if (problemContext) {
        recordProblemAttempt(Boolean(finalResult.passed), timestamp);
      }

      if (finalResult.passed) {
        success(
          problemContext ? "Code executed and attempt recorded" : "Code executed",
          problemContext
            ? `${problemContext.problem.title} was added to your practice history.`
            : "Your program finished successfully."
        );
      } else {
        showError("Execution failed", finalResult.stderr ?? finalResult.compileOutput ?? finalResult.message ?? "The program returned an error.");
      }
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Unable to execute the code.";
      const timestamp = new Date().toISOString();
      setResult({
        output: message,
        stderr: message,
        status: "Failed",
        passed: false,
      });
      addPlaygroundSubmission({
        code,
        language: selectedLanguage,
        output: message,
        passed: false,
        topicSlug: resolvedTopic,
        timestamp,
        error: message,
        status: "Failed",
      });
      if (problemContext) {
        recordProblemAttempt(false, timestamp);
      }
      showError("Run failed", message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = () => {
    if (!problemContext) {
      return;
    }

    if (!userTimeComplexity.trim() || !userSpaceComplexity.trim()) {
      warning("Add your complexity estimates", "Self-report both time and space complexity before submitting.");
      return;
    }

    const solved = Boolean(result?.passed);
    recordProblemAttempt(solved, new Date().toISOString());
    setShowMarkSolved(solved);

    success(
      "Solution submitted",
      solved
        ? "Attempt saved. If you are happy with it, you can mark this problem as solved."
        : "Attempt saved in your history. Run the code successfully to unlock the solved action."
    );
  };

  const handleMarkSolved = () => {
    if (!problemContext) {
      return;
    }

    if (!result?.passed) {
      warning("Run your code first", "Marking as solved is available after a successful run.");
      return;
    }

    if (!userTimeComplexity.trim() || !userSpaceComplexity.trim()) {
      warning("Add your complexity estimates", "Enter your time and space complexity before marking the problem as solved.");
      return;
    }

    recordProblemAttempt(true, new Date().toISOString());
    setShowMarkSolved(false);
    success("Marked as solved", `${problemContext.problem.title} is now marked as solved in your history.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-emerald-500/10 p-6 shadow-2xl shadow-cyan-950/20"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                <FiTerminal className="text-sm" />
                Interactive playground
              </div>
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {problemContext ? `Solve ${problemContext.problem.title}` : "Run DSA ideas instantly"}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {problemContext
                    ? "The problem prompt, expected complexity, and a starter template are loaded so you can focus on solving it."
                    : "Switch languages, load topic templates, execute code, and inspect runtime output without leaving the visualizer."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Successful runs</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{playgroundSuccessCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Failed runs</p>
                <p className="mt-2 text-2xl font-bold text-rose-300">{playgroundFailureCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected topic</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{activeTopic?.title}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <AnimatePresence initial={false}>
          {requestedProblem && !problemContext && (
            <motion.section
              key="missing-problem"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FiInfo className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">We could not find that problem.</p>
                    <p className="mt-1 text-amber-100/80">A standard playground template is loaded instead, so you can still experiment with code.</p>
                  </div>
                </div>
                <Link href="/problems" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-100 transition hover:text-white">
                  Back to problems
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {problemContext && (
            <motion.section
              key={problemContext.problem.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                      {problemContext.topic.icon} {problemContext.topic.title}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        problemContext.problem.difficulty === "Easy"
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                          : problemContext.problem.difficulty === "Medium"
                            ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-100"
                            : "border-rose-400/20 bg-rose-500/10 text-rose-100"
                      }`}
                    >
                      {problemContext.problem.difficulty}
                    </span>
                  </div>
                  <h2 className="mt-4 text-3xl font-bold text-white">{problemContext.problem.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{problemContext.problem.description}</p>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link
                    href="/problems"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-300"
                  >
                    <FiBookOpen className="h-4 w-4" />
                    Back to problems
                  </Link>
                  <Link
                    href={`/topics/${problemContext.topic.slug}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-300"
                  >
                    <FiBookOpen className="h-4 w-4" />
                    Review lesson
                  </Link>
                  {problemContext.problem.leetcodeUrl && (
                    <a
                      href={problemContext.problem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-100 transition hover:border-orange-300/40 hover:bg-orange-500/15"
                    >
                      Original problem
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected time</p>
                  <p className="mt-2 flex items-center gap-2 font-mono text-sm text-emerald-300">
                    <FiClock className="h-4 w-4" />
                    {problemContext.problem.expectedTimeComplexity}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected space</p>
                  <p className="mt-2 flex items-center gap-2 font-mono text-sm text-sky-300">
                    <FiCpu className="h-4 w-4" />
                    {problemContext.problem.expectedSpaceComplexity}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Starter template</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <FiCode className="h-4 w-4 text-cyan-300" />
                    {selectedLanguage} · {problemContext.kind.replace("-", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <button
                  type="button"
                  onClick={() => setHintsExpanded((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Hints</p>
                    <p className="mt-1 text-xs text-slate-400">Collapsed by default so you can reveal help only when you want it.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {hintsExpanded ? "Hide" : "Show"}
                    {hintsExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {hintsExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        {problemContext.problem.hints.map((hint, index) => (
                          <motion.div
                            key={`${problemContext.problem.id}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-7 text-slate-300"
                          >
                            <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-200">
                              {index + 1}
                            </span>
                            {hint}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
            initial={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_auto]">
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="font-medium text-slate-100">Topic template</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
                    onChange={(event) => onTopicChange(event.target.value)}
                    value={resolvedTopic}
                  >
                    {playgroundTopicOptions.map((topic) => (
                      <option key={topic.slug} value={topic.slug}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-200">
                  <span className="font-medium text-slate-100">Language</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
                    onChange={(event) => onLanguageChange(event.target.value as ProgrammingLanguage)}
                    value={selectedLanguage}
                  >
                    {languageOptions.map((language) => (
                      <option key={language.value} value={language.value}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap items-end gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-300"
                    onClick={handleReset}
                    type="button"
                  >
                    <FiRotateCcw />
                    Reset template
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isRunning}
                    onClick={handleRun}
                    type="button"
                  >
                    <FiPlay />
                    {isRunning ? "Running..." : "Run code"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-300">
                  <FiCode />
                  {activeTopic?.title}
                </span>
                <span>{problemContext ? `Solving ${problemContext.problem.title}` : activeTopic?.description}</span>
                <Link className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200" href={`/topics/${resolvedTopic}`}>
                  Back to topic
                  <FiArrowRight />
                </Link>
              </div>
            </div>

            <CodeEditor language={selectedLanguage} onChange={setCode} value={code} />
          </motion.section>

          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
            initial={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <OutputConsole loading={isRunning} onClear={() => setResult(null)} result={result} />

            {problemContext && (
              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Submit this solution</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Compare your approach with the expected complexity, then save the attempt to your history.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {getResultSummary(result)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-200">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-100">
                      <FiTarget className="h-4 w-4 text-cyan-300" />
                      Your time complexity
                    </span>
                    <input
                      value={userTimeComplexity}
                      onChange={(event) => setUserTimeComplexity(event.target.value)}
                      placeholder={problemContext.problem.expectedTimeComplexity}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-200">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-100">
                      <FiCpu className="h-4 w-4 text-cyan-300" />
                      Your space complexity
                    </span>
                    <input
                      value={userSpaceComplexity}
                      onChange={(event) => setUserSpaceComplexity(event.target.value)}
                      placeholder={problemContext.problem.expectedSpaceComplexity}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-slate-100">Reference</p>
                  <p className="mt-2">Expected time: <span className="font-mono text-emerald-300">{problemContext.problem.expectedTimeComplexity}</span></p>
                  <p className="mt-1">Expected space: <span className="font-mono text-sky-300">{problemContext.problem.expectedSpaceComplexity}</span></p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitSolution}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
                  >
                    <FiCheckCircle className="h-4 w-4" />
                    Submit solution
                  </button>
                  {showMarkSolved && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      onClick={handleMarkSolved}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      Mark as solved
                    </motion.button>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Session insights</p>
                  <p className="text-xs text-slate-400">Track what you have executed in this browser.</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {getResultSummary(result)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent history</p>
                  <p className="mt-2 text-2xl font-bold text-slate-100">{playgroundHistory.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest runtime</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <FiClock className="text-cyan-300" />
                    {result?.executionTime ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent runs</p>
                <AnimatePresence initial={false}>
                  {recentRuns.length > 0 ? (
                    recentRuns.map((run, index) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                        exit={{ opacity: 0, y: -10 }}
                        initial={{ opacity: 0, y: 10 }}
                        key={`${run.timestamp}-${index}`}
                        layout
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-100">
                              {playgroundTopicOptions.find((topic) => topic.slug === run.topicSlug)?.title ?? activeTopic?.title}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{run.language}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              run.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {run.passed ? "Success" : "Failed"}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm text-slate-400">{run.output || run.error || "No output captured."}</p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400"
                      initial={{ opacity: 0, y: 10 }}
                    >
                      Your run history will appear here after the first execution.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function PlaygroundPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemParam = searchParams.get("problem");
  const topicParam = searchParams.get("topic");
  const problemContext = useMemo(() => getProblemContext(problemParam, topicParam), [problemParam, topicParam]);
  const requestedProblem = Boolean(problemParam);
  const resolvedTopic = resolvePlaygroundTopic(problemContext?.topic.slug ?? topicParam);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>("javascript");

  return (
    <PlaygroundWorkspace
      key={`${problemContext?.problem.id ?? "generic"}:${resolvedTopic}:${selectedLanguage}`}
      problemContext={problemContext}
      requestedProblem={requestedProblem}
      resolvedTopic={resolvedTopic}
      selectedLanguage={selectedLanguage}
      onLanguageChange={setSelectedLanguage}
      onTopicChange={(topic) => {
        router.replace(`/playground?topic=${topic}`, { scroll: false });
      }}
    />
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <PlaygroundPageContent />
    </Suspense>
  );
}
