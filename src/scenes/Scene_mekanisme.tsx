import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { Chip, Stamp } from "../ui/Stamp";
import {
  BackdropPlane,
  CameraRig,
  Coin,
  GroundPlane,
  SceneAtmosphere,
  clamp01,
  lerp,
} from "./parts";

type FlowCoin = {
  a: [number, number, number]; // titik "KITA"
  b: [number, number, number]; // mulut brankas "KAS NEGARA"
  c: [number, number, number]; // ujung gelap lewat pipa
  speed: number;
  offset: number;
  spin: number;
};

/**
 * Jalur koin deterministik: KITA -> brankas -> pipa keluar ke kegelapan.
 * Metafora murni: tanpa satu angka pun.
 */
const coinState = (
  coin: FlowCoin,
  frame: number,
): { pos: [number, number, number]; scale: number } => {
  const p = (coin.offset + frame * coin.speed) % 1;
  let pos: [number, number, number];
  if (p < 0.55) {
    const t = p / 0.55;
    const bump = Math.sin(t * Math.PI) * 0.35;
    pos = [
      lerp(coin.a[0], coin.b[0], t),
      lerp(coin.a[1], coin.b[1], t) + bump,
      lerp(coin.a[2], coin.b[2], t),
    ];
  } else {
    const t = (p - 0.55) / 0.45;
    const dip = Math.sin(t * Math.PI) * 0.3;
    pos = [
      lerp(coin.b[0], coin.c[0], t),
      lerp(coin.b[1], coin.c[1], t) - dip,
      lerp(coin.b[2], coin.c[2], t),
    ];
  }
  // Menyusut hingga nol sebelum mencapai tepi kanan frame — tidak ada
  // objek terang yang terpotong kasar.
  const scale = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.18);
  return { pos, scale };
};

/**
 * Beat "mekanisme" (180 frame): aliran koin 3D dari tangan-tangan "KITA"
 * menuju brankas "KAS NEGARA", lalu pipa keluar ke kotak bertanda "?".
 * Frustum potret sempit (setengah-FOV horizontal ~12.8 deg, tan = 0.227):
 * brankas dan kerumunan KITA ditarik ke dalam area pandang.
 */
