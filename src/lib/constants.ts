export const ANIMATION_DURATIONS = { fast: 0.2, normal: 0.4, slow: 0.8 } as const;

export const COLORS = {
  primary: "#8B5CF6",
  secondary: "#10B981",
  accent: "#3B82F6",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#22C55E",
} as const;

export const DIFFICULTY_COLORS = {
  Easy: "#22C55E",
  Medium: "#F59E0B",
  Hard: "#EF4444",
} as const;

export const LEVELS = ["beginner", "intermediate", "advanced", "pro"] as const;

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
