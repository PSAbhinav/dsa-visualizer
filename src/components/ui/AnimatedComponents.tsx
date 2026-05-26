"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export { StaggerContainer, StaggerItem } from "./ScrollAnimations";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

interface GradientOrbProps {
  className?: string;
  size?: number;
  duration?: number;
  colors?: [string, string, string];
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: FadeDirection;
}

interface GlowingBorderProps {
  children: ReactNode;
  className?: string;
}

interface AnimatedGridProps {
  className?: string;
}

interface PulsingDotProps {
  color?: string;
}

type FadeDirection = "up" | "down" | "left" | "right";

type Particle = {
  left: string;
  top: string;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  opacity: number;
};

export function AnimatedCard({ children, className = "", delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -6,
              transition: { duration: 0.2, ease: "easeOut" },
            }
          : undefined
      }
      whileTap={hover ? { scale: 0.985 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInProps) {
  const directionMap: Record<FadeDirection, { x?: number; y?: number }> = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GlowingBorder({ children, className = "" }: GlowingBorderProps) {
  return (
    <div className={`group relative ${className}`}>
      <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-r from-purple-500/0 via-fuchsia-500/70 to-cyan-400/0 opacity-0 blur-md transition duration-500 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function FloatingParticles({ count = 20, className = "" }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setParticles(
        Array.from({ length: count }, (_, index) => ({
          left: `${(index * 17.3) % 100}%`,
          top: `${(index * 31.7) % 100}%`,
          size: 4 + (index % 3) * 3,
          drift: -28 - (index % 5) * 14,
          duration: 6 + (index % 4) * 1.5,
          delay: (index % 7) * 0.35,
          opacity: 0.12 + (index % 4) * 0.06,
        }))
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [count]);

  if (!particles) {
    return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} />;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle, index) => (
        <motion.div
          key={`${particle.left}-${particle.top}-${index}`}
          className="absolute rounded-full bg-gradient-to-br from-purple-400/40 to-cyan-400/10"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            y: [0, particle.drift],
            x: [0, index % 2 === 0 ? 12 : -12],
            opacity: [0, particle.opacity, 0],
            scale: [0.8, 1.1, 0.9],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function GradientOrb({
  className = "",
  size = 420,
  duration = 18,
  colors = ["rgba(168,85,247,0.28)", "rgba(236,72,153,0.16)", "rgba(59,130,246,0.08)"],
}: GradientOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl will-change-transform ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]} 55%, ${colors[2]} 100%)`,
      }}
      animate={{
        x: [0, 32, -18, 0],
        y: [0, -36, 20, 0],
        scale: [1, 1.06, 0.94, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function AnimatedGrid({ className = "" }: AnimatedGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.45 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="animate-background-pan absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
    </motion.div>
  );
}

export function PulsingDot({ color = "bg-green-500" }: PulsingDotProps) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  );
}
