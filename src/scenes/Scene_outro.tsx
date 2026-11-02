import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { safeMargin, theme } from "../theme";
import { Caption } from "../ui/Caption";
import { OVERLAY_FONT_STACK, Chip } from "../ui/Stamp";
import { CameraRig, SceneAtmosphere, clamp01, easeInOut } from "./parts";

/**
 * Beat "outro" (150 frame): ponsel 3D di tengah menampilkan thumbnail orasi
 * lengkap dengan tombol play berdenyut, panah kecil menunjuk ke bawah menuju
 * "link di bio", lalu tombol Follow menyala. Latar teal gelap bersih.
 */
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const rise = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.9, stiffness: 90 },
  });
  const bob = Math.sin(frame * 0.05) * 0.05;
  const playPulse = 1 + Math.sin(frame * 0.18) * 0.12;
  const followPop = spring({
    frame: frame - 70,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 180 },
  });

  // Kamera hampir diam, hanya push-in sangat halus.
  const camZ = 7.2 - 0.25 * easeInOut(clamp01(frame / 150));

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 44, position: [0, 0.4, 7.2], near: 0.1, far: 100 }}
      >
        <SceneAtmosphere color={theme.darkTeal} fogNear={8} fogFar={22} />
        <CameraRig
          pose={() => ({ position: [0, 0.4, camZ], target: [0, -0.2, 0] })}
        />

        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 6]} intensity={1.2} color="#DFF6FF" />
        <pointLight
          position={[-2.5, -1, 3]}
          intensity={40}
          distance={10}
          decay={2}
          color="#2FBFAE"
        />

        {/* ponsel 3D */}
        <group
          position={[0, -0.35 + (1 - rise) * -2.6 + bob, 0]}
          rotation={[0, Math.sin(frame * 0.025) * 0.07, 0]}
        >
          <mesh>
            <boxGeometry args={[1.85, 3.7, 0.2]} />
            <meshStandardMaterial color="#0C111C" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* layar */}
          <mesh position={[0, 0, 0.105]}>
            <planeGeometry args={[1.62, 3.42]} />
            <meshBasicMaterial color="#16243A" fog={false} />
          </mesh>
          {/* thumbnail video orasi lengkap */}
          <mesh position={[0, 0.95, 0.115]}>
            <planeGeometry args={[1.4, 0.85]} />
            <meshBasicMaterial color="#233A5C" fog={false} />
          </mesh>
          {/* tombol play berdenyut */}
          <mesh
            position={[0, 0.95, 0.125]}
            rotation={[0, 0, -Math.PI / 2]}
            scale={[playPulse, playPulse, 1]}
          >
            <coneGeometry args={[0.17, 0.3, 3]} />
            <meshStandardMaterial
              color={theme.accentYellow}
              emissive={theme.accentYellow}
              emissiveIntensity={1.4}
              roughness={0.4}
            />
          </mesh>
          {/* garis meta progress + titik speaker */}
          <mesh position={[0, 0.32, 0.115]}>
            <planeGeometry args={[1.1, 0.06]} />
            <meshBasicMaterial color="#31435F" fog={false} />
          </mesh>
          <mesh position={[-0.2, 0.32, 0.118]}>
            <planeGeometry args={[0.5, 0.06]} />
            <meshBasicMaterial color={theme.accentYellow} fog={false} />
          </mesh>
          <mesh position={[0, 1.62, 0.11]}>
            <planeGeometry args={[0.34, 0.05]} />
            <meshBasicMaterial color="#0C111C" fog={false} />
          </mesh>
        </group>
      </ThreeCanvas>

      {/* CTA overlay: panah ke bawah -> "link di bio" -> FOLLOW menyala */}
      <div
        style={{
          position: "absolute",
          top: safeMargin.top + 8,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: Math.round(height * 0.008),
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: OVERLAY_FONT_STACK,
            fontWeight: 900,
            fontSize: Math.round(width * 0.05),
            color: theme.accentYellow,
            textShadow: `0 0 ${Math.round(width * 0.03)}px ${theme.accentYellow}`,
            transform: `translateY(${Math.sin(frame * 0.15) * 7}px)`,
          }}
        >
          ▼
        </div>
        <Chip
          text="LINK DI BIO"
          delay={10}
          style={{ position: "relative", left: "auto", top: "auto" }}
        />
        <div
          style={{
            marginTop: Math.round(height * 0.018),
            fontFamily: OVERLAY_FONT_STACK,
            fontWeight: 900,
            fontSize: Math.round(width * 0.055),
            letterSpacing: "0.06em",
            color: theme.background,
            background: theme.accentYellow,
            padding: `${Math.round(width * 0.018)}px ${Math.round(
              width * 0.05,
            )}px`,
            borderRadius: 999,
            transform: `scale(${0.5 + 0.5 * followPop})`,
            opacity: Math.min(1, followPop * 1.5),
            boxShadow: `0 0 ${Math.round(width * 0.06)}px ${theme.accentYellow}AA`,
          }}
        >
          FOLLOW
        </div>
      </div>

      <Caption
        lines={[
          "Nonton orasi lengkapnya —",
          "link di bio.",
          "Follow untuk cerita berikutnya.",
        ]}
        accentIndex={1}
      />
    </AbsoluteFill>
  );
};
