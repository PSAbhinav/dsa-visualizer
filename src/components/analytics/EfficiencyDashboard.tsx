"use client";

import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { EfficiencyStats, QuizScatterDatum, StrengthWeaknessItem, VelocityDatum } from "@/lib/analytics";

interface EfficiencyDashboardProps {
  implementationPercentage: number;
  efficiencyStats: EfficiencyStats;
  quizData: QuizScatterDatum[];
  velocityData: VelocityDatum[];
  strengths: StrengthWeaknessItem[];
  weaknesses: StrengthWeaknessItem[];
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: QuizScatterDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">{item.topicTitle}</p>
      <div className="mt-2 space-y-1 text-slate-300">
        <p>Score: {item.score}%</p>
        <p>Time: {item.timeMinutes} min</p>
        <p>Efficiency: {item.efficiency}%</p>
        <p>Difficulty: {item.difficulty}</p>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">Week of {label}</p>
      <div className="mt-2 space-y-1 text-slate-300">
        <p>Topics explored: {payload[0]?.value ?? 0}</p>
        <p>Avg efficiency: {payload[1]?.value ?? 0}%</p>
      </div>
    </div>
  );
}

function BreakdownColumn({ title, items, tone }: { title: string; items: StrengthWeaknessItem[]; tone: "strength" | "weakness" }) {
  const accentClasses =
    tone === "strength"
      ? { label: "text-emerald-300/80", value: "text-emerald-300" }
      : { label: "text-rose-300/80", value: "text-rose-300" };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className={`text-xs uppercase tracking-[0.26em] ${accentClasses.label}`}>{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-white">{item.label}</p>
              <span className={`text-sm font-semibold ${accentClasses.value}`}>{item.score}%</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EfficiencyDashboard({
  implementationPercentage,
  efficiencyStats,
  quizData,
  velocityData,
  strengths,
  weaknesses,
}: EfficiencyDashboardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300/80">Efficiency dashboard</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Momentum, execution, and learning pace</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Faster, higher-quality reps boost efficiency — this view highlights how speed and consistency are compounding.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Avg quiz score</p>
            <p className="mt-1 text-2xl font-semibold text-white">{efficiencyStats.averageQuizScore}%</p>
          </div>
          <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-purple-200/80">Code executions</p>
            <p className="mt-1 text-2xl font-semibold text-white">{efficiencyStats.totalCodeExecutions}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Concept implementation</p>
                <p className="text-sm text-slate-400">Completed topics against your active roadmap.</p>
              </div>
              <span className="text-2xl font-semibold text-cyan-300">{implementationPercentage}%</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${implementationPercentage}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-sm font-medium text-white">Quiz efficiency · score vs time</p>
            <p className="mt-1 text-sm text-slate-400">Top-right wins on quality; leftward wins on speed. Aim for both.</p>
            <div className="mt-4 h-[250px]">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" dataKey="timeMinutes" name="Time" unit="m" stroke="#94a3b8" />
                  <YAxis type="number" dataKey="score" name="Score" unit="%" stroke="#94a3b8" domain={[0, 100]} />
                  <ZAxis type="number" dataKey="efficiency" range={[90, 320]} />
                  <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<ScatterTooltip />} />
                  <Scatter data={quizData} fill="#22d3ee" animationDuration={900} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-sm font-medium text-white">Learning velocity</p>
            <p className="mt-1 text-sm text-slate-400">Weekly topic coverage and efficiency trend.</p>
            <div className="mt-4 h-[250px]">
              <ResponsiveContainer>
                <LineChart data={velocityData} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip content={<TrendTooltip />} />
                  <Line type="monotone" dataKey="efficiency" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} animationDuration={900} />
                  <Line type="monotone" dataKey="topics" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} animationDuration={1100} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownColumn title="Strengths" items={strengths} tone="strength" />
            <BreakdownColumn title="Focus next" items={weaknesses} tone="weakness" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