export const SceneMekanisme: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const t = clamp01(frame / 180);
  const camX = lerp(-0.5, 0, t);
  const camZ = lerp(9.4, 8.4, t);

  const coins: FlowCoin[] = new Array(26).fill(0).map((_, i) => ({
    a: [
      -1.8 + (random(`mk-ax-${i}`) - 0.5) * 1.2,
      0.35 + random(`mk-ay-${i}`) * 0.75,
      1.0 + (random(`mk-az-${i}`) - 0.5) * 2.0,
    ],
    b: [1.0, 1.3, 0.55],
    c: [
      2.6 + (random(`mk-cx-${i}`) - 0.5) * 1.0,
      -1.2 + (random(`mk-cy-${i}`) - 0.5) * 1.0,
      -1.0 + (random(`mk-cz-${i}`) - 0.5) * 1.6,
    ],
    speed: 0.0045 + random(`mk-sp-${i}`) * 0.003,
    offset: random(`mk-of-${i}`),
    spin: (random(`mk-sn-${i}`) - 0.5) * 6,
  }));

  const hands = new Array(18).fill(0).map((_, i) => ({
    x: -2.2 + random(`mk-hx-${i}`) * 1.3,
    z: 0.8 + random(`mk-hz-${i}`) * 2.2,
    h: 0.5 + random(`mk-hh-${i}`) * 0.7,
    tilt: (random(`mk-ht-${i}`) - 0.5) * 0.25,
    rot: (random(`mk-hr-${i}`) - 0.5) * 0.6,
    phase: random(`mk-hp-${i}`) * Math.PI * 2,
  }));

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 44, position: [-0.5, 2.3, 9.4], near: 0.1, far: 100 }}
      >
        <SceneAtmosphere color={theme.background} fogNear={9} fogFar={27} />
        <CameraRig
          pose={() => ({ position: [camX, 2.3, camZ], target: [0, 1.15, 0] })}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[-5, 8, 6]} intensity={1.0} color="#BFD0FF" />
        <pointLight
          position={[1.0, 2.2, 3]}
          intensity={50}
          distance={9}
          decay={2}
          color="#FFC24D"
        />

        <GroundPlane color="#090D16" />
        <BackdropPlane color="#0D1424" y={7} z={-15} />

        {/* gundukan tangan kecil "KITA" (kumpulan titik asal koin) */}
        {hands.map((h, i) => (
          <group
            key={i}
            position={[h.x, 0, h.z]}
            rotation={[h.tilt, 0, h.rot + Math.sin(frame * 0.08 + h.phase) * 0.06]}
          >
            <mesh position={[0, h.h / 2, 0]}>
              <boxGeometry args={[0.1, h.h, 0.1]} />
              <meshStandardMaterial color="#0E1526" roughness={0.9} />
            </mesh>
            <mesh position={[0, h.h + 0.09, 0]}>
              <boxGeometry args={[0.16, 0.12, 0.05]} />
              <meshStandardMaterial color="#3E4B66" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* brankas raksasa "KAS NEGARA" (utuh di dalam frame) */}
        <group position={[1.0, 0.9, -0.5]}>
          <mesh>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#2A3247" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.76]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.24, 16]} />
            <meshStandardMaterial color="#39445F" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.9]}>
            <torusGeometry args={[0.18, 0.05, 6, 16]} />
            <meshStandardMaterial color="#8B94A8" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* pipa keluar brankas menuju kegelapan */}
        <mesh position={[2.45, 1.15, -0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 1.4, 12]} />
          <meshStandardMaterial color="#1A2133" roughness={0.8} />
        </mesh>
        <mesh position={[3.45, 0.6, -1.0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.15, 0.15, 1.6, 12]} />
          <meshStandardMaterial color="#1A2133" roughness={0.8} />
        </mesh>

        {/* kotak gelap bertanda "?" (teks lewat overlay) */}
        <mesh position={[4.3, 0.1, -2.2]}>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial color="#0B101D" roughness={0.9} />
        </mesh>

        {/* koin mengalir (menyusut sebelum tepi kanan) */}
        {coins.map((c, i) => {
          const s = coinState(c, frame);
          if (s.scale <= 0.001) {
            return null;
          }
          return (
            <Coin
              key={i}
              position={s.pos}
              rotation={[
                c.spin,
                frame * 0.1 * Math.sign(c.spin) + c.spin,
                frame * 0.07,
              ]}
              radius={0.11}
              scale={s.scale}
            />
          );
        })}
      </ThreeCanvas>

      {/* Label metafora via overlay HTML, di dalam safe margin, tanpa
          tumpang tindih: KITA kiri-atas, KAS NEGARA tepat di atas brankas,
          "?" menyala di pojok kanan-atas jauh dari kedua pill. */}
      <Chip
        text="KITA"
        delay={6}
        style={{ left: safeMargin.side + 6, top: height * 0.28 }}
      />
      <Chip
        text="KAS NEGARA"
        delay={20}
        style={{ left: "56%", top: height * 0.36 }}
      />
      <Stamp
        text="?"
        color={theme.accentYellow}
        delay={55}
        size={0.28}
        rotate={-6}
        align="right"
        top={Math.round(height * 0.15)}
        glow
      />

      <Caption
        lines={[
          '"Tapi dalam hal-hal lainnya,',
          "bagaimana anggaran kita dikeluarkan,",
          'bagaimana lahan-lahan kita dikelola?"',
        ]}
        accentIndex={2}
        staggerFrames={42}
      />
    </AbsoluteFill>
  );
};
