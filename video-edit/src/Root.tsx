import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { LeadVideo, TOTAL } from "./LeadVideo";
import { SetupVideo, TOTAL_SETUP } from "./SetupVideo";
import { SetupLaunch43, TOTAL_43 } from "./SetupLaunch43";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LeadVideo" component={LeadVideo} durationInFrames={TOTAL} fps={30} width={720} height={1280} />
      <Composition id="SetupVideo" component={SetupVideo} durationInFrames={TOTAL_SETUP} fps={30} width={720} height={1280} />
      <Composition id="SetupLaunch43" component={SetupLaunch43} durationInFrames={TOTAL_43} fps={30} width={960} height={720} />
      <Composition id="MyVideo" component={MyComposition} durationInFrames={150} fps={30} width={720} height={1280} />
    </>
  );
};
