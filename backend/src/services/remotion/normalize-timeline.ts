import { TimelineItem } from "./render";

export function normalizeTimeline(timeline: TimelineItem[]): TimelineItem[] {
  return timeline.map((item) => {
    const raw = item as TimelineItem & {
      scene?: string;
      description?: string;
    };

    if (raw.type === "manim") {
      return {
        type: "manim_placeholder",
        durationInFrames: raw.durationInFrames || 150,
        title: raw.scene || raw.title || "Manim Scene",
        params: { 说明: raw.description || "请先在 Manim 页渲染，再用 manim_clip 插入" },
      };
    }

    if (raw.type === "hyperframes") {
      return {
        type: "hyperframes_placeholder",
        durationInFrames: raw.durationInFrames || 150,
        title: raw.title || "HyperFrames",
        params: { 说明: raw.description || "请先在 HyperFrames 页渲染，再用 hyperframes_clip 插入" },
      };
    }

    return item;
  });
}
