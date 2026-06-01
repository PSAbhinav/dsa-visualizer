"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { levels, type Level } from "@/data/topics";
import type { LearningPathEdge, LearningPathNode, LearningPathStatus } from "@/lib/recommendationEngine";

interface LearningPathProps {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  progressPercentage: number;
  preview?: boolean;
  levelFilter?: Level | "all";
}

type EdgeVisualState = "completed" | "active" | "locked";

const statusMeta: Record<
  LearningPathStatus,
  {
    label: string;
    icon: string;
    chipClass: string;
    cardClass: string;
    glowClass: string;
    progressClass: string;
  }
> = {
  completed: {
    label: "Completed",
    icon: "✅",
    chipClass: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100",
    cardClass: "border-fuchsia-400/20 bg-[linear-gradient(180deg,rgba(91,33,182,0.32),rgba(15,23,42,0.88))]",
    glowClass: "shadow-[0_26px_80px_-42px_rgba(217,70,239,0.85)]",
    progressClass: "from-fuchsia-400 via-violet-400 to-pink-400",
  },
  current: {
    label: "Current",
    icon: "📍",
    chipClass: "border-cyan-400/35 bg-cyan-400/15 text-cyan-100",
    cardClass: "border-cyan-300/35 bg-[linear-gradient(180deg,rgba(8,145,178,0.24),rgba(15,23,42,0.88))]",
    glowClass: "shadow-[0_26px_80px_-40px_rgba(34,211,238,0.85)]",
    progressClass: "from-cyan-300 via-sky-400 to-violet-400",
  },
  available: {
    label: "Unlocked",
    icon: "🔓",
    chipClass: "border-violet-400/30 bg-violet-500/15 text-violet-100",
    cardClass: "border-violet-400/20 bg-[linear-gradient(180deg,rgba(76,29,149,0.26),rgba(15,23,42,0.88))]",
    glowClass: "shadow-[0_26px_80px_-42px_rgba(139,92,246,0.8)]",
    progressClass: "from-violet-300 via-fuchsia-400 to-cyan-300",
  },
  locked: {
    label: "Locked",
    icon: "🔒",
    chipClass: "border-white/10 bg-white/5 text-slate-300",
    cardClass: "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.95))]",
    glowClass: "shadow-[0_24px_70px_-48px_rgba(15,23,42,1)]",
    progressClass: "from-slate-500 to-slate-600",
  },
};

const levelAccent: Record<Level, string> = {
  beginner: "from-emerald-400/25 via-cyan-400/15 to-transparent",
  intermediate: "from-cyan-400/20 via-blue-400/10 to-transparent",
  advanced: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  pro: "from-amber-400/20 via-orange-400/10 to-transparent",
};

const statusRank: Record<LearningPathStatus, number> = {
  current: 0,
  available: 1,
  completed: 2,
  locked: 3,
};

const SCALE_OPTIONS = [0.85, 1, 1.15];

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((total, value) => total + value, 0) / values.length : Number.POSITIVE_INFINITY;

function getPrioritySlug(nodes: LearningPathNode[]) {
  return (
    nodes.find((node) => node.status === "current")?.topic.slug ??
    nodes.find((node) => node.recommendationRank === 1)?.topic.slug ??
    nodes.find((node) => node.status === "available")?.topic.slug ??
    nodes[0]?.topic.slug ??
    null
  );
}

function getCurrentLevel(nodes: LearningPathNode[]) {
  for (const level of levels) {
    const levelNodes = nodes.filter((node) => node.topic.level === level.id);

    if (levelNodes.length === 0) {
      continue;
    }

    if (levelNodes.some((node) => node.status !== "completed")) {
      return level.id;
    }
  }

  return levels[levels.length - 1]?.id ?? "beginner";
}

