/**
 * Design tokens for the edu3d vertical (9:16) video.
 * All values are CSS pixels at the 1080x1920 canvas.
 */

export const theme = {
  /** Dark backdrop behind the 3D scene. */
  background: "#0B0F1A",
  /** Primary accent: highlights, emphasized caption lines. */
  accentYellow: "#FFD400",
  /** Secondary accent: warnings, secondary emphasis. */
  accentRed: "#FF3B3B",
  /** Paper tone for body/caption text. */
  paper: "#F5F1E6",
  /** Neon green: reserved accent; currently unused (removed from the hook beat after visual review). */
  neonGreen: "#39FF8E",
  /** Dark teal: outro backdrop. */
  darkTeal: "#0E2A33",
} as const;

/**
 * Safe margins: areas the platform (TikTok) covers with its own UI.
 * Keep all visible text inside these bounds.
 */
export const safeMargin = {
  top: 140,
  bottom: 320,
  /** Horizontal inset for text blocks. */
  side: 48,
} as const;
