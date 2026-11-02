import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

/**
 * Placeholder 3D scene: objects only. All text is HTML overlay (ui/Caption.tsx),
 * never 3D text. Deterministic — driven by useCurrentFrame, not useFrame.
 */
export const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />

      <mesh position={[0, 0.2, 0]} rotation={[t * 0.4, t * 0.6, 0]}>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshStandardMaterial
          color={theme.accentYellow}
          metalness={0.2}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[2.4, -0.7, -1.2]} rotation={[t * 0.5, -t * 0.35, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={theme.accentRed} roughness={0.5} />
      </mesh>

      <mesh position={[-2.5, -1, -1.5]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={theme.paper} roughness={0.6} />
      </mesh>
    </>
  );
};
