import type { CSSProperties } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { safeMargin, theme } from "../theme";

/** Single source of truth for the overlay font stack (Caption imports this). */
export const OVERLAY_FONT_STACK =
  '"Arial Black", "Segoe UI Black", "Segoe UI", Arial, sans-serif';

export type StampProps = {
  text: string;
  color?: string;
  /** Frame at which the stamp pops in. */
  delay?: number;
  /** Font size as a fraction of the composition width. */
  size?: number;
  /** Base rotation in degrees. */
  rotate?: number;
  /** Springy decaying rotational wobble after pop-in. */
  wobble?: boolean;
  /** Neon glow instead of drop shadow. */
  glow?: boolean;
  align?: "left" | "center" | "right";
  /** Absolute px offset from the top of the composition. */
  top?: number;
  style?: CSSProperties;
};

/**
 * Big stamped overlay word (e.g. "BEBAS", "SUMPAH", "LANGGAR").
 * HTML only, always inside the horizontal safe margins.
 */
export const Stamp: React.FC<StampProps> = ({
  text,
  color = theme.accentYellow,
  delay = 0,
  size = 0.12,
  rotate = 0,
  wobble = false,
  glow = false,
  align = "center",
  top,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: wobble ? 5.5 : 11, mass: 0.9, stiffness: 170 },
  });
  const age = Math.max(0, frame - delay);
  const wobbleDeg = wobble
    ? Math.sin(age * 0.5) * 6 * Math.max(0, 1 - age / 70)
    : 0;

  const textAlign =
    align === "left" ? "left" : align === "right" ? "right" : "center";

  return (
    <div
      style={{
        position: "absolute",
        top: top ?? safeMargin.top,
        left: safeMargin.side,
        right: safeMargin.side,
        textAlign,
        pointerEvents: "none",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: OVERLAY_FONT_STACK,
          fontWeight: 900,
          fontSize: Math.round(width * size),
          lineHeight: 1.05,
          color,
          letterSpacing: "0.01em",
          WebkitTextStrokeWidth: Math.round(width * 0.007),
          WebkitTextStrokeColor: theme.background,
          paintOrder: "stroke fill",
          textShadow: glow
            ? `0 0 ${Math.round(width * 0.045)}px ${color}, 0 0 ${Math.round(
                width * 0.012,
              )}px ${color}`
            : `0 ${Math.round(width * 0.012)}px ${Math.round(
                width * 0.03,
              )}px rgba(0,0,0,0.5)`,
          transform: `scale(${0.45 + 0.55 * pop}) rotate(${
            rotate + wobbleDeg
          }deg)`,
          opacity: Math.min(1, pop * 1.6),
        }}
      >
        {text}
      </span>
    </div>
  );
};

export type ChipProps = {
  text: string;
  /** Text color (also the border color). */
  color?: string;
  /** Pill background. */
  bg?: string;
  delay?: number;
  style?: CSSProperties;
};

/**
 * Small labelled pill overlay used for scene-internal labels
 * ("KITA", "KAS NEGARA", banner wording, ...). HTML only.
 */
export const Chip: React.FC<ChipProps> = ({
  text,
  color = theme.background,
  bg = theme.paper,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        opacity: Math.min(1, pop * 1.4),
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: OVERLAY_FONT_STACK,
          fontWeight: 900,
          fontSize: Math.round(width * 0.03),
          letterSpacing: "0.08em",
          color,
          background: bg,
          border: `2px solid ${color}`,
          padding: `${Math.round(width * 0.012)}px ${Math.round(
            width * 0.028,
          )}px`,
          borderRadius: 999,
          whiteSpace: "nowrap",
          transform: `scale(${0.7 + 0.3 * pop})`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
