import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { LeadVideo, TOTAL } from "./LeadVideo";
import { SetupVideo, TOTAL_SETUP } from "./SetupVideo";
import { SetupLaunch43, TOTAL_43 } from "./SetupLaunch43";
import { Setup34, TOTAL_34 } from "./Setup34";
import { MeVideo, TOTAL_ME } from "./MeVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LeadVideo" component={LeadVideo} durationInFrames={TOTAL} fps={30} width={720} height={1280} />
      <Composition id="SetupVideo" component={SetupVideo} durationInFrames={TOTAL_SETUP} fps={30} width={720} height={1280} />
      <Composition id="SetupLaunch43" component={SetupLaunch43} durationInFrames={TOTAL_43} fps={30} width={960} height={720} />
      <Composition id="Setup34" component={Setup34} durationInFrames={TOTAL_34} fps={30} width={720} height={960} />
      <Composition id="MeVideo" component={MeVideo} durationInFrames={TOTAL_ME} fps={30} width={1280} height={720} />
      <Composition id="MyVideo" component={MyComposition} durationInFrames={150} fps={30} width={720} height={1280} />
    </>
  );
};
