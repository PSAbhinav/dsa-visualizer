"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategoryMasteryDatum, TopicScoreDatum } from "@/lib/analytics";

interface SkillsBreakdownProps {
  categoryData: CategoryMasteryDatum[];
  topicData: TopicScoreDatum[];
  recommendations: string[];
}

function ComparisonTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: string; you: number; averageUser: number } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">{item.category}</p>
      <div className="mt-2 space-y-1 text-slate-300">
        <p>You: {item.you}%</p>
        <p>Average learner: {item.averageUser}%</p>
      </div>
    </div>
  );
}

function TopicTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopicScoreDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">{item.title}</p>
      <div className="mt-2 space-y-1 text-slate-300">
        <p>Mastery: {item.mastery}%</p>
        <p>Average learner: {item.averageUser}%</p>
        <p>Visual / Quiz / Practice: {item.visualScore}% / {item.quizScore}% / {item.practiceScore}%</p>
      </div>
    </div>
  );
}

export function SkillsBreakdown({ categoryData, topicData, recommendations }: SkillsBreakdownProps) {
  const focusedTopics = topicData.slice(0, 8);
  const comparisonData = categoryData.map((entry) => ({
    category: entry.category,
    you: entry.mastery,
    averageUser:
      focusedTopics.find((topic) => topic.category === entry.category)?.averageUser ?? 60,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Skills breakdown</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">See where you outperform the pack</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Compare category-level strength against a mock platform average, then drill into the topics with the biggest upside.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Growth signal</p>
          <p className="mt-1 text-lg font-semibold text-white">{Math.max(0, ...topicData.map((topic) => topic.mastery - topic.averageUser), 0)} pts ahead</p>
          <p className="text-sm text-emerald-200">at your best-performing topic</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-sm font-medium text-white">Skills radar</p>
            <p className="mt-1 text-sm text-slate-400">Your mastery profile against a typical learner baseline.</p>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer>
                <RadarChart data={comparisonData} outerRadius="70%">
                  <PolarGrid stroke="rgba(148, 163, 184, 0.22)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#e2e8f0", fontSize: 12 }} />
                  <Tooltip content={<ComparisonTooltip />} />
                  <Radar dataKey="averageUser" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} animationDuration={700} />
                  <Radar dataKey="you" stroke="#34d399" fill="#10b981" fillOpacity={0.35} animationDuration={1100} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-sm font-medium text-white">Areas to improve</p>
            <div className="mt-4 space-y-3">
              {recommendations.map((recommendation) => (
                <div key={recommendation} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
          <p className="text-sm font-medium text-white">Topic-by-topic mastery</p>
          <p className="mt-1 text-sm text-slate-400">The bars show how your strongest active topics compare to the average user.</p>
          <div className="mt-4 h-[420px]">
            <ResponsiveContainer>
              <BarChart data={focusedTopics} layout="vertical" margin={{ top: 10, right: 12, bottom: 0, left: 18 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                <YAxis type="category" dataKey="title" width={110} stroke="#94a3b8" />
                <Tooltip content={<TopicTooltip />} />
                <Legend />
                <Bar dataKey="averageUser" fill="#64748b" radius={[0, 10, 10, 0]} animationDuration={700} />
                <Bar dataKey="mastery" fill="#34d399" radius={[0, 10, 10, 0]} animationDuration={1100} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
