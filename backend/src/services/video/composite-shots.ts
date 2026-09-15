import type { TimelineItem } from "./plan-timeline";

export const COMPOSITE_TYPES = new Set(["composite_split", "composite_pip"]);

export type VideoAspect = "16:9" | "9:16";

export function isCompositeType(type: string): boolean {
  return COMPOSITE_TYPES.has(type.trim().toLowerCase());
}

function overlayVideoPath(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const overlay = params.overlay;
  if (overlay && typeof overlay === "object" && !Array.isArray(overlay)) {
    const v = (overlay as Record<string, unknown>).videoPath;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const direct = params.videoPath;
  return typeof direct === "string" ? direct.trim() : "";
}

/** Wire composite slots to rendered Manim clips; omit consumed manim_clip rows. */
export function prepareRemotionTimeline(
  timeline: TimelineItem[],
  toMediaUrl: (publicPath: string) => string
): TimelineItem[] {
  const consumed = new Set<number>();
  const result: TimelineItem[] = [];

  for (let i = 0; i < timeline.length; i++) {
    if (consumed.has(i)) continue;

    const item = timeline[i];
    if (!isCompositeType(item.type)) {
      result.push(item);
      continue;
    }

    const mainIdx = Number(item.params?._mainManimTimelineIndex);
    const mainClip = timeline[mainIdx];
    if (!mainClip?.sourceUrl) {
      throw new Error(
        `合成镜头「${item.title || item.type}」缺少 Manim 主画面（索引 ${mainIdx}）`
      );
    }

    const videoPath = overlayVideoPath(item.params);
    if (!videoPath) {
      throw new Error(
        `合成镜头「${item.title || item.type}」缺少 params.videoPath（上传素材路径）`
      );
    }

    consumed.add(mainIdx);
    const frames = mainClip.durationInFrames || item.durationInFrames || 150;

    result.push({
      type: item.type,
      durationInFrames: frames,
      title: item.title,
      params: {
        ...item.params,
        mainSourceUrl: mainClip.sourceUrl,
        overlaySourceUrl: toMediaUrl(videoPath),
      },
    });
  }

  return result;
}

export function resolveProjectAspect(
  project?: { aspect?: string; shots?: Array<{ type: string }> },
  timeline?: TimelineItem[]
): VideoAspect {
  const raw = String(project?.aspect || "").trim();
  if (raw === "9:16" || raw === "16:9") return raw;

  const shots = project?.shots || [];
  if (shots.some((s) => s.type === "composite_split")) return "9:16";

  if (timeline?.some((t) => t.type === "composite_split")) return "9:16";

  return "16:9";
}
