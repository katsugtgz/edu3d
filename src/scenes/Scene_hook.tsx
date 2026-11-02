import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { Stamp } from "../ui/Stamp";
import {
  BackdropPlane,
  CameraRig,
  CitySilhouette,
  Coin,
  Crowd,
  GroundPlane,
  Lanterns,
  Monument,
  SceneAtmosphere,
  lerp,
} from "./parts";

/**
 * Beat "hook" (80 frame): split vertikal.
 * Kiri: stamp kuning "BEBAS", gembok 3D terbuka di atas kerumunan berlampion.
 * Kanan: gelap, koin membeku di udara + "ANGGARAN?" + tanda tanya besar merah.
 * Kamera dolly-in cepat (spring) lalu semua beku sejenak.
 *
 * Palet kuning/merah tema (hijau dihapus sesuai hasil review visual).
 * Semua objek dijaga di dalam frustum potret (setengah-FOV horizontal
 * fov 42 deg pada 1080x1920 = ~12.2 deg, tan(12.2deg) = 0.214).
 */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Dolly-in cepat lalu menetap (semua beku sejenak).
  const dolly = spring({
    frame,
    fps,
    config: { damping: 20, mass: 1.1, stiffness: 55 },
  });
  const camZ = lerp(11.2, 6.6, dolly);
  const camY = lerp(2.9, 2.0, dolly);

  // Koin kanan membeku di udara. Parametrisasi via sudut layar: sudut pusat
  // maksimum ~8.8 deg dikurangi radius sudut koin terbesar (r 0.22 pada dz 5
  // = ~2.5 deg) sehingga tidak satu pun koin menyentuh tepi kanan frame
  // (setengah-FOV horizontal 12.2 deg).
  const coins = new Array(14).fill(0).map((_, i) => {
    const dz = 5 + random(`hk-d-${i}`) * 3; // jarak 5..8 dari kamera akhir
    const ang = (0.1 + random(`hk-a-${i}`) * 0.62) * 0.214; // rad
    return {
      x: Math.tan(ang) * dz,
      y: 0.7 + random(`hk-y-${i}`) * 1.9,
      z: 6.6 - dz,
      rx: random(`hk-coin-rx-${i}`) * Math.PI,
      ry: random(`hk-coin-ry-${i}`) * Math.PI,
      rz: random(`hk-coin-rz-${i}`) * Math.PI,
      r: 0.13 + random(`hk-coin-r-${i}`) * 0.09,
    };
  });

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 42, position: [0, 2.9, 11.2], near: 0.1, far: 100 }}
      >
        <SceneAtmosphere color={theme.background} fogNear={9} fogFar={30} />
        <CameraRig
          pose={() => ({ position: [0, camY, camZ], target: [0, 1.5, -1] })}
        />

        <ambientLight intensity={0.55} />
        <directionalLight position={[-6, 9, 6]} intensity={1.3} color="#FFE7C2" />
        <pointLight
          position={[-1.6, 2.2, 2.6]}
          intensity={60}
          distance={10}
          decay={2}
          color="#FFC24D"
        />
        {/* sisi kanan: redup kemerahan (palet kuning/merah, tanpa biru/hijau) */}
        <pointLight
          position={[2.2, 2.6, 2]}
          intensity={14}
          distance={8}
          decay={2}
          color={theme.accentRed}
        />

        <GroundPlane color="#0A0E18" />
        {/* split backdrop: sisi kiri lebih terang hangat, kanan hampir hitam */}
        <BackdropPlane color="#151C30" x={-7} y={9} z={-16} width={22} height={26} />
        <BackdropPlane color="#04060C" x={7} y={9} z={-16} width={22} height={26} />

        {/* landmark abstraksi Bundaran HI + siluet kota */}
        <Monument position={[0, 0, -8]} />
        <CitySilhouette z={-12} seed="hook-city" count={16} color="#111827" />

        {/* kiri: kerumunan siluet + lampion terpisah (frustum-safe) */}
        <Crowd
          count={26}
          seed="hook-crowd"
          xRange={[-4.2, 1.6]}
          zRange={[-3.5, 2.2]}
          height={1.05}
        />
        <Lanterns count={12} seed="hook-lantern" cameraZ={6.6} />

        {/* gembok terbuka di atas kerumunan */}
        <group position={[-0.95, 0, -1.5]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.72, 1.1, 0.72]} />
            <meshStandardMaterial color="#1B2233" roughness={0.9} />
          </mesh>
          <group position={[0, 1.62 + Math.sin(frame * 0.07) * 0.06, 0]}>
            <mesh>
              <boxGeometry args={[0.95, 0.72, 0.3]} />
              <meshStandardMaterial color="#3A4356" metalness={0.6} roughness={0.35} />
            </mesh>
            {/* indikator terbuka: cincin kuning */}
            <mesh position={[0, 0.12, 0.16]}>
              <torusGeometry args={[0.15, 0.045, 6, 16]} />
              <meshStandardMaterial
                color={theme.accentYellow}
                emissive={theme.accentYellow}
                emissiveIntensity={1.8}
                roughness={0.4}
              />
            </mesh>
            {/* shackle terbuka (setengah torus, dimiringkan) */}
            <group position={[-0.26, 0.4, 0]} rotation={[0, 0, 0.75]}>
              <mesh>
                <torusGeometry args={[0.3, 0.075, 8, 18, Math.PI * 1.15]} />
                <meshStandardMaterial color="#8B94A8" metalness={0.75} roughness={0.3} />
              </mesh>
            </group>
          </group>
        </group>

        {/* kanan: koin membeku di udara */}
        {coins.map((c, i) => (
          <Coin
            key={i}
            position={[c.x, c.y, c.z]}
            rotation={[c.rx, c.ry, c.rz]}
            radius={c.r}
          />
        ))}
      </ThreeCanvas>

      {/* Stamps ditumpuk vertikal (tidak pernah tumpang tindih),
          semuanya di bawah zona UI atas 140 px. */}
      <Stamp
        text="BEBAS"
        color={theme.accentYellow}
        delay={6}
        size={0.11}
        rotate={-3}
        align="left"
        top={safeMargin.top + 60}
        glow
      />
      <Stamp
        text="ANGGARAN?"
        color={theme.accentYellow}
        delay={34}
        size={0.105}
        rotate={3}
        align="right"
        top={safeMargin.top + 240}
        glow
      />
      <Stamp
        text="?"
        color={theme.accentRed}
        delay={46}
        size={0.3}
        rotate={-7}
        align="right"
        top={safeMargin.top + 440}
        glow
      />

      <Caption
        lines={["Di hari Sumpah Pemuda, kita BEBAS ✅", "Tapi... anggaran kita?"]}
        accentIndex={0}
      />
    </AbsoluteFill>
  );
};
