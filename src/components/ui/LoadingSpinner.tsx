"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

interface SkeletonProps {
  className?: string;
}

const spinnerSizes = {
  sm: "h-10 w-10 text-base",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
};

export function LoadingSpinner({
  label = "Loading visualizer...",
  size = "md",
  className = "",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 font-bold text-white shadow-lg shadow-purple-500/30 ${spinnerSizes[size]}`}
      >
        D
      </motion.div>
      <motion.p
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm text-gray-400"
      >
        {label}
      </motion.p>
    </motion.div>
  );

  if (fullScreen) {
    return <div className="flex min-h-[40vh] items-center justify-center">{spinner}</div>;
  }

  return spinner;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/70 p-5 shadow-lg shadow-black/20 ${className}`}
    >
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-100%", "220%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/8" />
          <div className="h-6 w-20 rounded-full bg-white/8" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-2/3 rounded-full bg-white/8" />
          <div className="h-4 w-full rounded-full bg-white/8" />
          <div className="h-4 w-5/6 rounded-full bg-white/8" />
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          <div className="h-4 w-24 rounded-full bg-white/8" />
          <div className="h-4 w-28 rounded-full bg-white/8" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export default LoadingSpinner;
