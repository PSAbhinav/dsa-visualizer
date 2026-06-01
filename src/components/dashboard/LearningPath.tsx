"use client";

import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { levels, type Level } from "@/data/topics";
import type { LearningPathEdge, LearningPathNode, LearningPathStatus } from "@/lib/recommendationEngine";

interface LearningPathProps {
  nodes: LearningPathNode[];
  edges: LearningPathEdge[];
  progressPercentage: number;
  preview?: boolean;
  levelFilter?: Level | "all";
}

type EdgeVisualState = "completed" | "active" | "locked" | "recommended";

type GraphPosition = {
  x: number;
  y: number;
  column: number;
  row: number;
};

type TransformViewportState = {
  scale: number;
  positionX: number;
  positionY: number;
};

const statusMeta: Record<
  LearningPathStatus,
  {
    label: string;
    icon: string;
    cardClass: string;
    badgeClass: string;
    progressClass: string;
    panelClass: string;
  }
> = {
  completed: {
    label: "Completed",
    icon: "✅",
    cardClass:
      "border-emerald-400/45 bg-[linear-gradient(180deg,rgba(6,78,59,0.92),rgba(2,6,23,0.92))] shadow-[0_22px_70px_-40px_rgba(52,211,153,0.95)]",
    badgeClass: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
    progressClass: "from-emerald-300 via-green-400 to-teal-400",
    panelClass: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
  },
  current: {
    label: "Active",
    icon: "🎯",
    cardClass:
      "border-cyan-300/55 bg-[linear-gradient(180deg,rgba(8,145,178,0.26),rgba(2,6,23,0.92))] shadow-[0_22px_70px_-38px_rgba(34,211,238,0.98)]",
    badgeClass: "border-cyan-300/45 bg-cyan-400/15 text-cyan-100",
    progressClass: "from-cyan-300 via-sky-400 to-violet-400",
    panelClass: "border-cyan-300/25 bg-cyan-500/10 text-cyan-100",
  },
  available: {
    label: "Unlocked",
    icon: "🔓",
    cardClass:
      "border-cyan-300/35 bg-[linear-gradient(180deg,rgba(14,116,144,0.16),rgba(2,6,23,0.92))] shadow-[0_20px_65px_-42px_rgba(34,211,238,0.7)]",
    badgeClass: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
    progressClass: "from-cyan-300 via-sky-400 to-blue-400",
    panelClass: "border-cyan-300/20 bg-cyan-500/10 text-cyan-100",
  },
  locked: {
    label: "Locked",
    icon: "🔒",
    cardClass:
      "border-slate-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] shadow-[0_18px_60px_-44px_rgba(15,23,42,1)]",
    badgeClass: "border-slate-700 bg-slate-900/90 text-slate-300",
    progressClass: "from-slate-500 to-slate-600",
    panelClass: "border-slate-700 bg-slate-900/80 text-slate-300",
  },
};

// Level-specific colors for clear visual differentiation - VIBRANT colors
const levelColors: Record<Level, { border: string; bg: string; text: string; accent: string; glow: string; card: string }> = {
  beginner: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    accent: "bg-emerald-400",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    card: "bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border-emerald-500/40",
  },
  intermediate: {
    border: "border-l-blue-400",
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    accent: "bg-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    card: "bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-blue-500/40",
  },
  advanced: {
    border: "border-l-purple-400",
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    accent: "bg-purple-400",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    card: "bg-gradient-to-br from-purple-900/40 to-purple-950/60 border-purple-500/40",
  },
  pro: {
    border: "border-l-orange-400",
    bg: "bg-orange-500/20",
    text: "text-orange-300",
    accent: "bg-orange-400",
    glow: "shadow-[0_0_20px_rgba(251,146,60,0.4)]",
    card: "bg-gradient-to-br from-orange-900/40 to-orange-950/60 border-orange-500/40",
  },
};

const levelIndexLookup = new Map(levels.map((level, index) => [level.id, index]));
const statusOrder: Record<LearningPathStatus, number> = {
  current: 0,
  available: 1,
  completed: 2,
  locked: 3,
};

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.POSITIVE_INFINITY;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

