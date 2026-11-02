import { DoubleSide } from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { Chip } from "../ui/Stamp";
import {
  CameraRig,
  CitySilhouette,
  Crowd,
  GroundPlane,
  Monument,
  SceneAtmosphere,
  clamp01,
  easeInOut,
  lerp,
} from "./parts";

/**
 * Beat "konteks" (135 frame): mimbar orasi low-poly di Bundaran HI.
 * Satu siluet mahasiswi bermegafon di bawah sorot lampu hangat,
 * spanduk polos (kata-kata lewat overlay HTML), kamera orbit pelan.
 * Tanpa logo institusi lain, tanpa wajah — semua figur abstrak.
 */
export const SceneKonteks: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Orbit pelan mengelilingi mimbar.
  const t = easeInOut(clamp01(frame / 135));
  const ang = lerp(-0.5, 0.5, t);
  const radius = 8.6;
  const camX = Math.sin(ang) * radius;
  const camZ = Math.cos(ang) * radius;

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 44, position: [0, 2.2, 8.6], near: 0.1, far: 100 }}
      >
        <SceneAtmosphere color={theme.background} fogNear={9} fogFar={30} />
        <CameraRig
          pose={() => ({ position: [camX, 2.2, camZ], target: [0, 1.8, -0.5] })}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[-4, 8, 5]} intensity={0.9} color="#BFD0FF" />
        <pointLight
          position={[0, 4.4, 2.2]}
          intensity={90}
          distance={12}
          decay={2}
          color="#FFC24D"
        />

        <GroundPlane color="#0A0E18" />
        <Monument position={[3.8, 0, -7]} scale={0.9} />
        <CitySilhouette z={-12} seed="ctx-city" count={16} color="#101728" />

        {/* spanduk polos di antara dua tiang */}
        <group position={[0, 0, -3]}>
          <mesh position={[-2, 1.6, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
            <meshStandardMaterial color="#2A3245" roughness={0.9} />
          </mesh>
          <mesh position={[2, 1.6, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
            <meshStandardMaterial color="#2A3245" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.05, 0]} rotation={[0, 0, 0.02]}>
            <planeGeometry args={[3.9, 0.95]} />
            <meshStandardMaterial
              color="#E7DFC9"
              roughness={1}
              side={DoubleSide}
            />
          </mesh>
        </group>

        {/* mimbar + orator siluet (tanpa wajah) */}
        <group>
          <mesh position={[0, 0.62, 0.9]}>
            <boxGeometry args={[1.05, 1.24, 0.6]} />
            <meshStandardMaterial color="#1D2436" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.26, 0.9]}>
            <boxGeometry args={[1.2, 0.08, 0.72]} />
            <meshStandardMaterial color="#2A3245" roughness={0.85} />
          </mesh>
          <group position={[0, 0, 0.15]}>
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[0.42, 1.0, 0.3]} />
              <meshStandardMaterial color="#0A0F1C" roughness={1} />
            </mesh>
            <mesh position={[0, 1.56, 0]}>
              <sphereGeometry args={[0.14, 10, 8]} />
              <meshStandardMaterial color="#0A0F1C" roughness={1} />
            </mesh>
            {/* megafon */}
            <group position={[0.34, 1.2, 0.28]} rotation={[Math.PI / 2, 0, 0.2]}>
              <mesh>
                <coneGeometry args={[0.17, 0.42, 10]} />
                <meshStandardMaterial color={theme.accentYellow} roughness={0.5} />
              </mesh>
            </group>
          </group>
          {/* kerucut sorot lampu hangat (transparan, tanpa shadow) */}
          <mesh position={[0, 3.95, 0.6]}>
            <coneGeometry args={[1.7, 5.4, 14, 1, true]} />
            <meshStandardMaterial
              color="#FFD9A0"
              emissive="#FFD9A0"
              emissiveIntensity={0.7}
              transparent
              opacity={0.13}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        </group>

        {/* barisan mahasiswa di depan panggung */}
        <Crowd
          count={16}
          seed="ctx-crowd"
          xRange={[-6, 6]}
          zRange={[3.4, 6]}
          height={1.05}
        />
      </ThreeCanvas>

      {/* wording spanduk via overlay HTML (spanduk 3D sengaja polos) */}
      <Chip
        text="AKSI HARI SUMPAH PEMUDA"
        delay={8}
        style={{
          top: safeMargin.top + 14,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <Caption
        lines={[
          "Orasi mahasiswa, Bundaran HI.",
          "Fathimah Azzahra, BEM UI.",
          "Aksi Hari Sumpah Pemuda.",
        ]}
        accentIndex={1}
      />
    </AbsoluteFill>
  );
};
