import type { TimelineItem } from "./plan-timeline";

export const COMPOSITE_TYPES = new Set(["composite_split", "composite_pip"]);

export type VideoAspect = "16:9" | "9:16";

export interface GlobalOverlaySpec {
  mode: "split" | "pip";
  overlaySourceUrl: string;
  mainRatio?: number;
  overlayRatio?: number;
  pipPosition?: string;
  pipWidthRatio?: number;
  pipMargin?: number;
  /** 实拍短于成片时循环；globalOverlay 默认 true */
  loop?: boolean;
}

function resolveOverlayLoop(raw: Record<string, unknown>): boolean {
  if (raw.loop === false || raw.loop === "false" || raw.loop === 0) return false;
  return true;
}

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

function globalOverlayMode(
  project?: { globalOverlay?: Record<string, unknown> }
): "split" | "pip" | null {
  const raw = project?.globalOverlay;
  if (!raw || typeof raw !== "object") return null;
  const type = String(raw.type || raw.mode || "split").toLowerCase();
  if (type === "composite_pip" || type === "pip") return "pip";
  return "split";
}

/** 全片贯穿实拍层（project.globalOverlay），与单镜 composite_* 互斥使用 */
export function resolveGlobalOverlay(
  project?: { globalOverlay?: Record<string, unknown> },
  toMediaUrl: (publicPath: string) => string = (p) => p
): GlobalOverlaySpec | undefined {
  const raw = project?.globalOverlay;
  if (!raw || typeof raw !== "object") return undefined;

  const videoPath = overlayVideoPath(raw);
  if (!videoPath) return undefined;

  const loop = resolveOverlayLoop(raw);
  const mode = globalOverlayMode(project);
  if (mode === "pip") {
    return {
      mode: "pip",
      overlaySourceUrl: toMediaUrl(videoPath),
      pipPosition: String(raw.pipPosition || "top-right"),
      pipWidthRatio: Number(raw.pipWidthRatio ?? 0.28),
      pipMargin: Number(raw.pipMargin ?? 24),
      loop,
    };
  }

  return {
    mode: "split",
    overlaySourceUrl: toMediaUrl(videoPath),
    mainRatio: Number(raw.mainRatio ?? 0.6),
    overlayRatio: Number(raw.overlayRatio ?? 0.4),
    loop,
  };
}

export function resolveProjectAspect(
  project?: {
    aspect?: string;
    shots?: Array<{ type: string }>;
    globalOverlay?: Record<string, unknown>;
  },
  timeline?: TimelineItem[]
): VideoAspect {
  const raw = String(project?.aspect || "").trim();
  if (raw === "9:16" || raw === "16:9") return raw;

  if (globalOverlayMode(project) === "split") return "9:16";

  const shots = project?.shots || [];
  if (shots.some((s) => s.type === "composite_split")) return "9:16";

  if (timeline?.some((t) => t.type === "composite_split")) return "9:16";

  return "16:9";
}
