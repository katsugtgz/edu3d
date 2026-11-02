import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "./theme";
import { SceneHook } from "./scenes/Scene_hook";
import { SceneKonteks } from "./scenes/Scene_konteks";
import { SceneMekanisme } from "./scenes/Scene_mekanisme";
import { SceneSumpah } from "./scenes/Scene_sumpah";
import { SceneLanggar } from "./scenes/Scene_langgar";
import { SceneOutro } from "./scenes/Scene_outro";

/**
 * Beat timeline dari naskah (docs/naskah-orasi.md):
 * hook 80 + konteks 135 + mekanisme 180 + sumpah 270 + langgar 105 + outro 150
 * = 920 frame pada 30 fps (Root.tsx: durationInFrames 920).
 */
const BEATS = [
  { id: "hook", from: 0, durationInFrames: 80, Component: SceneHook },
  { id: "konteks", from: 80, durationInFrames: 135, Component: SceneKonteks },
  { id: "mekanisme", from: 215, durationInFrames: 180, Component: SceneMekanisme },
  { id: "sumpah", from: 395, durationInFrames: 270, Component: SceneSumpah },
  { id: "langgar", from: 665, durationInFrames: 105, Component: SceneLanggar },
  { id: "outro", from: 770, durationInFrames: 150, Component: SceneOutro },
] as const;

/**
 * Main 9:16 composition.
 * Setiap beat adalah <Sequence> berisi scene 3D + overlay HTML-nya sendiri;
 * layer order di dalam scene: background -> 3D canvas -> HTML text overlay.
 */
export const EduMain: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {BEATS.map(({ id, from, durationInFrames, Component }) => (
        <Sequence
          key={id}
          from={from}
          durationInFrames={durationInFrames}
          name={id}
          layout="none"
        >
          <Component />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
