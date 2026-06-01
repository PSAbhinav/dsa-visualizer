"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ActivityLog } from "@/store/useStore";

interface StreakCalendarProps {
  activityLog: ActivityLog;
  topicTitlesBySlug: Record<string, string>;
}

interface CalendarCell {
  dateKey: string;
  date: Date;
  activity: ActivityLog[string] | null;
}

const cellTone = [
  "bg-white/5 border-white/5",
  "bg-purple-500/20 border-purple-400/20",
  "bg-purple-500/40 border-purple-400/30",
  "bg-purple-500/60 border-purple-300/40",
  "bg-purple-400/80 border-purple-200/40",
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const intensityFromActivity = (timeSpent: number, activityCount: number): number => {
  const score = Math.max(activityCount, Math.floor(timeSpent / 900));

  if (score <= 0) return 0;
  if (score === 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
};

export function StreakCalendar({ activityLog, topicTitlesBySlug }: StreakCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - 89);
    const alignedStart = new Date(start);
    alignedStart.setDate(start.getDate() - start.getDay());

    const cells: CalendarCell[] = [];
    const cursor = new Date(alignedStart);

    while (cursor <= today) {
      const date = new Date(cursor);
      const dateKey = toDateKey(date);
      cells.push({
        dateKey,
        date,
        activity: activityLog[dateKey] ?? null,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const groupedWeeks: CalendarCell[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      groupedWeeks.push(cells.slice(index, index + 7));
    }

    const labels = groupedWeeks.map((week) => {
      const firstVisibleDay = week.find((cell) => cell.date.getDate() <= 7);
      return firstVisibleDay
        ? firstVisibleDay.date.toLocaleString("en-US", { month: "short" })
        : "";
    });

    return { weeks: groupedWeeks, monthLabels: labels };
  }, [activityLog]);

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_-30px_rgba(168,85,247,0.45)] backdrop-blur-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-purple-200/60">Streak calendar</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Your last 3 months</h3>
        </div>
        <p className="text-sm text-slate-400">Darker squares mean more focused learning sessions.</p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="inline-flex min-w-full gap-2">
          <div className="grid grid-rows-7 gap-2 pt-7 pr-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {dayLabels.map((label) => (
              <span key={label} className="flex h-3 items-center">
                {label}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <div className="grid auto-cols-[14px] grid-flow-col gap-2 px-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
              {monthLabels.map((label, index) => (
                <span key={`${label}-${index}`} className="min-h-4">
                  {label}
                </span>
              ))}
            </div>

            <div className="grid grid-flow-col gap-2">
              {weeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-2">
                  {week.map((cell, dayIndex) => {
                    const intensity = intensityFromActivity(cell.activity?.timeSpent ?? 0, cell.activity?.activityCount ?? 0);
                    const topicsLearned = (cell.activity?.topicsLearned ?? []).map(
                      (slug) => topicTitlesBySlug[slug] ?? slug
                    );
                    const tooltip = topicsLearned.length > 0
                      ? `${topicsLearned.length} topic${topicsLearned.length === 1 ? "" : "s"}: ${topicsLearned.join(", ")}`
                      : "No activity recorded";

                    // Show tooltip below for top rows (Sun/Mon/Tue) to avoid clipping
                    const showBelow = dayIndex < 3;

                    return (
                      <motion.div
                        key={cell.dateKey}
                        whileHover={{ scale: 1.15 }}
                        className="group relative"
                      >
                        <div
                          className={`h-3.5 w-3.5 rounded-[4px] border ${cellTone[intensity]}`}
                          aria-label={`${cell.date.toDateString()} — ${tooltip}`}
                        />
                        <div className={`pointer-events-none absolute left-1/2 z-20 hidden w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 shadow-2xl shadow-black/40 group-hover:block ${showBelow ? "top-full mt-2" : "bottom-full mb-2"}`}>
                          <p className="font-semibold text-white">
                            {cell.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="mt-1 text-slate-300">{tooltip}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