// Compute the recommended learning path - the optimal sequence of topics
function computeRecommendedPath(
  nodes: LearningPathNode[],
  edges: LearningPathEdge[],
  incoming: Map<string, string[]>,
  outgoing: Map<string, string[]>
): Set<string> {
  const recommendedEdges = new Set<string>();
  
  // Find the starting point - first incomplete topic by level and recommendation rank
  const sortedNodes = [...nodes].sort((a, b) => {
    // Prioritize by level first
    const levelDiff = (levelIndexLookup.get(a.topic.level) ?? 0) - (levelIndexLookup.get(b.topic.level) ?? 0);
    if (levelDiff !== 0) return levelDiff;
    
    // Then by status (current/available first)
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by recommendation rank
    return (a.recommendationRank ?? 99) - (b.recommendationRank ?? 99);
  });
  
  // Build the recommended path starting from completed topics through current/available
  const visited = new Set<string>();
  const pathNodes = new Set<string>();
  
  // Start with all completed nodes
  nodes.filter(n => n.status === "completed").forEach(n => {
    pathNodes.add(n.topic.slug);
    visited.add(n.topic.slug);
  });
  
  // Find current/available nodes and trace path to them
  const activeNodes = sortedNodes.filter(n => n.status === "current" || n.status === "available");
  
  // For each active node, add it and find the best path forward
  activeNodes.slice(0, 5).forEach(node => {
    pathNodes.add(node.topic.slug);
    
    // Add edges from completed prerequisites to this node
    const parents = incoming.get(node.topic.slug) ?? [];
    parents.forEach(parent => {
      const parentNode = nodes.find(n => n.topic.slug === parent);
      if (parentNode && parentNode.status === "completed") {
        recommendedEdges.add(`${parent}->${node.topic.slug}`);
      }
    });
    
    // Find the best next step from this node
    const children = outgoing.get(node.topic.slug) ?? [];
    const nextBest = children
      .map(slug => nodes.find(n => n.topic.slug === slug))
      .filter((n): n is LearningPathNode => !!n && n.status !== "completed")
      .sort((a, b) => {
        const levelDiff = (levelIndexLookup.get(a.topic.level) ?? 0) - (levelIndexLookup.get(b.topic.level) ?? 0);
        if (levelDiff !== 0) return levelDiff;
        return (a.recommendationRank ?? 99) - (b.recommendationRank ?? 99);
      })[0];
    
    if (nextBest) {
      recommendedEdges.add(`${node.topic.slug}->${nextBest.topic.slug}`);
    }
  });
  
  // Also highlight edges between completed nodes to show progress
  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.topic.slug === edge.from);
    const toNode = nodes.find(n => n.topic.slug === edge.to);
    
    if (fromNode?.status === "completed" && toNode?.status === "completed") {
      // Check if this is on the main path (lowest level progression)
      const fromLevel = levelIndexLookup.get(fromNode.topic.level) ?? 0;
      const toLevel = levelIndexLookup.get(toNode.topic.level) ?? 0;
      if (toLevel >= fromLevel) {
        recommendedEdges.add(`${edge.from}->${edge.to}`);
      }
    }
  });
  
  return recommendedEdges;
}

