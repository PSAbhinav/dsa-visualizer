"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface PulseButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

interface FloatingIconProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  showCursor?: boolean;
}

interface CountUpProps {
  to: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function PulseButton({ children, className = "", onClick, type = "button", disabled }: PulseButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-3 text-white shadow-lg shadow-purple-950/20 transition-colors ${className}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-purple-500/25 via-fuchsia-500/20 to-cyan-400/15"
        animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export function GlowCard({ children, className = "" }: GlowCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gray-950/60 ${className}`}
    >
      <motion.div
        variants={{
          rest: { opacity: 0.18, scale: 0.96 },
          hover: { opacity: 0.92, scale: 1.04 },
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-r from-purple-500/0 via-fuchsia-500/70 to-cyan-400/0 blur-md"
      />
      <div className="absolute inset-px rounded-[inherit] border border-white/10 bg-gray-950/80" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function FloatingIcon({ children, className = "", amplitude = 12, duration = 3.2 }: FloatingIconProps) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TypewriterText({
  text,
  className = "",
  speed = 35,
  startDelay = 0,
  showCursor = true,
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    setVisibleText("");

    let index = 0;
    let intervalId = 0;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setVisibleText(text.slice(0, index));

        if (index >= text.length) {
          window.clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [speed, startDelay, text]);

  return (
    <span className={className}>
      {visibleText}
      {showCursor && (
        <motion.span
          aria-hidden
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="ml-0.5 inline-block text-purple-300"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

export function CountUp({
  to,
  className = "",
  duration = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals]
  );

  useEffect(() => {
    if (!inView) {
      return;
    }

    let frame = 0;
    const start = performance.now();

    const update = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setValue(to * progress);

      if (progress < 1) {
        frame = window.requestAnimationFrame(update);
      }
    };

    frame = window.requestAnimationFrame(update);

    return () => window.cancelAnimationFrame(frame);
  }, [duration, inView, to]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter.format(value)}
      {suffix}
    </span>
  );
}

export function ShimmerText({ children, className = "" }: ShimmerTextProps) {
  return (
    <motion.span
      className={`inline-block bg-[linear-gradient(110deg,rgba(255,255,255,0.35),rgba(255,255,255,0.95),rgba(196,181,253,0.7),rgba(255,255,255,0.35))] bg-[length:220%_100%] bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ["200% center", "-200% center"] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
