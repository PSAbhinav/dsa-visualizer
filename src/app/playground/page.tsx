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

import { PageTransition } from "@/components/layout/PageTransition";
import CodeEditor from "@/components/playground/CodeEditor";
import OutputConsole, { type OutputConsoleResult } from "@/components/playground/OutputConsole";
import { getProblemContext, getProblemTemplate, type ProblemTemplateContext } from "@/components/playground/ProblemTemplates";
import {
  getPlaygroundTemplate,
  playgroundTopicOptions,
  resolvePlaygroundTopic,
} from "@/components/playground/PlaygroundTemplates";
import { FadeIn, FloatingParticles, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedComponents";
import { useToast } from "@/components/ui/Toast";
import { type ProgrammingLanguage } from "@/data/topics";
import { useStore } from "@/store/useStore";

const languageOptions: Array<{ value: ProgrammingLanguage; label: string }> = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

const glassPanelClass =
  "group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_-40px_rgba(168,85,247,0.55)] backdrop-blur-2xl";
const glassOverlayClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-400/12 via-pink-400/5 to-cyan-400/10 opacity-60 transition duration-500 group-hover:opacity-100";
const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200";

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

function formatMemory(memory?: number | null) {
  if (memory === null || memory === undefined) {
    return "—";
  }

  return `${(memory / 1024).toFixed(2)} MB`;
}

function getResultTheme(result: OutputConsoleResult | null, isRunning: boolean) {
  if (isRunning) {
    return {
      label: "Running",
      badgeClass: "border-purple-400/30 bg-purple-500/15 text-purple-100",
      helperText: "Your code is executing. Keep the console open for runtime feedback.",
    };
  }

  if (!result) {
    return {
      label: "Ready",
      badgeClass: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
      helperText: "Pick a topic, review the prompt, then run your code when you are ready.",
    };
  }

  if (result.passed) {
    return {
      label: "Passed",
      badgeClass: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
      helperText: "Nice work — your latest run completed successfully.",
    };
  }

  return {
    label: "Needs attention",
    badgeClass: "border-rose-400/30 bg-rose-500/15 text-rose-100",
    helperText: "There is an error or failed run in the latest result. Review the console details below.",
  };
}

function PlaygroundFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="responsive-container py-8 sm:py-10 lg:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-56 rounded-[2rem] border border-white/10 bg-slate-900/70" />
          <div className="h-72 rounded-[2rem] border border-white/10 bg-slate-900/70" />
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="h-[640px] rounded-[2rem] border border-white/10 bg-slate-900/70" />
            <div className="h-[640px] rounded-[2rem] border border-white/10 bg-slate-900/70" />
          </div>
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

  const resultTheme = getResultTheme(result, isRunning);
  const selectedLanguageLabel = languageOptions.find((language) => language.value === selectedLanguage)?.label ?? selectedLanguage;
  const completedComplexityFields = Number(Boolean(userTimeComplexity.trim())) + Number(Boolean(userSpaceComplexity.trim()));
  const missingComplexityFields = 2 - completedComplexityFields;
  const complexityReady = missingComplexityFields === 0;
  const latestRun = recentRuns[0];

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

  const heroStats = [
    { label: "Successful runs", value: playgroundSuccessCount, tone: "text-cyan-100", accent: "from-purple-400/20 to-cyan-400/20" },
    { label: "Failed runs", value: playgroundFailureCount, tone: "text-pink-100", accent: "from-pink-400/20 to-purple-400/20" },
    { label: "Selected topic", value: activeTopic?.title ?? "Playground", tone: "text-white", accent: "from-cyan-400/20 to-purple-400/20" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="responsive-container py-8 sm:py-10 lg:py-12">
          <FadeIn className="mb-6 sm:mb-8">
            <section className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-purple-500/20 via-slate-950 to-cyan-500/20 px-6 py-8 shadow-[0_35px_120px_-55px_rgba(168,85,247,0.75)] sm:px-8 sm:py-10 lg:px-10">
              <FloatingParticles count={26} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%)]" />
              <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-purple-100">
                    <FiTerminal className="text-sm" />
                    Interactive playground
                  </div>
                  <h1 className="text-responsive-display mt-5 font-semibold text-white">
                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                      {problemContext ? `Solve ${problemContext.problem.title}` : "Run DSA ideas instantly"}
                    </span>
                  </h1>
                  <p className="text-responsive-body mt-4 max-w-3xl text-slate-300">
                    {problemContext
                      ? "Review the prompt, compare against the expected complexity targets, and iterate with a polished workspace that matches the rest of the visualizer."
                      : "Switch languages, load topic templates, run algorithms fast, and inspect output in a workspace designed to feel native to the DSA Visualizer experience."}
                  </p>

                  {problemContext && (
                    <div className="mt-5 flex flex-wrap gap-3 text-xs sm:text-sm">
                      <span className={`${pillClass} border-emerald-400/20 bg-emerald-500/10 text-emerald-100`}>
                        <FiClock className="h-3.5 w-3.5" />
                        Target {problemContext.problem.expectedTimeComplexity}
                      </span>
                      <span className={`${pillClass} border-cyan-400/20 bg-cyan-500/10 text-cyan-100`}>
                        <FiCpu className="h-3.5 w-3.5" />
                        Space {problemContext.problem.expectedSpaceComplexity}
                      </span>
                      <span className={`${pillClass} border-pink-400/20 bg-pink-500/10 text-pink-100`}>
                        <FiTarget className="h-3.5 w-3.5" />
                        Complexity fields required
                      </span>
                    </div>
                  )}
                </div>

                <StaggerContainer className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]" staggerDelay={0.08}>
                  {heroStats.map((stat) => (
                    <StaggerItem key={stat.label}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-4 backdrop-blur-xl"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                        <div className="relative">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                          <p className={`mt-3 text-xl font-semibold sm:text-2xl ${stat.tone}`}>{stat.value}</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>
          </FadeIn>

          <AnimatePresence initial={false}>
            {requestedProblem && !problemContext && (
              <motion.section
                key="missing-problem"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-6 overflow-hidden rounded-[28px] border border-amber-400/30 bg-gradient-to-br from-amber-500/12 via-slate-950 to-orange-500/10 shadow-[0_24px_80px_-40px_rgba(251,191,36,0.55)]"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-3">
                    <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                    <div>
                      <p className="font-semibold text-amber-50">We could not find that problem.</p>
                      <p className="mt-1 text-sm text-amber-100/80">A standard playground template is loaded instead, so you can still experiment with code.</p>
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
                className={`${glassPanelClass} mb-6`}
              >
                <div className={glassOverlayClass} />
                <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-purple-500/15 blur-3xl" />

                <div className="relative p-6 sm:p-7">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`${pillClass} border-purple-400/20 bg-purple-500/10 text-purple-100`}>
                          {problemContext.topic.icon} {problemContext.topic.title}
                        </span>
                        <span
                          className={`${pillClass} ${
                            problemContext.problem.difficulty === "Easy"
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                              : problemContext.problem.difficulty === "Medium"
                                ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
                                : "border-rose-400/20 bg-rose-500/10 text-rose-100"
                          }`}
                        >
                          {problemContext.problem.difficulty}
                        </span>
                        <span className={`${pillClass} border-cyan-400/20 bg-cyan-500/10 text-cyan-100`}>
                          <FiCode className="h-3.5 w-3.5" />
                          {selectedLanguageLabel} starter
                        </span>
                      </div>

                      <h2 className="mt-5 text-responsive-title font-semibold text-white">{problemContext.problem.title}</h2>
                      <p className="text-responsive-body mt-4 max-w-3xl text-slate-300">{problemContext.problem.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:max-w-md xl:justify-end">
                      <Link
                        href="/problems"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-purple-400/40 hover:text-purple-200"
                      >
                        <FiBookOpen className="h-4 w-4" />
                        Back to problems
                      </Link>
                      <Link
                        href={`/topics/${problemContext.topic.slug}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-200"
                      >
                        <FiBookOpen className="h-4 w-4" />
                        Review lesson
                      </Link>
                      {problemContext.problem.leetcodeUrl && (
                        <a
                          href={problemContext.problem.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-500/10 px-4 py-3 text-sm font-medium text-pink-100 transition hover:border-pink-300/40 hover:bg-pink-500/15"
                        >
                          Original problem
                          <FiExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <StaggerContainer className="mt-6 grid gap-4 md:grid-cols-3" staggerDelay={0.07}>
                    <StaggerItem>
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/65 p-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Expected time</p>
                        <p className="mt-3 flex items-center gap-2 font-mono text-base text-emerald-300 sm:text-lg">
                          <FiClock className="h-4 w-4" />
                          {problemContext.problem.expectedTimeComplexity}
                        </p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/65 p-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Expected space</p>
                        <p className="mt-3 flex items-center gap-2 font-mono text-base text-cyan-300 sm:text-lg">
                          <FiCpu className="h-4 w-4" />
                          {problemContext.problem.expectedSpaceComplexity}
                        </p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/65 p-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Workspace mode</p>
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-100 sm:text-base">
                          <FiCode className="h-4 w-4 text-purple-300" />
                          {selectedLanguageLabel} · {problemContext.kind.replace("-", " ")}
                        </p>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>

                  <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
                    <button
                      type="button"
                      onClick={() => setHintsExpanded((current) => !current)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-100">Hints</p>
                        <p className="mt-1 text-sm text-slate-400">Reveal help only when you need it so the main prompt stays focused.</p>
                      </div>
                      <span className={pillClass}>
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
                                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-xs font-semibold text-purple-200">
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
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <StaggerContainer className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]" staggerDelay={0.08}>
            <StaggerItem className="space-y-5">
              <section className={glassPanelClass}>
                <div className={glassOverlayClass} />
                <div className="relative p-5 sm:p-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_auto]">
                    <label className="space-y-2 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-100">
                        <FiBookOpen className="h-4 w-4 text-purple-300" />
                        Topic template
                      </span>
                      <select
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-purple-400/50"
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
                      <span className="inline-flex items-center gap-2 font-medium text-slate-100">
                        <FiCode className="h-4 w-4 text-cyan-300" />
                        Language
                      </span>
                      <select
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
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
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-purple-400/40 hover:text-purple-200"
                        onClick={handleReset}
                        type="button"
                      >
                        <FiRotateCcw />
                        Reset template
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isRunning}
                        onClick={handleRun}
                        type="button"
                      >
                        <FiPlay />
                        {isRunning ? "Running..." : "Run code"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="relative rounded-[30px] bg-gradient-to-br from-purple-400/45 via-pink-400/25 to-cyan-400/45 p-[1px] shadow-[0_28px_100px_-45px_rgba(168,85,247,0.9)]">
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-purple-400/20 via-transparent to-cyan-400/20" />
                <div className="relative overflow-hidden rounded-[29px] border border-white/10 bg-slate-950/95">
                  <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className={`${pillClass} border-purple-400/20 bg-purple-500/10 text-purple-100`}>
                        <FiCode className="h-3.5 w-3.5" />
                        Live editor
                      </span>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {problemContext ? "Starter solution loaded" : `${activeTopic?.title} template loaded`}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {problemContext ? "Refine the provided starter and run it as often as needed." : activeTopic?.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                      <span className={pillClass}>{selectedLanguageLabel}</span>
                      <span className={`${pillClass} hidden sm:inline-flex`}>{activeTopic?.title}</span>
                      <Link className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200" href={`/topics/${resolvedTopic}`}>
                        Back to topic
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>

                  <CodeEditor language={selectedLanguage} onChange={setCode} value={code} />
                </div>
              </div>
            </StaggerItem>

            <StaggerItem className="space-y-5">
              <section className={glassPanelClass}>
                <div className={glassOverlayClass} />
                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className={`${pillClass} ${resultTheme.badgeClass}`}>
                        <FiTerminal className="h-3.5 w-3.5" />
                        Run status
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-white">{getResultSummary(result)}</h3>
                      <p className="mt-1 text-sm text-slate-400">{resultTheme.helperText}</p>
                    </div>
                    <span className={`${pillClass} ${resultTheme.badgeClass}`}>{resultTheme.label}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Latest status</p>
                      <p className="mt-3 text-sm font-semibold text-slate-100">{isRunning ? "Running..." : result?.status ?? "Waiting for execution"}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Runtime</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <FiClock className="text-cyan-300" />
                        {result?.executionTime ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Memory</p>
                      <p className="mt-3 text-sm font-semibold text-slate-100">{formatMemory(result?.memory)}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-[30px] bg-gradient-to-br from-purple-400/20 via-transparent to-cyan-400/20 p-[1px] shadow-[0_24px_80px_-42px_rgba(59,130,246,0.5)]">
                <div className="overflow-hidden rounded-[29px]">
                  <OutputConsole loading={isRunning} onClear={() => setResult(null)} result={result} />
                </div>
              </div>

              {problemContext && (
                <section className="group relative overflow-hidden rounded-[30px] border border-pink-400/25 bg-gradient-to-br from-purple-500/18 via-slate-950/95 to-cyan-500/12 shadow-[0_28px_100px_-50px_rgba(236,72,153,0.7)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_34%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/6 to-cyan-400/10 opacity-80 transition duration-500 group-hover:opacity-100" />

                  <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-pink-100">
                          <FiTarget className="h-3.5 w-3.5" />
                          Required before submit
                        </span>
                        <h3 className="mt-4 text-xl font-semibold text-white">Complexity check-in</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          Make both estimates visible before saving the attempt. These fields are required and compared against the expected target below.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Completion</p>
                        <p className="mt-2 font-semibold text-white">{completedComplexityFields}/2 fields complete</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {complexityReady
                            ? "Ready to submit"
                            : `${missingComplexityFields} required field${missingComplexityFields === 1 ? "" : "s"} missing`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[28px] border border-pink-400/20 bg-slate-950/75 p-4 sm:p-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <label
                          className={`rounded-[26px] border p-4 transition ${
                            userTimeComplexity.trim()
                              ? "border-emerald-400/25 bg-emerald-500/5"
                              : "border-pink-400/30 bg-pink-500/5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 font-semibold text-white">
                              <FiClock className="h-4 w-4 text-emerald-300" />
                              Your time complexity
                            </span>
                            <span className={`${pillClass} ${userTimeComplexity.trim() ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-pink-400/20 bg-pink-500/10 text-pink-100"}`}>
                              {userTimeComplexity.trim() ? "Filled" : "Required"}
                            </span>
                          </div>
                          <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                            Expected {problemContext.problem.expectedTimeComplexity}
                          </p>
                          <input
                            value={userTimeComplexity}
                            onChange={(event) => setUserTimeComplexity(event.target.value)}
                            placeholder={problemContext.problem.expectedTimeComplexity}
                            className={`mt-3 w-full rounded-2xl border bg-slate-950/95 px-4 py-4 text-base font-medium text-slate-100 outline-none transition placeholder:text-slate-500 ${
                              userTimeComplexity.trim() ? "border-emerald-400/30 focus:border-emerald-300/50" : "border-pink-400/30 focus:border-pink-300/50"
                            }`}
                          />
                        </label>

                        <label
                          className={`rounded-[26px] border p-4 transition ${
                            userSpaceComplexity.trim()
                              ? "border-emerald-400/25 bg-emerald-500/5"
                              : "border-pink-400/30 bg-pink-500/5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 font-semibold text-white">
                              <FiCpu className="h-4 w-4 text-cyan-300" />
                              Your space complexity
                            </span>
                            <span className={`${pillClass} ${userSpaceComplexity.trim() ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-pink-400/20 bg-pink-500/10 text-pink-100"}`}>
                              {userSpaceComplexity.trim() ? "Filled" : "Required"}
                            </span>
                          </div>
                          <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                            Expected {problemContext.problem.expectedSpaceComplexity}
                          </p>
                          <input
                            value={userSpaceComplexity}
                            onChange={(event) => setUserSpaceComplexity(event.target.value)}
                            placeholder={problemContext.problem.expectedSpaceComplexity}
                            className={`mt-3 w-full rounded-2xl border bg-slate-950/95 px-4 py-4 text-base font-medium text-slate-100 outline-none transition placeholder:text-slate-500 ${
                              userSpaceComplexity.trim() ? "border-emerald-400/30 focus:border-emerald-300/50" : "border-pink-400/30 focus:border-pink-300/50"
                            }`}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Expected time target</p>
                        <p className="mt-3 font-mono text-xl text-emerald-300">{problemContext.problem.expectedTimeComplexity}</p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Expected space target</p>
                        <p className="mt-3 font-mono text-xl text-cyan-300">{problemContext.problem.expectedSpaceComplexity}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSubmitSolution}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition"
                      >
                        <FiCheckCircle className="h-4 w-4" />
                        Submit solution
                      </motion.button>
                      {showMarkSolved && (
                        <motion.button
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleMarkSolved}
                          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                          Mark as solved
                        </motion.button>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className={glassPanelClass}>
                <div className={glassOverlayClass} />
                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className={`${pillClass} border-cyan-400/20 bg-cyan-500/10 text-cyan-100`}>
                        <FiClock className="h-3.5 w-3.5" />
                        Session insights
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-white">Recent runs</h3>
                      <p className="mt-1 text-sm text-slate-400">Track what you have executed in this browser and revisit the latest output quickly.</p>
                    </div>
                    <span className={`${pillClass} ${resultTheme.badgeClass}`}>{resultTheme.label}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">History size</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{playgroundHistory.length}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Latest runtime</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <FiClock className="text-cyan-300" />
                        {latestRun?.executionTime ?? result?.executionTime ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Recent history</p>
                    <AnimatePresence initial={false}>
                      {recentRuns.length > 0 ? (
                        recentRuns.map((run, index) => (
                          <motion.article
                            key={`${run.timestamp}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            whileHover={{ y: -3 }}
                            className="group/run relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/75 p-4 transition"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-cyan-400/10 opacity-0 transition-opacity duration-500 group-hover/run:opacity-100" />
                            <div className="relative">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-100">
                                    {playgroundTopicOptions.find((topic) => topic.slug === run.topicSlug)?.title ?? activeTopic?.title}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                                    <span>{run.language}</span>
                                    <span>•</span>
                                    <span>{new Date(run.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`${pillClass} ${run.passed ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-rose-400/20 bg-rose-500/10 text-rose-100"}`}>
                                    {run.passed ? "Success" : "Failed"}
                                  </span>
                                  <span className={pillClass}>{run.executionTime ?? "—"}</span>
                                </div>
                              </div>
                              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{run.output || run.error || "No output captured."}</p>
                            </div>
                          </motion.article>
                        ))
                      ) : (
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/60 px-4 py-10 text-center text-sm text-slate-400"
                          initial={{ opacity: 0, y: 10 }}
                        >
                          Your run history will appear here after the first execution.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
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
