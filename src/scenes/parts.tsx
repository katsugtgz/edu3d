import type { PerspectiveCamera } from "three";
import { useThree } from "@react-three/fiber";
import { random, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/* ------------------------------------------------------------------ */
/* Deterministic math helpers (frame-driven, no Math.random anywhere). */
/* ------------------------------------------------------------------ */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const easeOutCubic = (x: number): number =>
  1 - Math.pow(1 - clamp01(x), 3);

export const easeInOut = (x: number): number => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

/**
 * Per-frame camera pose. Deterministic: the pose function receives the
 * current (sequence-relative) frame and sets position/lookAt directly.
 */
export const CameraRig: React.FC<{
  pose: (frame: number) => CameraPose;
}> = ({ pose }) => {
  const camera = useThree((state) => state.camera);
  const frame = useCurrentFrame();

  const p = pose(frame);
  camera.position.set(p.position[0], p.position[1], p.position[2]);
  camera.lookAt(p.target[0], p.target[1], p.target[2]);
  if (p.fov !== undefined) {
    const cam = camera as PerspectiveCamera;
    if (cam.fov !== p.fov) {
      cam.fov = p.fov;
      cam.updateProjectionMatrix();
    }
  }
  return null;
};

/* ------------------------------------------------------------------ */
/* Atmosphere                                                          */
/* ------------------------------------------------------------------ */

/** Scene background + matching fog (depth cue; no shadow maps anywhere). */
export const SceneAtmosphere: React.FC<{
  color: string;
  fogNear: number;
  fogFar: number;
}> = ({ color, fogNear, fogFar }) => (
  <>
    <color attach="background" args={[color]} />
    <fog attach="fog" args={[color, fogNear, fogFar]} />
  </>
);

/** Large unlit plane behind the scene; excluded from fog so it stays split/flat. */
export const BackdropPlane: React.FC<{
  color: string;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
}> = ({ color, x = 0, y = 6, z = -14, width = 44, height = 26 }) => (
  <mesh position={[x, y, z]}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial color={color} fog={false} />
  </mesh>
);

export const GroundPlane: React.FC<{
  color?: string;
  size?: number;
}> = ({ color = "#0A0E18", size = 90 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

/* ------------------------------------------------------------------ */
/* Landmark: ABSTRAKSI Bundaran HI (silinder + ornamen atas)           */
/* ------------------------------------------------------------------ */

export const Monument: React.FC<{
  position?: [number, number, number];
  scale?: number;
  color?: string;
}> = ({ position = [0, 0, -7], scale = 1, color = "#232C40" }) => (
  <group position={position} scale={scale}>
    {/* alas */}
    <mesh position={[0, 0.18, 0]}>
      <cylinderGeometry args={[1.15, 1.35, 0.36, 16]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    {/* batang silinder */}
    <mesh position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.42, 0.55, 2.4, 12]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    {/* mahkota */}
    <mesh position={[0, 2.85, 0]}>
      <cylinderGeometry args={[0.85, 0.7, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    {/* ornamen atas: cincin + bulatan menyala */}
    <mesh position={[0, 3.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.5, 0.07, 8, 24]} />
      <meshStandardMaterial
        color={theme.accentYellow}
        emissive={theme.accentYellow}
        emissiveIntensity={0.7}
        roughness={0.4}
      />
    </mesh>
    <mesh position={[0, 3.45, 0]}>
      <sphereGeometry args={[0.18, 10, 8]} />
      <meshStandardMaterial
        color={theme.accentYellow}
        emissive={theme.accentYellow}
        emissiveIntensity={0.6}
        roughness={0.4}
      />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ */
/* City + crowd silhouettes (seeded via remotion random => deterministic) */
/* ------------------------------------------------------------------ */

export const CitySilhouette: React.FC<{
  z?: number;
  count?: number;
  seed?: string;
  color?: string;
  spread?: number;
}> = ({ z = -10, count = 14, seed = "city", color = "#111827", spread = 34 }) => {
  const buildings = new Array(count).fill(0).map((_, i) => ({
    x:
      -spread / 2 +
      (spread * i) / Math.max(1, count - 1) +
      (random(`${seed}-x-${i}`) - 0.5) * 1.4,
    zJit: (random(`${seed}-z-${i}`) - 0.5) * 3,
    h: 1.4 + random(`${seed}-h-${i}`) * 4.6,
    w: 1.0 + random(`${seed}-w-${i}`) * 1.5,
  }));
  return (
    <group position={[0, 0, z]}>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.zJit]}>
          <boxGeometry args={[b.w, b.h, 1.1]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

export type CrowdProps = {
  count: number;
  seed: string;
  xRange: [number, number];
  zRange: [number, number];
  height?: number;
  color?: string;
  /** Floating warm lantern above each figure (hook beat). */
  lantern?: boolean;
  /** Sway amplitude multiplier. */
  sway?: number;
};

/** Low-poly faceless silhouette crowd: box body + low-seg sphere head. */
export const Crowd: React.FC<CrowdProps> = ({
  count,
  seed,
  xRange,
  zRange,
  height = 1,
  color = "#060A13",
  lantern = false,
  sway = 1,
}) => {
  const frame = useCurrentFrame();

  const figures = new Array(count).fill(0).map((_, i) => {
    const h = height * (0.78 + random(`${seed}-h-${i}`) * 0.5);
    return {
      x: xRange[0] + random(`${seed}-x-${i}`) * (xRange[1] - xRange[0]),
      z: zRange[0] + random(`${seed}-z-${i}`) * (zRange[1] - zRange[0]),
      h,
      phase: random(`${seed}-p-${i}`) * Math.PI * 2,
      lanternX: (random(`${seed}-lx-${i}`) - 0.5) * 0.4,
      // Lampion mengambang rendah tepat di atas kepala figur — tidak
      // pernah masuk zona UI atas (140 px pertama layar).
      lanternY: h * 0.85 + 0.45,
    };
  });

  return (
    <group>
      {figures.map((f, i) => (
        <group
          key={i}
          position={[f.x, 0, f.z]}
          rotation={[0, 0, Math.sin(frame * 0.06 + f.phase) * 0.035 * sway]}
        >
          <mesh position={[0, f.h * 0.3, 0]}>
            <boxGeometry args={[0.34, f.h * 0.6, 0.22]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
          <mesh position={[0, f.h * 0.68, 0]}>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
          {lantern ? (
            <mesh
              position={[f.lanternX, f.lanternY + Math.sin(frame * 0.1 + f.phase) * 0.08, 0]}
            >
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial
                color="#FFB35C"
                emissive="#FFB35C"
                emissiveIntensity={2.2}
                roughness={0.5}
              />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Lanterns (independent of crowd figures, frustum-safe)               */
/* ------------------------------------------------------------------ */

/**
 * Lampion melayang rendah. Posisi diparametrisasi via sudut layar
 * (+-8.3 deg, jauh di dalam setengah-FOV horizontal ~12.2 deg) sehingga
 * tidak pernah menyentuh tepi kiri/kanan frame maupun zona UI atas.
 */
export const Lanterns: React.FC<{
  count?: number;
  seed?: string;
  /** Camera z at the held end of the shot. */
  cameraZ?: number;
  color?: string;
}> = ({ count = 12, seed = "lantern", cameraZ = 6.6, color = "#FFB35C" }) => {
  const frame = useCurrentFrame();

  const items = new Array(count).fill(0).map((_, i) => {
    const dz = 4.5 + random(`${seed}-d-${i}`) * 4.5; // 4.5..9 dari kamera
    const ang = (random(`${seed}-a-${i}`) * 2 - 1) * 0.145; // rad, +-8.3 deg
    return {
      x: Math.tan(ang) * dz,
      y: 1.05 + random(`${seed}-y-${i}`) * 0.6,
      z: cameraZ - dz,
      phase: random(`${seed}-p-${i}`) * Math.PI * 2,
    };
  });

  return (
    <group>
      {items.map((l, i) => (
        <mesh
          key={i}
          position={[l.x, l.y + Math.sin(frame * 0.1 + l.phase) * 0.08, l.z]}
        >
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.2}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Coin (low-seg cylinder)                                             */
/* ------------------------------------------------------------------ */

export const Coin: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  color?: string;
  /** Uniform scale; used by flow coins to shrink out before frame edges. */
  scale?: number;
}> = ({
  position,
  rotation = [Math.PI / 2, 0, 0],
  radius = 0.12,
  color = theme.accentYellow,
  scale = 1,
}) => (
  <mesh position={position} rotation={rotation} scale={scale}>
    <cylinderGeometry args={[radius, radius, radius * 0.22, 14]} />
    <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
  </mesh>
);
