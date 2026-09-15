import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { clamp } from "../theme";
import { AgentTerminal } from "./scenes/AgentTerminal";
import { CallToAction } from "./scenes/CallToAction";
import { ExchangeCount } from "./scenes/ExchangeCount";
import { Intro } from "./scenes/Intro";
import { CAPTIONS, FPS, SCENES, sec } from "./timeline";

// The ccxt-mcp launch announcement: the reference for building a new announcement video.
const FLASHES = [
  { at: sec(4), strength: 0.85 },
  { at: sec(16), strength: 0.2 },
  { at: sec(26), strength: 0.2 },
  { at: sec(36), strength: 0.6 },
];

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = Math.max(
    ...FLASHES.map(({ at, strength }) =>
      frame >= at ? interpolate(frame, [at, at + 9], [strength, 0], clamp) : 0,
    ),
  );
  return <AbsoluteFill style={{ background: "#ffffff", opacity }} />;
};

export const McpLaunchVideo: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("music/mcp-launch.wav")} />
    <Backdrop />
    <Sequence
      from={SCENES.intro.from}
      durationInFrames={SCENES.intro.duration}
      premountFor={FPS}
    >
      <Intro />
    </Sequence>
    <Sequence
      from={SCENES.terminal.from}
      durationInFrames={SCENES.terminal.duration}
      premountFor={FPS}
    >
      <AgentTerminal />
    </Sequence>
    <Sequence
      from={SCENES.count.from}
      durationInFrames={SCENES.count.duration}
      premountFor={FPS}
    >
      <ExchangeCount />
    </Sequence>
    <Sequence
      from={SCENES.cta.from}
      durationInFrames={SCENES.cta.duration}
      premountFor={FPS}
    >
      <CallToAction />
    </Sequence>
    <Captions cues={CAPTIONS} />
    <Flash />
  </AbsoluteFill>
);
