"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Point = { id: number; x: number; y: number };
type HullStep = {
  hullIds: number[];
  considering: number[];
  removed: number[];
  currentEdge: [number, number] | null;
  message: string;
};

const WIDTH = 640;
const HEIGHT = 340;

function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function randomPoints() {
  return Array.from({ length: 14 }, (_, index) => ({
    id: index,
    x: 40 + Math.random() * (WIDTH - 80),
    y: 40 + Math.random() * (HEIGHT - 80),
  }));
}

function buildHullSteps(points: Point[]) {
  const sorted = [...points].sort((left, right) => left.x - right.x || left.y - right.y);
  const steps: HullStep[] = [{ hullIds: [], considering: [], removed: [], currentEdge: null, message: "Sort points by x-coordinate before scanning around the boundary." }];
  const lower: Point[] = [];
  const upper: Point[] = [];

  for (const point of sorted) {
    steps.push({
      hullIds: lower.map((item) => item.id),
      considering: [point.id],
      removed: [],
      currentEdge: lower.length ? [lower[lower.length - 1].id, point.id] : null,
      message: `Consider point (${Math.round(point.x)}, ${Math.round(point.y)}) for the lower hull.`,
    });

    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      const removed = lower.pop();
      steps.push({
        hullIds: lower.map((item) => item.id),
        considering: [point.id],
        removed: removed ? [removed.id] : [],
        currentEdge: lower.length ? [lower[lower.length - 1].id, point.id] : null,
        message: "Right turn detected, so the middle point is popped off the hull.",
      });
    }

    lower.push(point);
    steps.push({
      hullIds: lower.map((item) => item.id),
      considering: [point.id],
      removed: [],
      currentEdge: lower.length >= 2 ? [lower[lower.length - 2].id, lower[lower.length - 1].id] : null,
      message: "Add the point and continue wrapping the lower boundary.",
    });
  }

  for (const point of [...sorted].reverse()) {
    steps.push({
      hullIds: [...lower, ...upper].map((item) => item.id),
      considering: [point.id],
      removed: [],
      currentEdge: upper.length ? [upper[upper.length - 1].id, point.id] : null,
      message: `Switch to the upper hull and consider (${Math.round(point.x)}, ${Math.round(point.y)}).`,
    });

    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      const removed = upper.pop();
      steps.push({
        hullIds: [...lower, ...upper].map((item) => item.id),
        considering: [point.id],
        removed: removed ? [removed.id] : [],
        currentEdge: upper.length ? [upper[upper.length - 1].id, point.id] : null,
        message: "This candidate bends inward, so it cannot stay on the convex hull.",
      });
    }

    upper.push(point);
    steps.push({
      hullIds: [...lower, ...upper].map((item) => item.id),
      considering: [point.id],
      removed: [],
      currentEdge: upper.length >= 2 ? [upper[upper.length - 2].id, upper[upper.length - 1].id] : null,
      message: "Add the point to keep wrapping the outer envelope.",
    });
  }

  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const uniqueHull = hull.filter((point, index) => hull.findIndex((candidate) => candidate.id === point.id) === index);
  steps.push({
    hullIds: uniqueHull.map((point) => point.id),
    considering: [],
    removed: [],
    currentEdge: uniqueHull.length > 1 ? [uniqueHull[uniqueHull.length - 1].id, uniqueHull[0].id] : null,
    message: "The scan is complete: connect the outermost points to form the convex hull.",
  });

  return steps;
}

export function GeometryVisualizer() {
  const [points, setPoints] = useState<Point[]>(() => randomPoints());
  const [steps, setSteps] = useState<HullStep[]>(() => []);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(640);

  const generatePoints = useCallback(() => {
    setPoints(randomPoints());
    setSteps([]);
    setStepIndex(0);
    setIsRunning(false);
  }, []);

  const runHull = useCallback(() => {
    const nextSteps = buildHullSteps(points);
    setSteps(nextSteps);
    setStepIndex(0);
    setIsRunning(true);
  }, [points]);

  useEffect(() => {
    if (!isRunning || stepIndex >= steps.length - 1) {
      if (isRunning && stepIndex >= steps.length - 1) {
        setIsRunning(false);
      }
      return;
    }

    const timer = window.setTimeout(() => setStepIndex((current) => current + 1), speed);
    return () => window.clearTimeout(timer);
  }, [isRunning, speed, stepIndex, steps.length]);

  const currentStep = steps[stepIndex] ?? {
    hullIds: [],
    considering: [],
    removed: [],
    currentEdge: null,
    message: "Generate a point set, then run Graham scan / monotonic chain to wrap the convex hull.",
  };
  const pointMap = points.reduce<Record<number, Point>>((accumulator, point) => {
    accumulator[point.id] = point;
    return accumulator;
  }, {} as Record<number, Point>);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-white backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Computational Geometry / Convex Hull</h3>
          <p className="mt-1 text-sm text-gray-400">The hull wraps the outside of the point cloud while interior turns get discarded.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={generatePoints} disabled={isRunning} className="rounded-lg bg-gray-700 px-3 py-2 text-sm disabled:opacity-50">Generate Points</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={runHull} disabled={isRunning} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium disabled:opacity-50">{isRunning ? "Wrapping..." : "Run Convex Hull"}</motion.button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-gray-800/70 p-4">
        <p className="flex-1 text-sm text-gray-300">{currentStep.message}</p>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <span>Speed</span>
          <input type="range" min={200} max={1200} step={50} value={1400 - speed} onChange={(event) => setSpeed(1400 - Number(event.target.value))} className="w-40 accent-green-500" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-950/70 p-4">
        <div className="relative mx-auto h-[340px] max-w-[640px] rounded-2xl border border-white/5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]">
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {currentStep.hullIds.length >= 2 && (
              <polygon
                points={currentStep.hullIds.map((id) => `${pointMap[id].x},${pointMap[id].y}`).join(" ")}
                fill="rgba(16,185,129,0.12)"
                stroke="rgba(16,185,129,0.9)"
                strokeWidth="3"
              />
            )}
            {currentStep.currentEdge && (
              <line
                x1={pointMap[currentStep.currentEdge[0]].x}
                y1={pointMap[currentStep.currentEdge[0]].y}
                x2={pointMap[currentStep.currentEdge[1]].x}
                y2={pointMap[currentStep.currentEdge[1]].y}
                stroke="rgba(59,130,246,0.95)"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
            )}
          </svg>

          {points.map((point) => {
            const onHull = currentStep.hullIds.includes(point.id);
            const considering = currentStep.considering.includes(point.id);
            const removed = currentStep.removed.includes(point.id);
            return (
              <motion.div
                key={point.id}
                animate={{ scale: considering ? 1.25 : 1, opacity: removed ? 0.55 : 1 }}
                className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                  removed
                    ? "border-red-300 bg-red-500"
                    : considering
                    ? "border-blue-200 bg-blue-400"
                    : onHull
                    ? "border-emerald-200 bg-emerald-400"
                    : "border-purple-200 bg-purple-400"
                }`}
                style={{ left: point.x, top: point.y }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
