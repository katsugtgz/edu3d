import { Color } from "three";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { OVERLAY_FONT_STACK, Stamp } from "../ui/Stamp";
import {
  BackdropPlane,
  CameraRig,
  Crowd,
  GroundPlane,
  SceneAtmosphere,
  clamp01,
  easeOutCubic,
  lerp,
} from "./parts";

const WARM = "#FFC24D";
const COLD = "#9FD8FF";

const RING_POS: [number, number, number] = [0.98, 2.62, 0.12];

/** Overlay transisi kalender: kartu "HARI INI" terlipat, "ESOK HARI" di bawahnya. */
const CalendarFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const fade = 1 - clamp01((frame - 22) / 6);
  if (fade <= 0) {
    return null;
  }
  const flip = easeOutCubic(clamp01(frame / 16));
  const cardW = width * 0.44;
  const cardH = width * 0.24;

  const cardText = {
    fontFamily: OVERLAY_FONT_STACK,
    fontWeight: 900,
    fontSize: Math.round(width * 0.05),
    letterSpacing: "0.05em",
  } as const;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fade,
        pointerEvents: "none",
        perspective: 900,
      }}
    >
      <div
        style={{
          position: "relative",
          width: cardW,
          height: cardH,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "#39404F",
            color: theme.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...cardText,
          }}
        >
          ESOK HARI
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: theme.paper,
            color: theme.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotateX(${-105 * flip}deg)`,
            transformOrigin: "top center",
            backfaceVisibility: "hidden",
            ...cardText,
          }}
        >
          HARI INI
        </div>
      </div>
    </div>
  );
};

/**
 * Beat "langgar" (105 frame): cincin cahaya di pergelangan siluet abstrak
 * berjas tanpa wajah berubah dingin lalu retak seperti kaca; pecahan jatuh
 * slow-motion di depan kerumunan mahasiswa; langit esok hari kelabu.
 * Pelaku pelanggaran adalah figur anonim — bukan orator, bukan mahasiswa.
 */
export const SceneLanggar: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const camZ = lerp(8.2, 7.4, clamp01(frame / 105));

  // Warna cincin: hangat -> dingin pada frame 8..30.
  const coldT = clamp01((frame - 8) / 22);
  const ringColor = `#${new Color(WARM)
    .lerp(new Color(COLD), coldT)
    .getHexString()}`;
  const cracked = frame >= 32;

  const shards = new Array(16).fill(0).map((_, i) => ({
    ang: (i / 16) * Math.PI * 2 + random(`lg-sh-a-${i}`) * 0.5,
    rad: 0.3 + random(`lg-sh-r-${i}`) * 0.1,
    fall: 0.02 + random(`lg-sh-f-${i}`) * 0.035,
    spin: (random(`lg-sh-s-${i}`) - 0.5) * 0.3,
    delayF: random(`lg-sh-d-${i}`) * 10,
  }));

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 44, position: [0, 2.3, 8.2], near: 0.1, far: 100 }}
      >
        {/* langit esok hari kelabu */}
        <SceneAtmosphere color="#202836" fogNear={8} fogFar={26} />
        <CameraRig
          pose={() => ({ position: [0, 2.3, camZ], target: [0.2, 2.0, 0] })}
        />

        <ambientLight intensity={0.65} />
        <directionalLight position={[-3, 8, 5]} intensity={1.0} color="#C9D4E6" />
        <pointLight
          position={[1.1, 2.8, 2]}
          intensity={45}
          distance={8}
          decay={2}
          color={cracked ? COLD : ringColor}
        />

        <GroundPlane color="#151B28" />
        <BackdropPlane color="#3A4152" y={7} z={-14} width={50} height={30} />

        {/* kerumunan mahasiswa menatap, di belakang figur */}
        <Crowd
          count={42}
          seed="lg-crowd"
          xRange={[-9, 9]}
          zRange={[-4.5, -1.5]}
          height={1.05}
        />

        {/* siluet abstrak berjas tanpa wajah dengan lengan terangkat */}
        <group position={[0, 0, -0.6]}>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.95, 1.5, 0.5]} />
            <meshStandardMaterial color="#10182B" roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <sphereGeometry args={[0.24, 10, 8]} />
            <meshStandardMaterial color="#0B111F" roughness={1} />
          </mesh>
          <mesh position={[0.62, 1.95, 0.12]} rotation={[0, 0, -0.9]}>
            <boxGeometry args={[0.24, 0.7, 0.24]} />
            <meshStandardMaterial color="#10182B" roughness={0.9} />
          </mesh>
          <mesh position={[0.98, 2.4, 0.12]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.22, 0.62, 0.22]} />
            <meshStandardMaterial color="#10182B" roughness={0.9} />
          </mesh>
          <mesh position={[1.05, 2.82, 0.12]}>
            <boxGeometry args={[0.2, 0.26, 0.14]} />
            <meshStandardMaterial color="#131C30" roughness={0.9} />
          </mesh>
        </group>

        {/* cincin di pergelangan: hangat -> dingin, lalu pecah */}
        {cracked ? null : (
          <mesh
            position={RING_POS}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1 + coldT * 0.08, 1 + coldT * 0.08, 1]}
          >
            <torusGeometry args={[0.3, 0.055, 8, 24]} />
            <meshStandardMaterial
              color={ringColor}
              emissive={ringColor}
              emissiveIntensity={2.4}
              roughness={0.3}
            />
          </mesh>
        )}

        {/* pecahan kaca jatuh slow-motion di depan kerumunan */}
        {shards.map((s, i) => {
          if (!cracked) {
            return null;
          }
          const age = Math.max(0, frame - 32 - s.delayF);
          const x = RING_POS[0] + Math.cos(s.ang) * s.rad * 1.05;
          const z = RING_POS[2] + Math.sin(s.ang) * s.rad * 0.6;
          const y = Math.max(
            0.08,
            RING_POS[1] +
              Math.sin(s.ang) * s.rad -
              age * s.fall * (1 + age * 0.02),
          );
          return (
            <mesh
              key={i}
              position={[x, y, z]}
              rotation={[age * s.spin, s.ang, age * s.spin * 0.7]}
            >
              <boxGeometry args={[0.09, 0.13, 0.03]} />
              <meshStandardMaterial
                color={COLD}
                emissive={COLD}
                emissiveIntensity={1.4}
                roughness={0.2}
                metalness={0.2}
              />
            </mesh>
          );
        })}
      </ThreeCanvas>

      <CalendarFlip />
      <Stamp
        text="LANGGAR"
        color={theme.accentRed}
        delay={30}
        size={0.155}
        rotate={-5}
        wobble
        glow
        top={safeMargin.top + 14}
      />

      <Caption
        lines={["Sumpah hari ini,", "dilanggar esoknya —", "itu mereka, bukan kita."]}
        accentIndex={2}
        staggerFrames={22}
      />
    </AbsoluteFill>
  );
};
