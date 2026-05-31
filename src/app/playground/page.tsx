"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useMemo, useState } from "react";
import { FiArrowRight, FiClock, FiCode, FiPlay, FiRotateCcw, FiTerminal } from "react-icons/fi";

import CodeEditor from "@/components/playground/CodeEditor";
import OutputConsole, { type OutputConsoleResult } from "@/components/playground/OutputConsole";
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

function PlaygroundPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, info } = useToast();

  const topicParam = searchParams.get("topic");
  const initialTopic = resolvePlaygroundTopic(topicParam);

  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>("javascript");
  const [result, setResult] = useState<OutputConsoleResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState(() => getPlaygroundTemplate(initialTopic, "javascript"));

  const playgroundHistory = useStore((state) => state.playgroundHistory);
  const playgroundSuccessCount = useStore((state) => state.playgroundSuccessCount);
  const playgroundFailureCount = useStore((state) => state.playgroundFailureCount);
  const addPlaygroundSubmission = useStore((state) => state.addPlaygroundSubmission);

  const activeTopic = useMemo(
    () => playgroundTopicOptions.find((topic) => topic.slug === selectedTopic) ?? playgroundTopicOptions[0],
    [selectedTopic]
  );
  const defaultTemplate = useMemo(
    () => getPlaygroundTemplate(selectedTopic, selectedLanguage),
    [selectedLanguage, selectedTopic]
  );
  const recentRuns = useMemo(() => [...playgroundHistory].reverse().slice(0, 5), [playgroundHistory]);

  const handleTopicChange = (nextTopic: string) => {
    setSelectedTopic(nextTopic);
    setCode(getPlaygroundTemplate(nextTopic, selectedLanguage));
    setResult(null);
    router.replace(`/playground?topic=${nextTopic}`, { scroll: false });
  };

  const handleLanguageChange = (nextLanguage: ProgrammingLanguage) => {
    setSelectedLanguage(nextLanguage);
    setCode(getPlaygroundTemplate(selectedTopic, nextLanguage));
    setResult(null);
  };

  const handleReset = () => {
    setCode(defaultTemplate);
    setResult(null);
    info("Template reset", "Loaded the starter template again.");
  };

  const handleRun = async () => {
    if (!code.trim()) {
      showError("Missing code", "Add some code before running the playground.");
      return;
    }

    setIsRunning(true);
    setResult(null);

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
        topicSlug: selectedTopic,
        timestamp,
        executionTime: finalResult.executionTime ?? undefined,
        memory: finalResult.memory ?? undefined,
        status: finalResult.status,
        error: finalResult.stderr ?? finalResult.compileOutput ?? finalResult.message ?? undefined,
      });

      if (finalResult.passed) {
        success("Code executed", "Your program finished successfully.");
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
        topicSlug: selectedTopic,
        timestamp,
        error: message,
        status: "Failed",
      });
      showError("Run failed", message);
    } finally {
      setIsRunning(false);
    }
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
                <h1 className="text-3xl font-bold sm:text-4xl">Run DSA ideas instantly</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  Switch languages, load topic templates, execute code, and inspect runtime output without leaving the visualizer.
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
                    onChange={(event) => handleTopicChange(event.target.value)}
                    value={selectedTopic}
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
                    onChange={(event) => handleLanguageChange(event.target.value as ProgrammingLanguage)}
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
                <span>{activeTopic?.description}</span>
                <Link
                  className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
                  href={`/topics/${selectedTopic}`}
                >
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
                              run.passed
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
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

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <PlaygroundPageContent />
    </Suspense>
  );
}
