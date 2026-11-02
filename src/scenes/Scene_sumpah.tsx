import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { Stamp } from "../ui/Stamp";
import {
  BackdropPlane,
  CameraRig,
  Crowd,
  GroundPlane,
  SceneAtmosphere,
  clamp01,
  easeInOut,
  lerp,
} from "./parts";

/**
 * Beat "sumpah" (270 frame): tangan tunggal terangkat telapak terbuka
 * di atas lautan siluet, cincin cahaya hangat melingkar di pergelangan,
 * kamera naik perlahan. Tangan dibangun dari kumpulan box sederhana.
 */
export const SceneSumpah: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Kamera naik perlahan sepanjang beat.
  const t = easeInOut(clamp01(frame / 270));
  const camY = lerp(0.9, 3.7, t);
  const camZ = lerp(9.9, 8.3, t);
  const targetY = lerp(1.5, 2.8, t);

  const ringPulse = 1 + Math.sin(frame * 0.09) * 0.05;

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 42, position: [0, 0.9, 9.9], near: 0.1, far: 100 }}
      >
        <SceneAtmosphere color={theme.background} fogNear={10} fogFar={34} />
        <CameraRig
          pose={() => ({ position: [0, camY, camZ], target: [0, targetY, 1] })}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[-5, 8, 6]} intensity={1.0} color="#FFE7C2" />
        <pointLight
          position={[0, 2.7, 2.6]}
          intensity={80}
          distance={10}
          decay={2}
          color="#FFC24D"
        />

        <GroundPlane color="#090D16" />
        <BackdropPlane color="#10182B" y={7} z={-16} />

        {/* lautan siluet mahasiswa */}
        <Crowd
          count={110}
          seed="sp-crowd"
          xRange={[-13, 13]}
          zRange={[-9, 5.6]}
          height={1.1}
          sway={0.6}
        />

        {/* tangan terangkat (kumpulan box) + cincin cahaya hangat */}
        <group
          position={[0, 0, 1.4]}
          rotation={[0, 0, Math.sin(frame * 0.015) * 0.05]}
        >
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.42, 1.9, 0.3]} />
            <meshStandardMaterial color="#EFE7D2" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.62, 0]}>
            <boxGeometry args={[0.85, 0.5, 0.18]} />
            <meshStandardMaterial color="#F5F1E6" roughness={0.7} />
          </mesh>
          {[-0.31, -0.105, 0.1, 0.31].map((x, i) => (
            <mesh key={i} position={[x, 3.08, 0]}>
              <boxGeometry args={[0.16, 0.55, 0.15]} />
              <meshStandardMaterial color="#F5F1E6" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[-0.52, 2.72, 0.02]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.15, 0.4, 0.14]} />
            <meshStandardMaterial color="#F5F1E6" roughness={0.7} />
          </mesh>
          {/* cincin utama di pergelangan */}
          <mesh
            position={[0, 2.38, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[ringPulse, ringPulse, 1]}
          >
            <torusGeometry args={[0.36, 0.055, 8, 28]} />
            <meshStandardMaterial
              color="#FFC24D"
              emissive="#FFC24D"
              emissiveIntensity={2.6}
              roughness={0.4}
            />
          </mesh>
          {/* cincin tipis sekunder berputar pelan */}
          <mesh position={[0, 2.38, 0]} rotation={[Math.PI / 2, 0, frame * 0.01]}>
            <torusGeometry args={[0.52, 0.02, 6, 24]} />
            <meshStandardMaterial
              color="#FFC24D"
              emissive="#FFC24D"
              emissiveIntensity={1.2}
              transparent
              opacity={0.5}
              roughness={0.4}
            />
          </mesh>
        </group>
      </ThreeCanvas>

      <Stamp
        text="SUMPAH"
        delay={14}
        size={0.15}
        rotate={-3}
        glow
        top={safeMargin.top + 18}
      />

      {/* Kutipan orasi verbatim, baris demi baris */}
      <Caption
        lines={[
          '"Dan kita bukanlah mereka yang hanya',
          "bersumpah satu hari kemudian besoknya",
          'langsung melanggarnya, teman-teman"',
        ]}
        accentIndex={1}
        staggerFrames={62}
      />
    </AbsoluteFill>
  );
};