export default function LearningPath({
  nodes,
  edges,
  progressPercentage,
  preview = false,
  levelFilter = "all",
}: LearningPathProps) {
  const prioritySlug = useMemo(() => getPrioritySlug(nodes), [nodes]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  // Lower initial scale to show more of the roadmap at once
  const initialScale = preview ? 0.38 : 0.45;
  const [transformState, setTransformState] = useState<TransformViewportState>({
    scale: initialScale,
    positionX: 0,
    positionY: 0,
  });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.topic.slug, node])), [nodes]);
  const currentLevel = useMemo(() => getCurrentLevel(nodes), [nodes]);
  const statusCounts = useMemo(
    () => ({
      completed: nodes.filter((node) => node.status === "completed").length,
      unlocked: nodes.filter((node) => node.status === "current" || node.status === "available").length,
    }),
    [nodes],
  );

  useEffect(() => {
    const target = viewportRef.current;

    if (!target) {
      return undefined;
    }

    const updateSize = () => setViewportSize({ width: target.clientWidth, height: target.clientHeight });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const dependencyMaps = useMemo(() => {
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    edges.forEach((edge) => {
      incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge.from]);
      outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
    });

    return { incoming, outgoing };
  }, [edges]);

  const resolvedSelectedSlug = selectedSlug && nodeMap.has(selectedSlug) ? selectedSlug : prioritySlug;
  const selectedNode = (resolvedSelectedSlug ? nodeMap.get(resolvedSelectedSlug) : null) ?? nodes[0] ?? null;

  // Compute recommended path for highlighting
  const recommendedPath = useMemo(
    () => computeRecommendedPath(nodes, edges, dependencyMaps.incoming, dependencyMaps.outgoing),
    [nodes, edges, dependencyMaps.incoming, dependencyMaps.outgoing]
  );

  const selectedDependents = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    return (dependencyMaps.outgoing.get(selectedNode.topic.slug) ?? [])
      .map((slug) => nodeMap.get(slug))
      .filter((node): node is LearningPathNode => Boolean(node));
  }, [dependencyMaps.outgoing, nodeMap, selectedNode]);

  const layout = useMemo(() => {
    const positions = new Map<string, GraphPosition>();

    if (nodes.length === 0) {
      return {
        width: 0,
        height: 0,
        cardWidth: preview ? 240 : 280,
        cardHeight: preview ? 140 : 160,
        positions,
        levelBands: [] as Array<{ level: Level; x: number; width: number }>,
        paths: [] as Array<LearningPathEdge & { path: string; visualState: EdgeVisualState; edgeKey: string }>,
      };
    }

    // Larger cards with more info
    const cardWidth = preview ? 240 : 280;
    const cardHeight = preview ? 140 : 160;
    const columnGap = preview ? 100 : 130;
    const rowGap = preview ? 36 : 44;
    const paddingLeft = preview ? 40 : 80;
    const paddingRight = preview ? 40 : 100;
    const paddingTop = preview ? 100 : 140;
    const paddingBottom = preview ? 60 : 80;

    const depthMemo = new Map<string, number>();
    const getDepth = (slug: string): number => {
      if (depthMemo.has(slug)) {
        return depthMemo.get(slug) ?? 0;
      }

      const parents = dependencyMaps.incoming.get(slug) ?? [];
      const depth = parents.length === 0 ? 0 : Math.max(...parents.map((parent) => getDepth(parent))) + 1;
      depthMemo.set(slug, depth);
      return depth;
    };

    nodes.forEach((node) => getDepth(node.topic.slug));

    const maxDepth = Math.max(...depthMemo.values());
    const columnGroups = Array.from({ length: maxDepth + 1 }, () => [] as LearningPathNode[]);
    nodes.forEach((node) => {
      columnGroups[depthMemo.get(node.topic.slug) ?? 0].push(node);
    });

    const rowIndexMap = new Map<string, number>();
    const orderedColumns = columnGroups.map((columnNodes) => {
      const sorted = [...columnNodes].sort((left, right) => {
        const leftParentRows = (dependencyMaps.incoming.get(left.topic.slug) ?? [])
          .map((slug) => rowIndexMap.get(slug))
          .filter((value): value is number => typeof value === "number");
        const rightParentRows = (dependencyMaps.incoming.get(right.topic.slug) ?? [])
          .map((slug) => rowIndexMap.get(slug))
          .filter((value): value is number => typeof value === "number");

        const laneDifference = average(leftParentRows) - average(rightParentRows);
        if (Number.isFinite(laneDifference) && laneDifference !== 0) {
          return laneDifference;
        }

        const levelDifference =
          (levelIndexLookup.get(left.topic.level) ?? 0) - (levelIndexLookup.get(right.topic.level) ?? 0);
        if (levelDifference !== 0) {
          return levelDifference;
        }

        const statusDifference = statusOrder[left.status] - statusOrder[right.status];
        if (statusDifference !== 0) {
          return statusDifference;
        }

        const recommendationDifference = (left.recommendationRank ?? 99) - (right.recommendationRank ?? 99);
        if (recommendationDifference !== 0) {
          return recommendationDifference;
        }

        return left.topic.title.localeCompare(right.topic.title);
      });

      sorted.forEach((node, index) => rowIndexMap.set(node.topic.slug, index));
      return sorted;
    });

    const maxRows = Math.max(...orderedColumns.map((column) => column.length), 1);
    const boardHeight = maxRows * cardHeight + Math.max(0, maxRows - 1) * rowGap;

    orderedColumns.forEach((columnNodes, columnIndex) => {
      const columnHeight = columnNodes.length * cardHeight + Math.max(0, columnNodes.length - 1) * rowGap;
      const startY = paddingTop + Math.max(0, (boardHeight - columnHeight) / 2);
      const columnX = paddingLeft + columnIndex * (cardWidth + columnGap);

      columnNodes.forEach((node, rowIndex) => {
        positions.set(node.topic.slug, {
          x: columnX,
          y: startY + rowIndex * (cardHeight + rowGap),
          column: columnIndex,
          row: rowIndex,
        });
      });
    });

    const levelBands = levels.flatMap((level) => {
      const levelNodes = nodes
        .filter((node) => node.topic.level === level.id)
        .map((node) => positions.get(node.topic.slug))
        .filter((position): position is GraphPosition => Boolean(position));

      if (levelNodes.length === 0) {
        return [];
      }

      const minX = Math.min(...levelNodes.map((position) => position.x));
      const maxX = Math.max(...levelNodes.map((position) => position.x));

      return [
        {
          level: level.id,
          x: minX - 12,
          width: maxX - minX + cardWidth + 24,
        },
      ];
    });

    const paths = edges.flatMap((edge) => {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      const targetNode = nodeMap.get(edge.to);

      if (!from || !to || !targetNode) {
        return [];
      }

      const baseVisualState: EdgeVisualState = !edge.satisfied
        ? "locked"
        : targetNode.status === "completed"
          ? "completed"
          : "active";

      const startX = from.x + cardWidth;
      const startY = from.y + cardHeight / 2;
      const endX = to.x;
      const endY = to.y + cardHeight / 2;
      const curveStrength = Math.max(64, (endX - startX) * 0.38);
      const path = `M ${startX} ${startY} C ${startX + curveStrength} ${startY}, ${endX - curveStrength} ${endY}, ${endX} ${endY}`;

      return [{ ...edge, path, visualState: baseVisualState, edgeKey: `${edge.from}->${edge.to}` }];
    });

    const width = paddingLeft + paddingRight + orderedColumns.length * cardWidth + Math.max(0, orderedColumns.length - 1) * columnGap;
    const height = paddingTop + paddingBottom + boardHeight;

    return {
      width,
      height,
      cardWidth,
      cardHeight,
      positions,
      levelBands,
      paths,
    };
  }, [dependencyMaps.incoming, edges, nodeMap, nodes, preview]);

  const minimapMetrics = useMemo(() => {
    if (preview || layout.width === 0 || layout.height === 0 || viewportSize.width === 0 || viewportSize.height === 0) {
      return null;
    }

    const scale = Math.min(180 / layout.width, 118 / layout.height);
    const visibleWidth = viewportSize.width / transformState.scale;
    const visibleHeight = viewportSize.height / transformState.scale;
    const maxViewportX = Math.max(layout.width - visibleWidth, 0);
    const maxViewportY = Math.max(layout.height - visibleHeight, 0);

    return {
      scale,
      width: layout.width * scale,
      height: layout.height * scale,
      viewportX: clamp(-transformState.positionX / transformState.scale, 0, maxViewportX) * scale,
      viewportY: clamp(-transformState.positionY / transformState.scale, 0, maxViewportY) * scale,
      viewportWidth: Math.min(visibleWidth, layout.width) * scale,
      viewportHeight: Math.min(visibleHeight, layout.height) * scale,
    };
  }, [layout.height, layout.width, preview, transformState.positionX, transformState.positionY, transformState.scale, viewportSize.height, viewportSize.width]);

  const filterTitle = levelFilter === "all" ? "All levels" : levels.find((level) => level.id === levelFilter)?.title ?? "Focused";

  if (nodes.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 text-white shadow-[0_24px_90px_-52px_rgba(34,211,238,0.45)]">
        <h2 className="text-2xl font-semibold">Roadmap unavailable</h2>
        <p className="mt-3 text-sm text-slate-300">We could not build the learning path for this filter yet.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 text-white shadow-[0_30px_120px_-52px_rgba(34,211,238,0.42)] backdrop-blur-2xl sm:p-6 lg:p-7">
      <div className={clsx("grid gap-6", preview ? "" : "xl:grid-cols-[minmax(0,1fr)_360px]")}>
        <div className="space-y-4 overflow-hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-300">Interactive roadmap</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {preview ? "Pan through your roadmap" : "Explore the dependency map like a modern board"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Scroll to zoom, drag to pan, pinch on touch devices, and click any topic to inspect it without leaving the map.
              </p>
            </div>

            {!preview ? (
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: "Completed", className: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" },
                  { label: "Unlocked", className: "border-cyan-300/35 bg-cyan-400/10 text-cyan-100" },
                  { label: "Locked", className: "border-slate-700 bg-slate-900/80 text-slate-300" },
                ].map((item) => (
                  <span key={item.label} className={clsx("rounded-full border px-3 py-1.5 font-semibold uppercase tracking-[0.18em]", item.className)}>
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <TransformWrapper
            initialScale={initialScale}
            minScale={preview ? 0.25 : 0.3}
            maxScale={preview ? 2.5 : 3.0}
            centerOnInit
            limitToBounds={false}
            doubleClick={{ disabled: true }}
            wheel={{ step: 0.08 }}
            pinch={{ step: 5 }}
            panning={{ velocityDisabled: true }}
            onTransform={(_ref, state) =>
              setTransformState({
                scale: state.scale,
                positionX: state.positionX,
                positionY: state.positionY,
              })
            }
          >
            {({ centerView, resetTransform, zoomIn, zoomOut, zoomToElement }) => (
              <>
                <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 uppercase tracking-[0.18em] text-slate-200">
                      {filterTitle}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      Track: {levels.find((level) => level.id === currentLevel)?.title ?? "All"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {statusCounts.completed} completed
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {statusCounts.unlocked} ready now
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {progressPercentage}% overall
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!preview && selectedNode ? (
                      <button
                        type="button"
                        onClick={() => zoomToElement(`#roadmap-node-${selectedNode.topic.slug}`, 1.02, 320, "easeOut")}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                      >
                        Focus topic
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => zoomOut(0.25)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/30"
                      title="Zoom out"
                    >
                      −
                    </button>
                    <div className="min-w-[72px] rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      {Math.round(transformState.scale * 100)}%
                    </div>
                    <button
                      type="button"
                      onClick={() => zoomIn(0.25)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/30"
                      title="Zoom in"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTransform()}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                      title={`Reset to ${Math.round(initialScale * 100)}%`}
                    >
                      Fit All
                    </button>
                    <button
                      type="button"
                      onClick={() => centerView(undefined, 260)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      Center
                    </button>
                  </div>
                </div>

                <div
                  ref={viewportRef}
                  className={clsx(
                    "relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/80",
                    preview ? "h-[440px]" : "h-[660px]",
                  )}
                >
                  {/* Fixed level legend - shows which colors mean which level */}
                  <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-end gap-2 p-3">
                    {levels
                      .filter((level) => levelFilter === "all" || level.id === levelFilter)
                      .map((level) => {
                        const colors = levelColors[level.id];
                        return (
                          <div
                            key={level.id}
                            className={clsx(
                              "flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xl",
                              colors.bg,
                              colors.text,
                              level.id === "beginner" && "border-emerald-400/60",
                              level.id === "intermediate" && "border-blue-400/60",
                              level.id === "advanced" && "border-purple-400/60",
                              level.id === "pro" && "border-orange-400/60",
                            )}
                          >
                            <div className={clsx("h-3 w-3 rounded-full", colors.accent)} />
                            <span>{level.icon}</span>
                            <span>{level.title}</span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.12),transparent_22%)]" />

                  <TransformComponent wrapperClass="!h-full !w-full !cursor-grab active:!cursor-grabbing !pt-12" contentClass="!w-fit !h-fit">
                    <div className="relative" style={{ width: layout.width, height: layout.height }}>
                      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={layout.width} height={layout.height}>
                        {/* SVG Definitions for gradients and filters */}
                        <defs>
                          <linearGradient id="recommendedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
                            <stop offset="50%" stopColor="rgba(56,189,248,1)" />
                            <stop offset="100%" stopColor="rgba(34,211,238,0.9)" />
                          </linearGradient>
                          <filter id="recommendedGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Render non-recommended paths first (below) */}
                        {layout.paths.filter(p => !recommendedPath.has(p.edgeKey)).map((pathItem) => {
                          const edgeStyle =
                            pathItem.visualState === "completed"
                              ? {
                                  stroke: "rgba(52,211,153,0.5)",
                                  glow: "rgba(52,211,153,0.1)",
                                  strokeWidth: 2,
                                  dashArray: undefined,
                                }
                              : pathItem.visualState === "active"
                                ? {
                                    stroke: "rgba(148,163,184,0.4)",
                                    glow: "rgba(148,163,184,0.08)",
                                    strokeWidth: 1.8,
                                    dashArray: "6 6",
                                  }
                                : {
                                    stroke: "rgba(148,163,184,0.2)",
                                    glow: "rgba(148,163,184,0.03)",
                                    strokeWidth: 1.5,
                                    dashArray: "3 8",
                                  };

                          return (
                            <g key={`${pathItem.from}-${pathItem.to}`}>
                              <path d={pathItem.path} fill="none" stroke={edgeStyle.glow} strokeWidth={edgeStyle.strokeWidth + 3} strokeLinecap="round" />
                              <path
                                d={pathItem.path}
                                fill="none"
                                stroke={edgeStyle.stroke}
                                strokeWidth={edgeStyle.strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={edgeStyle.dashArray}
                              />
                            </g>
                          );
                        })}
                        
                        {/* Render recommended path on top with subtle cyan highlight */}
                        {layout.paths.filter(p => recommendedPath.has(p.edgeKey)).map((pathItem) => {
                          return (
                            <g key={`recommended-${pathItem.from}-${pathItem.to}`}>
                              {/* Soft outer glow */}
                              <path 
                                d={pathItem.path} 
                                fill="none" 
                                stroke="rgba(34,211,238,0.15)" 
                                strokeWidth={12} 
                                strokeLinecap="round"
                              />
                              {/* Inner glow */}
                              <path 
                                d={pathItem.path} 
                                fill="none" 
                                stroke="rgba(34,211,238,0.3)" 
                                strokeWidth={6} 
                                strokeLinecap="round"
                              />
                              {/* Main path with gradient */}
                              <motion.path
                                d={pathItem.path}
                                fill="none"
                                stroke="url(#recommendedGradient)"
                                strokeWidth={3}
                                strokeLinecap="round"
                                filter="url(#recommendedGlow)"
                              />
                              {/* Single subtle animated dot */}
                              <circle
                                r={4}
                                fill="rgba(34,211,238,0.9)"
                              >
                                <animateMotion
                                  dur="3s"
                                  repeatCount="indefinite"
                                  path={pathItem.path}
                                />
                              </circle>
                            </g>
                          );
                        })}
                      </svg>

                      {nodes.map((node, index) => {
                        const position = layout.positions.get(node.topic.slug);
                        if (!position) {
                          return null;
                        }

                        const isSelected = selectedNode?.topic.slug === node.topic.slug;
                        const meta = statusMeta[node.status];
                        const level = levels.find((item) => item.id === node.topic.level);
                        const levelStyle = levelColors[node.topic.level];

                        return (
                          <motion.button
                            key={node.topic.slug}
                            id={`roadmap-node-${node.topic.slug}`}
                            type="button"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, delay: index * 0.015 }}
                            whileHover={node.status === "locked" ? undefined : { scale: 1.03, y: -2 }}
                            onClick={() => setSelectedSlug(node.topic.slug)}
                            className={clsx(
                              "absolute overflow-hidden rounded-[1.45rem] border-l-4 border p-3 text-left transition duration-200",
                              levelStyle.card,
                              levelStyle.border,
                              levelStyle.glow,
                              isSelected && "ring-2 ring-cyan-300/70 ring-offset-2 ring-offset-slate-950",
                              node.status === "locked" ? "opacity-50 saturate-[0.2]" : "opacity-100",
                              node.status === "completed" && "border-emerald-400/50",
                            )}
                            style={{
                              left: position.x,
                              top: position.y,
                              width: layout.cardWidth,
                              height: layout.cardHeight,
                            }}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)] opacity-60" />
                            {/* Level color accent at top - thicker */}
                            <div className={clsx("absolute left-0 right-0 top-0 h-2 rounded-t-lg", levelStyle.accent, node.status === "locked" ? "opacity-30" : "opacity-90")} />
                            <div className="relative flex h-full flex-col justify-between p-0.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2.5">
                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-lg shadow-inner shadow-black/30">
                                      {node.topic.icon}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      {/* Level badge with color */}
                                      <span className={clsx("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", levelStyle.bg, levelStyle.text)}>
                                        {level?.icon} {level?.title}
                                      </span>
                                      <h3 className="truncate text-sm font-bold text-white">{node.topic.title}</h3>
                                    </div>
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">{node.topic.shortDescription}</p>
                                </div>
                                <span className={clsx("shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold", meta.badgeClass)}>
                                  {meta.icon}
                                </span>
                              </div>

                              <div className="mt-auto space-y-2">
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className={clsx("rounded-md border px-2 py-0.5 font-semibold", meta.badgeClass)}>
                                    {meta.label}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 font-medium text-slate-300">
                                      {node.topic.problems.length} problems
                                    </span>
                                    <span className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 font-semibold text-slate-200">
                                      Quiz: {typeof node.quizScore === "number" ? `${node.quizScore}%` : "—"}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="font-medium">Progress</span>
                                    <span className="font-semibold text-white">{node.completionPercentage}%</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                    <div
                                      className={clsx("h-full rounded-full bg-gradient-to-r", meta.progressClass)}
                                      style={{ width: `${node.completionPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </TransformComponent>

                  {!preview && minimapMetrics ? (
                    <div className="absolute bottom-4 right-4 hidden rounded-[1.2rem] border border-white/10 bg-slate-950/90 p-3 shadow-[0_20px_60px_-36px_rgba(34,211,238,0.55)] backdrop-blur-xl xl:block">
                      <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <span>Minimap</span>
                        <span>{filterTitle}</span>
                      </div>
                      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80" style={{ width: minimapMetrics.width, height: minimapMetrics.height }}>
                        <svg className="absolute inset-0" width={minimapMetrics.width} height={minimapMetrics.height}>
                          {/* Non-recommended paths */}
                          {layout.paths.filter(p => !recommendedPath.has(p.edgeKey)).map((pathItem) => (
                            <path
                              key={`mini-${pathItem.from}-${pathItem.to}`}
                              d={pathItem.path}
                              fill="none"
                              stroke={pathItem.visualState === "completed" ? "rgba(52,211,153,0.5)" : pathItem.visualState === "active" ? "rgba(34,211,238,0.5)" : "rgba(148,163,184,0.2)"}
                              strokeWidth={0.8}
                              transform={`scale(${minimapMetrics.scale})`}
                            />
                          ))}
                          {/* Recommended paths highlighted */}
                          {layout.paths.filter(p => recommendedPath.has(p.edgeKey)).map((pathItem) => (
                            <path
                              key={`mini-recommended-${pathItem.from}-${pathItem.to}`}
                              d={pathItem.path}
                              fill="none"
                              stroke="rgba(34,211,238,0.9)"
                              strokeWidth={2}
                              transform={`scale(${minimapMetrics.scale})`}
                            />
                          ))}
                        </svg>
                        {nodes.map((node) => {
                          const position = layout.positions.get(node.topic.slug);
                          if (!position) {
                            return null;
                          }

                          // Use level-based colors for minimap nodes - more vibrant
                          const levelColorMap: Record<Level, string> = {
                            beginner: "bg-emerald-400",
                            intermediate: "bg-blue-400",
                            advanced: "bg-purple-400",
                            pro: "bg-orange-400",
                          };

                          return (
                            <div
                              key={`mini-node-${node.topic.slug}`}
                              className={clsx(
                                "absolute rounded-sm",
                                levelColorMap[node.topic.level],
                              )}
                              style={{
                                left: position.x * minimapMetrics.scale,
                                top: position.y * minimapMetrics.scale,
                                width: Math.max(layout.cardWidth * minimapMetrics.scale, 5),
                                height: Math.max(layout.cardHeight * minimapMetrics.scale, 5),
                                opacity: node.status === "locked" ? 0.3 : node.status === "completed" ? 1 : 0.85,
                              }}
                            />
                          );
                        })}
                        <div
                          className="absolute rounded-lg border border-cyan-300/60 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]"
                          style={{
                            left: minimapMetrics.viewportX,
                            top: minimapMetrics.viewportY,
                            width: minimapMetrics.viewportWidth,
                            height: minimapMetrics.viewportHeight,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Recommended path legend */}
                  <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-xl">
                      <div className="relative h-2.5 w-5">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 opacity-90" />
                        <div className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 animate-pulse rounded-full bg-white" />
                      </div>
                      <span className="text-cyan-300">Recommended</span>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 backdrop-blur-xl">
                      Scroll · drag · pinch
                    </div>
                  </div>
                </div>

                {preview && selectedNode ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Topic in focus</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {selectedNode.topic.icon} {selectedNode.topic.title}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm text-slate-300">{selectedNode.topic.shortDescription}</p>
                      </div>
                      <Link
                        href={`/topics/${selectedNode.topic.slug}`}
                        className="inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                      >
                        Start learning
                      </Link>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </TransformWrapper>
        </div>

        {!preview && selectedNode ? (
          <aside className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-5 shadow-[0_24px_80px_-48px_rgba(34,211,238,0.45)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">Topic details</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedNode.topic.icon} {selectedNode.topic.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {levels.find((level) => level.id === selectedNode.topic.level)?.icon} {levels.find((level) => level.id === selectedNode.topic.level)?.title}
                </p>
              </div>
              <span className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]", statusMeta[selectedNode.status].panelClass)}>
                {statusMeta[selectedNode.status].icon} {statusMeta[selectedNode.status].label}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">{selectedNode.topic.detailedExplanation}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-white">{selectedNode.completionPercentage}%</p>
                <p className="mt-1 text-xs text-slate-400">Completion across lessons and practice</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quiz status</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {typeof selectedNode.quizScore === "number" ? `${selectedNode.quizScore}%` : "Pending"}
                </p>
                <p className="mt-1 text-xs text-slate-400">Latest checkpoint score</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mastery</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {typeof selectedNode.masteryScore === "number" ? `${selectedNode.masteryScore}%` : "--"}
                </p>
                <p className="mt-1 text-xs text-slate-400">Confidence from recent attempts</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Practice pack</p>
                <p className="mt-2 text-2xl font-semibold text-white">{selectedNode.topic.problems.length}</p>
                <p className="mt-1 text-xs text-slate-400">Problems · {selectedNode.topic.algorithms.length} core algorithms</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">Prerequisites</h4>
                  <span className="text-xs text-slate-400">{selectedNode.prerequisiteStatus.length}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {selectedNode.prerequisiteStatus.length > 0 ? (
                    selectedNode.prerequisiteStatus.map((prerequisite) => (
                      <div
                        key={prerequisite.slug}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                      >
                        <span className="truncate">{prerequisite.title}</span>
                        <span className={clsx(
                          "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          prerequisite.completed ? "bg-emerald-400/15 text-emerald-100" : "bg-slate-800 text-slate-300",
                        )}>
                          {prerequisite.completed ? "Done" : "Needed"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-300">
                      No prerequisites. You can jump into this topic right away.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">Unlocks next</h4>
                  <span className="text-xs text-slate-400">{selectedDependents.length}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {selectedDependents.length > 0 ? (
                    selectedDependents.map((dependent) => (
                      <button
                        key={dependent.topic.slug}
                        type="button"
                        onClick={() => setSelectedSlug(dependent.topic.slug)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                      >
                        <span className="truncate">{dependent.topic.title}</span>
                        <span className={clsx("rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", statusMeta[dependent.status].badgeClass)}>
                          {statusMeta[dependent.status].label}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-300">
                      This topic is currently a leaf node in the roadmap.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Why it matters</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedNode.topic.realWorldAnalogy}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/topics/${selectedNode.topic.slug}`}
                className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-200 hover:to-violet-300"
              >
                Start learning
              </Link>
              <Link
                href="/topics"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:text-cyan-100"
              >
                Browse all topics
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
