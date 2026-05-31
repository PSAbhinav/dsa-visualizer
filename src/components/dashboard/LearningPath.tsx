"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { levels, type Level } from "@/data/topics";
import type { LearningPathEdge, LearningPathNode } from "@/lib/recommendationEngine";

interface LearningPathProps {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  progressPercentage: number;
  preview?: boolean;
  levelFilter?: Level | "all";
}

const statusStyles = {
  completed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100 shadow-emerald-500/20",
  current: "border-cyan-400/50 bg-cyan-400/10 text-cyan-100 shadow-cyan-500/20",
  available: "border-violet-400/40 bg-violet-400/10 text-violet-100 shadow-violet-500/20",
  locked: "border-white/10 bg-slate-900/90 text-slate-300 shadow-slate-950/30",
} as const;

const statusLabel = {
  completed: "Completed",
  current: "In progress",
  available: "Ready",
  locked: "Locked",
} as const;

export default function LearningPath({ nodes, edges, progressPercentage, preview = false, levelFilter = "all" }: LearningPathProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(nodes.find((node) => node.recommendationRank === 1)?.topic.slug ?? nodes[0]?.topic.slug ?? null);
  const [paths, setPaths] = useState<Array<LearningPathEdge & { path: string }>>([]);

  useEffect(() => {
    const updatePaths = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!containerRect) {
        return;
      }

      const nextPaths = edges
        .map((edge) => {
          const fromRect = nodeRefs.current[edge.from]?.getBoundingClientRect();
          const toRect = nodeRefs.current[edge.to]?.getBoundingClientRect();

          if (!fromRect || !toRect) {
            return null;
          }

          const startX = fromRect.left + fromRect.width / 2 - containerRect.left;
          const startY = fromRect.top + fromRect.height - containerRect.top;
          const endX = toRect.left + toRect.width / 2 - containerRect.left;
          const endY = toRect.top - containerRect.top;
          const controlY = startY + (endY - startY) / 2;
          const path = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

          return { ...edge, path };
        })
        .filter((edge): edge is LearningPathEdge & { path: string } => Boolean(edge));

      setPaths(nextPaths);
    };

    updatePaths();

    const observer = new ResizeObserver(updatePaths);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    Object.values(nodeRefs.current).forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    window.addEventListener("resize", updatePaths);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePaths);
    };
  }, [edges, nodes, levelFilter]);

  const groupedNodes = useMemo(() => {
    return levels
      .map((level) => ({
        level,
        nodes: nodes.filter((node) => node.topic.level === level.id),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [nodes]);

  const visibleGroups = preview ? groupedNodes.slice(0, 3) : groupedNodes;
  const resolvedSelectedSlug = selectedSlug && nodes.some((node) => node.topic.slug === selectedSlug)
    ? selectedSlug
    : nodes.find((node) => node.recommendationRank === 1)?.topic.slug ?? nodes[0]?.topic.slug ?? null;
  const selectedNode = nodes.find((node) => node.topic.slug === resolvedSelectedSlug) ?? nodes[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Learning path</p>
          <h3 className="mt-2 text-2xl font-semibold">{preview ? "Your next milestones" : "Interactive learning roadmap"}</h3>
          <p className="mt-2 text-sm text-slate-300">
            Track completed concepts, see what is unlocked, and follow the animated dependency path.
          </p>
        </div>

        <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Path progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div ref={containerRef} className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {paths.map((edge) => (
              <motion.path
                key={`${edge.from}-${edge.to}`}
                d={edge.path}
                fill="none"
                stroke={edge.satisfied ? "rgba(34,211,238,0.85)" : "rgba(148,163,184,0.35)"}
                strokeWidth={edge.satisfied ? 2.5 : 1.5}
                strokeDasharray={edge.satisfied ? "0" : "6 6"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              />
            ))}
          </svg>

          <div className="relative grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
            {visibleGroups.map((group, groupIndex) => (
              <div key={group.level.id} className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Level {groupIndex + 1}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{group.level.icon} {group.level.title}</p>
                </div>
                <div className="space-y-3">
                  {group.nodes.map((node, index) => (
                    <motion.button
                      key={node.topic.slug}
                      ref={(element) => {
                        nodeRefs.current[node.topic.slug] = element;
                      }}
                      type="button"
                      onClick={() => setSelectedSlug(node.topic.slug)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + groupIndex * 0.08 }}
                      className={`w-full rounded-2xl border p-4 text-left shadow-lg transition hover:-translate-y-1 ${statusStyles[node.status]} ${
                        resolvedSelectedSlug === node.topic.slug ? "ring-2 ring-cyan-300/70" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] opacity-80">{statusLabel[node.status]}</p>
                          <p className="mt-1 text-base font-semibold text-white">{node.topic.title}</p>
                        </div>
                        {node.recommendationRank ? (
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                            #{node.recommendationRank}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                        <span>{node.completionPercentage}% complete</span>
                        {typeof node.quizScore === "number" ? <span>Quiz {node.quizScore}%</span> : null}
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(node.completionPercentage, node.status === "completed" ? 100 : 8)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          {selectedNode ? (
            <>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Selected topic</p>
              <h4 className="mt-2 text-2xl font-semibold text-white">{selectedNode.topic.title}</h4>
              <p className="mt-2 text-sm text-slate-300">{selectedNode.topic.shortDescription}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-slate-400">Status</p>
                  <p className="mt-1 font-semibold text-white">{statusLabel[selectedNode.status]}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-slate-400">Level</p>
                  <p className="mt-1 font-semibold capitalize text-white">{selectedNode.topic.level}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-slate-400">Progress</p>
                  <p className="mt-1 font-semibold text-white">{selectedNode.completionPercentage}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-slate-400">Quiz score</p>
                  <p className="mt-1 font-semibold text-white">{selectedNode.quizScore ?? "—"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-white">Prerequisite checklist</p>
                {selectedNode.prerequisiteStatus.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">No prerequisites required.</p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm">
                    {selectedNode.prerequisiteStatus.map((prerequisite) => (
                      <div key={prerequisite.slug} className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2">
                        <span className="text-slate-200">{prerequisite.title}</span>
                        <span className={prerequisite.completed ? "text-emerald-300" : "text-amber-300"}>
                          {prerequisite.completed ? "Completed" : "Incomplete"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/topics/${selectedNode.topic.slug}`}
                  className="inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Start Learning
                </Link>
                {preview ? (
                  <Link
                    href="/learning-path"
                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200"
                  >
                    Open full roadmap
                  </Link>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">Select a topic node to inspect its place in the roadmap.</p>
          )}
        </div>
      </div>
    </div>
  );
}
