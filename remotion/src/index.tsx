import React from "react";
import { registerRoot, Composition } from "remotion";
import {
  SimpleElectric,
  calculateTotalDuration,
  TimelineItem,
} from "./compositions/SimpleElectric";

const defaultTimeline: TimelineItem[] = [
  { type: "title", durationInFrames: 90, title: "低成本动画生产系统" },
  { type: "params", durationInFrames: 120, params: { voltage: "9V", current: "1A" } },
  { type: "arrow", durationInFrames: 90 },
  { type: "device_toggle", durationInFrames: 90 },
  { type: "chapter", durationInFrames: 90, title: "PN 结原理" },
];

const RemotionRoot: React.FC = () => {
  const duration = calculateTotalDuration(defaultTimeline);

  return (
    <>
      <Composition
        id="SimpleElectric"
        component={SimpleElectric}
        durationInFrames={duration}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          timeline: defaultTimeline,
          theme: { primaryColor: "#e94560" },
        }}
        calculateMetadata={({ props }) => {
          const p = props as { timeline: TimelineItem[]; aspect?: string };
          const vertical = p.aspect === "9:16";
          return {
            durationInFrames: calculateTotalDuration(p.timeline),
            width: vertical ? 1080 : 1920,
            height: vertical ? 1920 : 1080,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
