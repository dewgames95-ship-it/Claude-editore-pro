import { Composition } from "remotion";
import { MyComposition } from "./Composition";

// Vertical 720x1280 @ 30fps (reference videos jaisa)
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      width={720}
      height={1280}
    />
  );
};
