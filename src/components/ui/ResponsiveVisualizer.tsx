"use client";

import { motion } from "framer-motion";

interface ResponsiveVisualizerProps {
  visualizer: React.ReactNode;
  explanation: React.ReactNode;
  title?: string;
  hint?: string;
  className?: string;
  visualizerClassName?: string;
  explanationClassName?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function ResponsiveVisualizer({
  visualizer,
  explanation,
  title = "Interactive visualizer",
  hint = "Pinch to zoom or drag to explore the visualization.",
  className = "",
  visualizerClassName = "",
  explanationClassName = "",
}: ResponsiveVisualizerProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-6 ${className}`}
    >
      <motion.div
        variants={fadeUp}
        className={`order-1 min-w-0 rounded-3xl border border-white/10 bg-gray-900/70 p-3 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-4 ${visualizerClassName}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300/80">Responsive view</p>
            <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">{title}</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 lg:hidden"
          >
            🤏 {hint}
          </motion.div>
        </div>

        <div
          className="overflow-x-auto overscroll-x-contain rounded-2xl border border-white/5 bg-gray-950/50 p-2 sm:p-3"
          style={{ touchAction: "pan-x pan-y pinch-zoom" }}
        >
          <div className="min-w-[280px]">{visualizer}</div>
        </div>
      </motion.div>

      <motion.aside
        variants={fadeUp}
        transition={{ delay: 0.08 }}
        className={`order-2 rounded-3xl border border-white/10 bg-gray-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6 ${explanationClassName}`}
      >
        <div className="hidden rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 lg:inline-flex">
          {hint}
        </div>
        <div className="mt-4 text-sm leading-7 text-gray-300 sm:text-base">{explanation}</div>
      </motion.aside>
    </motion.section>
  );
}

export default ResponsiveVisualizer;
