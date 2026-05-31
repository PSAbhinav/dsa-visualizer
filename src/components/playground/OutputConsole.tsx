"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export interface OutputConsoleResult {
  output?: string | null;
  stdout?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  message?: string | null;
  executionTime?: string | null;
  memory?: number | null;
  status?: string;
  passed?: boolean;
}

interface OutputConsoleProps {
  result: OutputConsoleResult | null;
  loading?: boolean;
  onClear: () => void;
}

function formatMemory(memory?: number | null) {
  if (memory === null || memory === undefined) {
    return "—";
  }

  return `${(memory / 1024).toFixed(2)} MB`;
}

export default function OutputConsole({ result, loading = false, onClear }: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  const mergedOutput = useMemo(
    () =>
      [result?.stdout, result?.stderr, result?.compileOutput, result?.message, result?.output]
        .filter(Boolean)
        .join("\n\n"),
    [result]
  );

  const handleCopy = async () => {
    if (!mergedOutput) {
      return;
    }

    await navigator.clipboard.writeText(mergedOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950/80 shadow-xl shadow-emerald-950/20"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">Output Console</p>
          <p className="text-xs text-slate-400">Stdout, stderr, execution time, and memory usage.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!mergedOutput}
            onClick={handleCopy}
            type="button"
          >
            {copied ? "Copied" : "Copy output"}
          </button>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-rose-400/40 hover:text-rose-300"
            onClick={onClear}
            type="button"
          >
            Clear output
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
            <p className={`mt-2 text-sm font-semibold ${result?.passed ? "text-emerald-300" : "text-slate-100"}`}>
              {loading ? "Running..." : result?.status ?? "Waiting for execution"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{result?.executionTime ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Memory</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{formatMemory(result?.memory)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] animate-pulse flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 font-mono text-sm">
            <div className="h-4 w-24 rounded-full bg-slate-800" />
            <div className="h-4 w-full rounded-full bg-slate-900" />
            <div className="h-4 w-10/12 rounded-full bg-slate-900" />
            <div className="h-4 w-8/12 rounded-full bg-slate-900" />
            <div className="h-4 w-6/12 rounded-full bg-slate-900" />
          </div>
        ) : mergedOutput ? (
          <pre className="min-h-[220px] overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono text-sm leading-6 text-slate-100">
            {mergedOutput}
          </pre>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 px-6 text-center text-sm text-slate-400">
            Run a template to inspect stdout, stderr, compiler diagnostics, and runtime stats.
          </div>
        )}
      </div>
    </motion.section>
  );
}
