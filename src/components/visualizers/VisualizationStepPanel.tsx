"use client";

import { useEffect, useRef } from "react";

export type StepTone =
  | "compare"
  | "swap"
  | "sorted"
  | "round"
  | "access"
  | "insert"
  | "delete"
  | "pointer"
  | "traverse"
  | "visit"
  | "explore"
  | "info";

export interface VisualizationStep {
  id: string;
  action: string;
  explanation: string;
  tone: StepTone;
  stepNumber?: number;
  isDivider?: boolean;
}

const toneClasses: Record<StepTone, string> = {
  compare: "border-yellow-500/30 bg-yellow-500/10",
  swap: "border-orange-500/30 bg-orange-500/10",
  sorted: "border-green-500/30 bg-green-500/10",
  round: "border-cyan-500/30 bg-cyan-500/10",
  access: "border-sky-500/30 bg-sky-500/10",
  insert: "border-emerald-500/30 bg-emerald-500/10",
  delete: "border-rose-500/30 bg-rose-500/10",
  pointer: "border-fuchsia-500/30 bg-fuchsia-500/10",
  traverse: "border-indigo-500/30 bg-indigo-500/10",
  visit: "border-violet-500/30 bg-violet-500/10",
  explore: "border-amber-500/30 bg-amber-500/10",
  info: "border-white/10 bg-white/5",
};

interface VisualizationStepPanelProps {
  entries: VisualizationStep[];
  onClear: () => void;
  emptyMessage: string;
  title?: string;
}

export function VisualizationStepPanel({
  entries,
  onClear,
  emptyMessage,
  title = "Step Log",
}: VisualizationStepPanelProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const endNode = endRef.current;

    if (endNode && typeof endNode.scrollIntoView === "function") {
      endNode.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [entries]);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-gray-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-gray-400">Updates explain why each operation happens.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear Log
        </button>
      </div>

      <div className="max-h-[200px] space-y-2 overflow-y-auto pr-2">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-xs text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          entries.map((entry) => {
            const toneClass = toneClasses[entry.tone];

            if (entry.isDivider) {
              return (
                <div key={entry.id} className={`rounded-xl border px-3 py-2 ${toneClass}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    {entry.action}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-200">{entry.explanation}</p>
                </div>
              );
            }

            return (
              <div key={entry.id} className={`rounded-xl border px-3 py-2 ${toneClass}`}>
                <p className="text-xs leading-relaxed text-gray-100">
                  <span className="font-semibold text-white">Step {entry.stepNumber}:</span>{" "}
                  <span className="font-medium text-white">{entry.action}</span>
                  {" - "}
                  <span className="text-gray-200">{entry.explanation}</span>
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
