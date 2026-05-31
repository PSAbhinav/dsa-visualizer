"use client";

import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryMasteryDatum } from "@/lib/analytics";

interface MasteryRadarProps {
  data: CategoryMasteryDatum[];
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryMasteryDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">{item.category}</p>
      <p className="mt-2 text-cyan-300">Mastery {item.mastery}%</p>
      <div className="mt-3 space-y-1 text-slate-300">
        <p>Visual: {item.visualScore}%</p>
        <p>Quiz: {item.quizScore}%</p>
        <p>Practice: {item.practiceScore}%</p>
      </div>
      <p className="mt-3 text-xs text-slate-400">{item.focus}</p>
    </div>
  );
}

export function MasteryRadar({ data }: MasteryRadarProps) {
  const topCategory = [...data].sort((left, right) => right.mastery - left.mastery)[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Mastery radar</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">How your core DSA skills stack up</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Hover each axis to see the mix of visual learning, quiz precision, and implementation confidence.
          </p>
        </div>
        {topCategory ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Strongest area</p>
            <p className="mt-1 text-lg font-semibold text-white">{topCategory.category}</p>
            <p className="text-sm text-emerald-200">{topCategory.mastery}% mastery</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 h-[340px] w-full">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#e2e8f0", fontSize: 12 }} />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name="Mastery"
              dataKey="mastery"
              stroke="#22d3ee"
              fill="#06b6d4"
              fillOpacity={0.35}
              strokeWidth={3}
              animationDuration={1100}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
