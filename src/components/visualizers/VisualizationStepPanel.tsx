"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  passNumber?: number;
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

const toneIcons: Record<StepTone, string> = {
  compare: "⚖️",
  swap: "🔄",
  sorted: "✅",
  round: "🔁",
  access: "👁️",
  insert: "➕",
  delete: "➖",
  pointer: "👆",
  traverse: "🔍",
  visit: "📍",
  explore: "🧭",
  info: "ℹ️",
};

interface VisualizationStepPanelProps {
  entries: VisualizationStep[];
  onClear: () => void;
  emptyMessage: string;
  title?: string;
}

// Group entries by passes/rounds
function groupByPasses(entries: VisualizationStep[]) {
  const groups: { divider: VisualizationStep | null; steps: VisualizationStep[] }[] = [];
  let currentGroup: { divider: VisualizationStep | null; steps: VisualizationStep[] } = { divider: null, steps: [] };

  for (const entry of entries) {
    if (entry.isDivider) {
      if (currentGroup.divider || currentGroup.steps.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { divider: entry, steps: [] };
    } else {
      currentGroup.steps.push(entry);
    }
  }

  if (currentGroup.divider || currentGroup.steps.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function PassGroup({ divider, steps }: { divider: VisualizationStep | null; steps: VisualizationStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const compareCount = steps.filter(s => s.tone === "compare").length;
  const swapCount = steps.filter(s => s.tone === "swap").length;

  if (!divider && steps.length === 0) return null;

  const toneClass = divider ? toneClasses[divider.tone] : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-xl border overflow-hidden ${toneClass}`}>
      {divider && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{toneIcons[divider.tone]}</span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {divider.action}
              </div>
              {steps.length > 0 && (
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {compareCount > 0 && `${compareCount} comparisons`}
                  {compareCount > 0 && swapCount > 0 && " • "}
                  {swapCount > 0 && `${swapCount} swaps`}
                </div>
              )}
            </div>
          </div>
          {steps.length > 0 && (
            <span className={`text-xs text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>
              ▼
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {(expanded || !divider) && steps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-1 border-t border-white/5 pt-2">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="flex items-start gap-2 text-[11px] text-gray-300 py-1"
                >
                  <span className="text-gray-500 shrink-0">{step.stepNumber}.</span>
                  <span className="text-gray-400">{toneIcons[step.tone]}</span>
                  <span>{step.action}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {divider && !expanded && divider.explanation && (
        <div className="px-3 pb-2 text-xs text-gray-300">{divider.explanation}</div>
      )}
    </div>
  );
}

export function VisualizationStepPanel({
  entries,
  onClear,
  emptyMessage,
  title = "Step Log",
}: VisualizationStepPanelProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const groups = groupByPasses(entries);

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
          <p className="text-xs text-gray-400">Click a pass to expand details.</p>
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

      <div className="max-h-[250px] space-y-2 overflow-y-auto pr-2">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-xs text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          groups.map((group, index) => (
            <PassGroup 
              key={group.divider?.id ?? `group-${index}`} 
              divider={group.divider} 
              steps={group.steps} 
            />
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
