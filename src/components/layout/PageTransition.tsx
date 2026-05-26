"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { AnimatedGrid, GradientOrb } from "@/components/ui/AnimatedComponents";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsTransitioning(true);
    setProgress(14);

    const timers = [
      window.setTimeout(() => setProgress(46), 80),
      window.setTimeout(() => setProgress(72), 180),
      window.setTimeout(() => setProgress(92), 320),
      window.setTimeout(() => setProgress(100), 480),
      window.setTimeout(() => setIsTransitioning(false), 640),
      window.setTimeout(() => setProgress(0), 700),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return (
    <div className="relative min-h-full">
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="route-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-white/5 backdrop-blur"
          >
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-full will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function BackgroundGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_38%)]" />
      <GradientOrb className="-left-28 top-0" size={460} duration={24} />
      <GradientOrb
        className="bottom-[-8rem] right-[-6rem]"
        size={520}
        duration={30}
        colors={["rgba(244,114,182,0.22)", "rgba(168,85,247,0.14)", "rgba(34,211,238,0.08)"]}
      />
      <GradientOrb
        className="left-1/2 top-1/3"
        size={320}
        duration={18}
        colors={["rgba(96,165,250,0.16)", "rgba(168,85,247,0.1)", "rgba(2,6,23,0)"]}
      />
      <AnimatedGrid />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(3,7,18,0.72)_80%,rgba(3,7,18,0.95)_100%)]" />
    </div>
  );
}
