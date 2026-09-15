import "./index.css";
import { Composition, Folder } from "remotion";
import { TOTAL_FRAMES as MCP_LAUNCH_FRAMES } from "./mcp-launch/timeline";
import { McpLaunchVideo } from "./mcp-launch/Video";
import { ReleaseVideo } from "./release/ReleaseVideo";
import { compositionId, releaseTimeline } from "./release/timeline";
import { RELEASES } from "./releases";
import { FPS, HEIGHT, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Announcements">
      <Composition
        id="McpLaunch"
        component={McpLaunchVideo}
        durationInFrames={MCP_LAUNCH_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>
    <Folder name="Releases">
      {RELEASES.map((release) => (
        <Composition
          key={release.tag}
          id={compositionId(release.tag)}
          component={ReleaseVideo}
          durationInFrames={releaseTimeline(release).total}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ release }}
        />
      ))}
    </Folder>
  </>
);