export default function LearningPath({ nodes, edges, progressPercentage, preview = false, levelFilter = "all" }: LearningPathProps) {
  const prioritySlug = useMemo(() => getPrioritySlug(nodes), [nodes]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [celebratingLevel, setCelebratingLevel] = useState<Level | null>(null);
  const previousCompletionRef = useRef<Record<string, number>>({});
  const effectiveSearchQuery = preview ? "" : searchQuery;
  const effectiveZoom = preview ? 1 : zoom;

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.topic.slug, node])), [nodes]);
  const currentLevel = useMemo(() => getCurrentLevel(nodes), [nodes]);
  const levelLabelMap = useMemo(() => new Map(levels.map((level) => [level.id, level.title])), []);

  const dependencyMaps = useMemo(() => {
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    edges.forEach((edge) => {
      incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge.from]);
      outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
    });

    return { incoming, outgoing };
  }, [edges]);

  const matchedSlugs = useMemo(() => {
    const query = effectiveSearchQuery.trim().toLowerCase();

    if (!query) {
      return new Set(nodes.map((node) => node.topic.slug));
    }

    const matches = new Set(
      nodes
        .filter((node) => `${node.topic.title} ${node.topic.shortDescription}`.toLowerCase().includes(query))
        .map((node) => node.topic.slug),
    );
    const searchContext = [...matches];

    while (searchContext.length > 0) {
      const slug = searchContext.pop();

      if (!slug) {
        continue;
      }

      nodeMap.get(slug)?.prerequisiteStatus.forEach((prerequisite) => {
        if (!matches.has(prerequisite.slug)) {
          matches.add(prerequisite.slug);
          searchContext.push(prerequisite.slug);
        }
      });
    }

    return matches;
  }, [effectiveSearchQuery, nodeMap, nodes]);

  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesLevel = levelFilter === "all" || node.topic.level === levelFilter;
      const matchesSearch = matchedSlugs.has(node.topic.slug);
      return matchesLevel && matchesSearch;
    });
  }, [levelFilter, matchedSlugs, nodes]);

  const visibleNodeMap = useMemo(() => new Map(visibleNodes.map((node) => [node.topic.slug, node])), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter((edge) => visibleNodeMap.has(edge.from) && visibleNodeMap.has(edge.to));
  }, [edges, visibleNodeMap]);

  const levelSummaries = useMemo(() => {
    return levels
      .map((level) => {
        const levelNodes = nodes.filter((node) => node.topic.level === level.id);
        const completed = levelNodes.filter((node) => node.status === "completed").length;
        const percentage = levelNodes.length > 0 ? Math.round((completed / levelNodes.length) * 100) : 0;

        return {
          ...level,
          total: levelNodes.length,
          completed,
          percentage,
          isCurrent: level.id === currentLevel,
        };
      })
      .filter((level) => level.total > 0);
  }, [currentLevel, nodes]);

  useEffect(() => {
    const nextCompletion = Object.fromEntries(levelSummaries.map((level) => [level.id, level.percentage]));
    const newlyCompleted = levelSummaries.find(
      (level) => level.percentage === 100 && (previousCompletionRef.current[level.id] ?? 0) < 100,
    );

    previousCompletionRef.current = nextCompletion;

    if (!newlyCompleted) {
      return undefined;
    }

    setCelebratingLevel(newlyCompleted.id);
    const timeoutId = window.setTimeout(() => setCelebratingLevel(null), 2200);

    return () => window.clearTimeout(timeoutId);
  }, [levelSummaries]);

  const visibleRows = useMemo(() => {
    const grouped = levels
      .map((level) => ({
        level,
        nodes: visibleNodes.filter((node) => node.topic.level === level.id),
      }))
      .filter((group) => group.nodes.length > 0);

    return preview ? grouped.slice(0, 3) : grouped;
  }, [preview, visibleNodes]);

  const layout = useMemo(() => {
    if (visibleRows.length === 0) {
      return {
        width: 0,
        height: 0,
        rowDefinitions: [] as Array<(typeof visibleRows)[number] & { y: number; x: number; width: number }>,
        positions: new Map<string, { x: number; y: number; row: number; col: number }>(),
        paths: [] as Array<LearningPathEdge & { path: string; visualState: EdgeVisualState }>,
      };
    }

    const leftRailWidth = preview ? 190 : 240;
    const cardWidth = preview ? 220 : 248;
    const cardHeight = preview ? 132 : 158;
    const gapX = preview ? 42 : 56;
    const gapY = preview ? 124 : 150;
    const paddingX = preview ? 36 : 54;
    const paddingY = preview ? 34 : 50;
    const maxColumns = Math.max(...visibleRows.map((row) => row.nodes.length));
    const canvasWidth = maxColumns * cardWidth + Math.max(0, maxColumns - 1) * gapX;
    const positions = new Map<string, { x: number; y: number; row: number; col: number }>();
    const incomingPositions = new Map<string, number>();

    const sortedRows = visibleRows.map((row) => {
      const rowNodes = [...row.nodes].sort((left, right) => {
        const leftIncoming = (dependencyMaps.incoming.get(left.topic.slug) ?? [])
          .map((slug) => incomingPositions.get(slug))
          .filter((value): value is number => typeof value === "number");
        const rightIncoming = (dependencyMaps.incoming.get(right.topic.slug) ?? [])
          .map((slug) => incomingPositions.get(slug))
          .filter((value): value is number => typeof value === "number");
        const incomingDifference = average(leftIncoming) - average(rightIncoming);

        if (Number.isFinite(incomingDifference) && incomingDifference !== 0) {
          return incomingDifference;
        }

        const statusDifference = statusRank[left.status] - statusRank[right.status];

        if (statusDifference !== 0) {
          return statusDifference;
        }

        const recommendationDifference = (left.recommendationRank ?? 99) - (right.recommendationRank ?? 99);

        if (recommendationDifference !== 0) {
          return recommendationDifference;
        }

        return left.topic.title.localeCompare(right.topic.title);
      });

      rowNodes.forEach((node, index) => incomingPositions.set(node.topic.slug, index));

      return { ...row, nodes: rowNodes };
    });

    const rowDefinitions = sortedRows.map((row, rowIndex) => {
      const rowWidth = row.nodes.length * cardWidth + Math.max(0, row.nodes.length - 1) * gapX;
      const x = leftRailWidth + paddingX + (canvasWidth - rowWidth) / 2;
      const y = paddingY + rowIndex * (cardHeight + gapY);

      row.nodes.forEach((node, columnIndex) => {
        positions.set(node.topic.slug, {
          x: x + columnIndex * (cardWidth + gapX),
          y,
          row: rowIndex,
          col: columnIndex,
        });
      });

      return {
        ...row,
        x,
        y,
        width: rowWidth,
      };
    });

    const sameRowOrder = new Map<string, number>();
    visibleEdges
      .filter((edge) => positions.get(edge.from)?.row === positions.get(edge.to)?.row)
      .sort((left, right) => {
        const leftFrom = positions.get(left.from);
        const leftTo = positions.get(left.to);
        const rightFrom = positions.get(right.from);
        const rightTo = positions.get(right.to);
        const leftDistance = leftFrom && leftTo ? Math.abs(leftTo.col - leftFrom.col) : 0;
        const rightDistance = rightFrom && rightTo ? Math.abs(rightTo.col - rightFrom.col) : 0;
        return leftDistance - rightDistance;
      })
      .forEach((edge, index) => sameRowOrder.set(`${edge.from}-${edge.to}`, index));

    const paths = visibleEdges.flatMap((edge) => {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      const targetNode = visibleNodeMap.get(edge.to);

      if (!from || !to || !targetNode) {
        return [];
      }

      const visualState: EdgeVisualState = !edge.satisfied
        ? "locked"
        : targetNode.status === "completed"
          ? "completed"
          : "active";

      if (from.row === to.row) {
        const movingRight = to.x > from.x;
        const key = `${edge.from}-${edge.to}`;
        const lift = 54 + (sameRowOrder.get(key) ?? 0) * 18;
        const startX = movingRight ? from.x + cardWidth : from.x;
        const endX = movingRight ? to.x : to.x + cardWidth;
        const y = from.y + cardHeight / 2;
        const centerX = (startX + endX) / 2;
        const direction = movingRight ? 1 : -1;
        const path = [
          `M ${startX} ${y}`,
          `C ${startX + 36 * direction} ${y}, ${centerX - 30 * direction} ${y - lift}, ${centerX} ${y - lift}`,
          `S ${endX - 36 * direction} ${y}, ${endX} ${y}`,
        ].join(" ");

        return [{ ...edge, path, visualState }];
      }

      const startX = from.x + cardWidth / 2;
      const startY = from.y + cardHeight;
      const endX = to.x + cardWidth / 2;
      const endY = to.y;
      const offset = Math.min(82, Math.max(42, (endY - startY) / 2));
      const path = `M ${startX} ${startY} C ${startX} ${startY + offset}, ${endX} ${endY - offset}, ${endX} ${endY}`;

      return [{ ...edge, path, visualState }];
    });

    return {
      width: leftRailWidth + paddingX * 2 + canvasWidth,
      height: paddingY * 2 + rowDefinitions.length * cardHeight + Math.max(0, rowDefinitions.length - 1) * gapY,
      rowDefinitions,
      positions,
      paths,
    };
  }, [dependencyMaps.incoming, preview, visibleEdges, visibleNodeMap, visibleRows]);

  const resolvedSelectedSlug = selectedSlug && nodeMap.has(selectedSlug) ? selectedSlug : prioritySlug;
  const selectedNode = (resolvedSelectedSlug ? nodeMap.get(resolvedSelectedSlug) : null) ?? nodes[0] ?? null;
  const selectedDependents = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    return (dependencyMaps.outgoing.get(selectedNode.topic.slug) ?? [])
      .map((slug) => nodeMap.get(slug))
      .filter((node): node is LearningPathNode => Boolean(node));
  }, [dependencyMaps.outgoing, nodeMap, selectedNode]);

  const activeSearchCount = useMemo(
    () =>
      nodes.filter((node) => `${node.topic.title} ${node.topic.shortDescription}`.toLowerCase().includes(effectiveSearchQuery.trim().toLowerCase())).length,
    [effectiveSearchQuery, nodes],
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-5 text-white shadow-[0_32px_120px_-48px_rgba(34,211,238,0.35)] backdrop-blur-2xl sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(168,85,247,0.08),transparent_36%,rgba(34,211,238,0.08))]" />
      <div className="relative">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-cyan-300">Learning roadmap</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {preview ? "Your next roadmap tiers" : "A polished skill-tree view of your DSA journey"}
              </h3>
              {celebratingLevel ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/35 bg-fuchsia-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-fuchsia-100"
                >
                  🎉 {levels.find((level) => level.id === celebratingLevel)?.title} cleared
                </motion.span>
              ) : null}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Follow clean prerequisite paths, inspect every topic, and move tier by tier from foundations to pro-level mastery.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-4 shadow-[0_20px_60px_-40px_rgba(34,211,238,0.8)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Overall completion</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-3xl font-semibold text-white">{progressPercentage}%</span>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  roadmap
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current level</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {levels.find((level) => level.id === currentLevel)?.icon} {levels.find((level) => level.id === currentLevel)?.title}
              </p>
              <p className="mt-1 text-xs text-slate-400">Highlighted in the timeline</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active topic</p>
              <p className="mt-2 line-clamp-2 text-lg font-semibold text-white">{selectedNode?.topic.title ?? "Choose a node"}</p>
              <p className="mt-1 text-xs text-slate-400">Tap a card to inspect details</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {levelSummaries.map((level) => (
            <div
              key={level.id}
              className={clsx(
                "relative overflow-hidden rounded-[1.6rem] border px-4 py-4 backdrop-blur-xl transition",
                level.isCurrent ? "border-cyan-300/35 bg-cyan-400/10" : "border-white/10 bg-white/[0.04]",
              )}
            >
              <div className={clsx("absolute inset-0 bg-gradient-to-r opacity-80", levelAccent[level.id])} />
              {celebratingLevel === level.id ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.35, opacity: [0, 0.55, 0] }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="absolute inset-0 rounded-[1.6rem] bg-fuchsia-400/30 blur-2xl"
                />
              ) : null}
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">{level.title}</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {level.icon} {level.completed}/{level.total}
                  </p>
                </div>
                {level.isCurrent ? (
                  <span className="rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    Current
                  </span>
                ) : null}
              </div>
              <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level.percentage}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={clsx("h-full rounded-full bg-gradient-to-r", level.color)}
                />
              </div>
              <p className="relative mt-2 text-xs text-slate-300">{level.percentage}% complete</p>
            </div>
          ))}
        </div>

        {!preview ? (
          <div className="mt-6 flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <label className="flex-1">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search topics</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search arrays, graphs, DP..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                />
              </label>
              <div className="min-w-[180px] rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Visible topics</p>
                <p className="mt-2 text-lg font-semibold text-white">{visibleNodes.length}</p>
                <p className="text-xs text-slate-400">
                  {effectiveSearchQuery.trim() ? `${activeSearchCount} direct matches` : "Full filtered roadmap"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Zoom</span>
              {SCALE_OPTIONS.map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setZoom(scale)}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                    effectiveZoom === scale
                      ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/25 hover:text-white",
                  )}
                >
                  {Math.round(scale * 100)}%
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {layout.rowDefinitions.length === 0 ? (
          <div className="mt-8 rounded-[1.8rem] border border-dashed border-white/10 bg-slate-950/55 px-6 py-10 text-center text-sm text-slate-300">
            No topics match the current filter. Try a broader search or switch levels.
          </div>
        ) : (
          <div className={clsx("mt-8 grid gap-6", preview ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1.55fr)_380px]") }>
            <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/60 p-3 shadow-[0_24px_80px_-48px_rgba(34,211,238,0.45)] sm:p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Timeline legend</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-100">Solid = completed path</span>
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-100">Animated = active path</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">Dotted = locked path</span>
                  </div>
                </div>
                {!preview ? <p className="text-xs text-slate-400">Scroll to pan the roadmap horizontally.</p> : null}
              </div>

              <div className="overflow-x-auto pb-3">
                <div style={{ width: layout.width * effectiveZoom, height: layout.height * effectiveZoom }}>
                  <div
                    className="relative rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))]"
                    style={{ width: layout.width, height: layout.height, transform: `scale(${effectiveZoom})`, transformOrigin: "top left" }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

                    {layout.rowDefinitions.map((row) => {
                      const summary = levelSummaries.find((level) => level.id === row.level.id);

                      return (
                        <div key={row.level.id}>
                          <div
                            className={clsx(
                              "absolute left-6 flex w-[190px] flex-col gap-3 rounded-[1.6rem] border px-4 py-4 backdrop-blur-xl",
                              row.level.id === currentLevel ? "border-cyan-300/35 bg-cyan-400/10" : "border-white/10 bg-white/[0.05]",
                            )}
                            style={{ top: row.y + 10 }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tier</p>
                                <p className="mt-1 text-lg font-semibold text-white">
                                  {row.level.icon} {row.level.title}
                                </p>
                              </div>
                              {summary?.isCurrent ? (
                                <span className="rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                  You are here
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm leading-6 text-slate-300">{row.level.description}</p>
                            <div>
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Level completion</span>
                                <span>{summary?.percentage ?? 0}%</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                                <div className={clsx("h-full rounded-full bg-gradient-to-r", row.level.color)} style={{ width: `${summary?.percentage ?? 0}%` }} />
                              </div>
                            </div>
                          </div>

                          <div
                            className={clsx("absolute left-[220px] right-8 h-px bg-gradient-to-r", levelAccent[row.level.id])}
                            style={{ top: row.y + 80 }}
                          />
                        </div>
                      );
                    })}

                    <svg className="pointer-events-none absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id="path-completed" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgba(244,114,182,0.92)" />
                          <stop offset="100%" stopColor="rgba(168,85,247,0.95)" />
                        </linearGradient>
                        <linearGradient id="path-active" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgba(34,211,238,0.95)" />
                          <stop offset="100%" stopColor="rgba(125,211,252,0.95)" />
                        </linearGradient>
                      </defs>

                      {layout.paths.map((edge) => (
                        <motion.path
                          key={`${edge.from}-${edge.to}`}
                          d={edge.path}
                          fill="none"
                          stroke={
                            edge.visualState === "completed"
                              ? "url(#path-completed)"
                              : edge.visualState === "active"
                                ? "url(#path-active)"
                                : "rgba(148,163,184,0.38)"
                          }
                          strokeWidth={edge.visualState === "locked" ? 1.5 : 2.5}
                          strokeDasharray={edge.visualState === "completed" ? "0" : edge.visualState === "active" ? "10 8" : "4 8"}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={edge.visualState === "active" ? { pathLength: 1, opacity: 1, strokeDashoffset: [0, -34] } : { pathLength: 1, opacity: 1 }}
                          transition={
                            edge.visualState === "active"
                              ? { pathLength: { duration: 0.8 }, opacity: { duration: 0.4 }, strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" } }
                              : { duration: 0.7, ease: "easeOut" }
                          }
                          style={{ filter: edge.visualState === "locked" ? "none" : "drop-shadow(0 0 10px rgba(34,211,238,0.2))" }}
                        />
                      ))}
                    </svg>

                    {visibleRows.flatMap((row) => row.nodes).map((node, index) => {
                      const position = layout.positions.get(node.topic.slug);

                      if (!position) {
                        return null;
                      }

                      const isSelected = resolvedSelectedSlug === node.topic.slug;
                      const isPriority = prioritySlug === node.topic.slug;
                      const isDirectMatch = effectiveSearchQuery.trim()
                        ? `${node.topic.title} ${node.topic.shortDescription}`.toLowerCase().includes(effectiveSearchQuery.trim().toLowerCase())
                        : false;

                      return (
                        <motion.article
                          key={node.topic.slug}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ y: -6, scale: 1.015 }}
                          className={clsx(
                            "absolute overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl transition duration-300",
                            statusMeta[node.status].cardClass,
                            statusMeta[node.status].glowClass,
                            isSelected ? "ring-2 ring-cyan-300/70 ring-offset-2 ring-offset-slate-950" : "hover:border-cyan-300/25",
                            isDirectMatch ? "shadow-[0_0_0_1px_rgba(34,211,238,0.3)]" : "",
                          )}
                          style={{ left: position.x, top: position.y, width: preview ? 220 : 248, height: preview ? 132 : 158 }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%)] opacity-80" />
                          <button
                            type="button"
                            onClick={() => setSelectedSlug(node.topic.slug)}
                            className="relative flex h-full w-full flex-col justify-between p-4 text-left"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 pr-10">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl">
                                    {node.topic.icon}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-base font-semibold text-white">{node.topic.title}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">{levelLabelMap.get(node.topic.level)}</p>
                                  </div>
                                </div>
                                {node.recommendationRank ? (
                                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    #{node.recommendationRank}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className={clsx("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", statusMeta[node.status].chipClass)}>
                                  {statusMeta[node.status].icon} {statusMeta[node.status].label}
                                </span>
                                {isPriority ? (
                                  <motion.span
                                    initial={{ opacity: 0.8, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
                                    className="rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100"
                                  >
                                    You are here
                                  </motion.span>
                                ) : null}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-xs text-slate-300">
                                <span>{node.completionPercentage}% complete</span>
                                <span>{typeof node.quizScore === "number" ? `Quiz ${node.quizScore}%` : "Quiz pending"}</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(node.status === "completed" ? 100 : node.completionPercentage, node.status === "locked" ? 8 : 14)}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                  className={clsx("h-full rounded-full bg-gradient-to-r", statusMeta[node.status].progressClass)}
                                />
                              </div>
                            </div>
                          </button>

                          <Link
                            href={`/topics/${node.topic.slug}`}
                            aria-label={`Open ${node.topic.title}`}
                            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-sm text-white/80 transition hover:border-cyan-300/35 hover:bg-cyan-400/15 hover:text-cyan-100"
                          >
                            ↗
                          </Link>
                        </motion.article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {!preview ? (
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_80px_-54px_rgba(168,85,247,0.7)] backdrop-blur-2xl">
                {selectedNode ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedNode.topic.slug}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.24 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Topic details</p>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                              {selectedNode.topic.icon}
                            </span>
                            <div>
                              <h4 className="text-2xl font-semibold text-white">{selectedNode.topic.title}</h4>
                              <p className="mt-1 text-sm text-slate-400">{selectedNode.topic.level} tier</p>
                            </div>
                          </div>
                        </div>
                        <span className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]", statusMeta[selectedNode.status].chipClass)}>
                          {statusMeta[selectedNode.status].icon} {statusMeta[selectedNode.status].label}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-300">{selectedNode.topic.shortDescription}</p>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-slate-400">Completion</p>
                          <p className="mt-1 text-xl font-semibold text-white">{selectedNode.completionPercentage}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-slate-400">Quiz score</p>
                          <p className="mt-1 text-xl font-semibold text-white">{selectedNode.quizScore ?? "—"}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-slate-400">Prerequisites</p>
                          <p className="mt-1 text-xl font-semibold text-white">{selectedNode.prerequisiteStatus.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-slate-400">Unlocks next</p>
                          <p className="mt-1 text-xl font-semibold text-white">{selectedDependents.length}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Prerequisite chain</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Complete to unlock</span>
                        </div>
                        {selectedNode.prerequisiteStatus.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-300">This is a foundation topic — you can start immediately.</p>
                        ) : (
                          <div className="mt-4 space-y-2.5">
                            {selectedNode.prerequisiteStatus.map((prerequisite) => (
                              <div
                                key={prerequisite.slug}
                                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm"
                              >
                                <span className="text-slate-200">{prerequisite.title}</span>
                                <span className={prerequisite.completed ? "text-emerald-300" : "text-slate-400"}>
                                  {prerequisite.completed ? "✅ Completed" : "🔒 Locked by prerequisite"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Unlocks after this</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Future paths</span>
                        </div>
                        {selectedDependents.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-300">This sits near the frontier of the roadmap.</p>
                        ) : (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedDependents.map((dependent) => (
                              <button
                                key={dependent.topic.slug}
                                type="button"
                                onClick={() => setSelectedSlug(dependent.topic.slug)}
                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                              >
                                {dependent.topic.icon} {dependent.topic.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/topics/${selectedNode.topic.slug}`}
                          className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-200 hover:to-violet-300"
                        >
                          Open topic
                        </Link>
                        <Link
                          href="/topics"
                          className="inline-flex items-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:text-cyan-100"
                        >
                          Browse all topics
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <p className="text-sm text-slate-300">Select a topic to inspect its path details.</p>
                )}
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Roadmap spotlight</p>
                <p className="mt-2 text-xl font-semibold text-white">{selectedNode?.topic.icon} {selectedNode?.topic.title}</p>
                <p className="mt-2 text-sm text-slate-300">{selectedNode?.topic.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className={clsx("rounded-full border px-3 py-1", selectedNode ? statusMeta[selectedNode.status].chipClass : "border-white/10 bg-white/5") }>
                    {selectedNode ? `${statusMeta[selectedNode.status].icon} ${statusMeta[selectedNode.status].label}` : "Choose a topic"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {selectedNode?.completionPercentage ?? 0}% complete
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={selectedNode ? `/topics/${selectedNode.topic.slug}` : "/topics"}
                    className="inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Continue learning
                  </Link>
                  <Link
                    href="/learning-path"
                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:text-cyan-100"
                  >
                    Open full roadmap
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
