import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { LeadVideo, TOTAL } from "./LeadVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LeadVideo" component={LeadVideo} durationInFrames={TOTAL} fps={30} width={720} height={1280} />
      <Composition id="MyVideo" component={MyComposition} durationInFrames={150} fps={30} width={720} height={1280} />
    </>
  );
};
