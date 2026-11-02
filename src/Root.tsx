import { Composition } from "remotion";
import { EduMain } from "./EduMain";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EduMain"
      component={EduMain}
      // Total naskah: 80 + 135 + 180 + 270 + 105 + 150 = 920 frame (30,67s @ 30fps).
      durationInFrames={920}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
