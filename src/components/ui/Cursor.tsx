"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, summary, label, [data-cursor='interactive']";

export function Cursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const x = useMotionValue(-120);
  const y = useMotionValue(-120);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateDeviceState = () => setIsDesktop(mediaQuery.matches);

    updateDeviceState();
    mediaQuery.addEventListener?.("change", updateDeviceState);

    return () => {
      mediaQuery.removeEventListener?.("change", updateDeviceState);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setIsVisible(false);
      setIsInteractive(false);
      return;
    }

    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setIsVisible(true);
    };

    const handleLeave = () => setIsVisible(false);
    const handleWindowOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        setIsVisible(false);
      }
    };

    const handlePointerState = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        setIsInteractive(false);
        return;
      }

      setIsInteractive(Boolean(target.closest(INTERACTIVE_SELECTOR)));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleWindowOut);
    window.addEventListener("blur", handleLeave);
    document.addEventListener("mouseover", handlePointerState);
    document.addEventListener("focusin", handlePointerState);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleWindowOut);
      window.removeEventListener("blur", handleLeave);
      document.removeEventListener("mouseover", handlePointerState);
      document.removeEventListener("focusin", handlePointerState);
    };
  }, [isDesktop, x, y]);

  if (!isDesktop) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-screen"
      style={{ x: springX, y: springY, opacity: isVisible ? 1 : 0 }}
    >
      <motion.div
        className="absolute -left-1/2 -top-1/2 rounded-full border border-white/10 blur-2xl"
        style={{
          background: isInteractive
            ? "radial-gradient(circle, rgba(244,114,182,0.24), rgba(168,85,247,0.18), rgba(56,189,248,0.08))"
            : "radial-gradient(circle, rgba(168,85,247,0.2), rgba(59,130,246,0.12), rgba(15,23,42,0.02))",
        }}
        animate={{
          width: isInteractive ? 96 : 64,
          height: isInteractive ? 96 : 64,
          scale: isVisible ? 1 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      />
      <motion.div
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-white/80"
        animate={{ scale: isInteractive ? 1.6 : 1, opacity: isVisible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </motion.div>
  );
}
