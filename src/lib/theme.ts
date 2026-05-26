import type { CSSProperties } from "react";
import { COLORS } from "./constants";

const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
} as const;

const radius = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  full: "9999px",
} as const;

const shadows = {
  soft: "0 12px 30px rgba(15, 23, 42, 0.18)",
  glow: "0 0 0 1px rgba(139, 92, 246, 0.18), 0 18px 40px rgba(76, 29, 149, 0.35)",
  elevated: "0 24px 48px rgba(2, 6, 23, 0.45)",
  inset: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
} as const;

type Preset = {
  className: string;
  style: CSSProperties;
};

const glass = {
  subtle: {
    className: "border border-white/10 bg-white/5 backdrop-blur-xl",
    style: { boxShadow: `${shadows.soft}, ${shadows.inset}` },
  },
  strong: {
    className: "border border-white/15 bg-slate-950/70 backdrop-blur-2xl",
    style: { boxShadow: `${shadows.glow}, ${shadows.inset}` },
  },
  tinted: {
    className: "border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-950/80 to-cyan-500/10 backdrop-blur-2xl",
    style: { boxShadow: `${shadows.elevated}, ${shadows.inset}` },
  },
} satisfies Record<string, Preset>;

const cards = {
  base: {
    className: "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl",
    style: { boxShadow: `${shadows.soft}, ${shadows.inset}` },
  },
  elevated: {
    className: "rounded-[28px] border border-white/10 bg-slate-950/80 p-6 backdrop-blur-2xl",
    style: { boxShadow: `${shadows.elevated}, ${shadows.inset}` },
  },
  interactive: {
    className: "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/10",
    style: { boxShadow: `${shadows.soft}, ${shadows.inset}` },
  },
} satisfies Record<string, Preset>;

export const theme = {
  colors: {
    brand: COLORS,
    background: {
      canvas: "#030712",
      surface: "rgba(15, 23, 42, 0.72)",
      elevated: "rgba(17, 24, 39, 0.9)",
      overlay: "rgba(3, 7, 18, 0.78)",
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#CBD5E1",
      muted: "#94A3B8",
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.08)",
      default: "rgba(255, 255, 255, 0.12)",
      accent: "rgba(139, 92, 246, 0.35)",
    },
    gradient: {
      primary: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      accent: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
      surface: "linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(59, 130, 246, 0.08) 100%)",
    },
  },
  spacing,
  radius,
  shadows,
  glass,
  cards,
} as const;

export type AppTheme = typeof theme;
export type ThemePreset = Preset;
