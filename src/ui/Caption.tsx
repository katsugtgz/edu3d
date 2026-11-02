import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { safeMargin, theme } from "../theme";
import { OVERLAY_FONT_STACK } from "./Stamp";

/** Frames between the pop-in of consecutive lines. */
const LINE_STAGGER_FRAMES = 3;

export type CaptionProps = {
  /** Caption lines, top to bottom. Each line word-wraps within the safe area. */
  lines: string[];
  /** Index of the line highlighted with the accent color. */
  accentIndex?: number;
  /**
   * Frames between the pop-in of consecutive lines. Defaults to 3; a larger
   * value paces quote lines across a whole beat (baris demi baris).
   */
  staggerFrames?: number;
};

/**
 * Big bold caption overlay. Rendered as plain HTML (absolutely positioned)
 * ON TOP of the 3D canvas — never as 3D text — so it stays crisp and readable.
 * Lines pop in one after another using Remotion's spring().
 */
export const Caption: React.FC<CaptionProps> = ({
  lines,
  accentIndex,
  staggerFrames,
}) => {
  const stagger = staggerFrames ?? LINE_STAGGER_FRAMES;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fontSize = Math.round(width * 0.082);
  const strokeWidth = Math.round(width * 0.008);

  return (
    <div
      style={{
        position: "absolute",
        // Respect the TikTok safe margins on every side.
        top: safeMargin.top,
        bottom: safeMargin.bottom,
        left: safeMargin.side,
        right: safeMargin.side,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: Math.round(height * 0.014),
        pointerEvents: "none",
      }}
    >
      {lines.map((line, index) => {
        const delay = index * stagger;
        const pop = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, mass: 0.7, stiffness: 200 },
        });
        const fade = spring({
          frame: frame - delay,
          fps,
          config: { damping: 24, mass: 0.5, stiffness: 220 },
        });

        return (
          <div
            key={`${index}-${line}`}
            style={{
              fontFamily: OVERLAY_FONT_STACK,
              fontWeight: 900,
              fontSize,
              lineHeight: 1.08,
              textAlign: "center",
              maxWidth: "100%",
              overflowWrap: "normal",
              whiteSpace: "normal",
              color: index === accentIndex ? theme.accentYellow : theme.paper,
              // Thick dark stroke painted BEHIND the fill + layered shadow
              // keeps the text readable over bright 3D objects.
              WebkitTextStrokeWidth: strokeWidth,
              WebkitTextStrokeColor: theme.background,
              paintOrder: "stroke fill",
              textShadow: `0 ${Math.round(width * 0.006)}px 0 rgba(0,0,0,0.35), 0 ${Math.round(
                width * 0.02,
              )}px ${Math.round(width * 0.05)}px rgba(0,0,0,0.55)`,
              transform: `translateY(${(1 - pop) * Math.round(height * 0.015)}px) scale(${
                0.72 + 0.28 * pop
              })`,
              opacity: fade,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
