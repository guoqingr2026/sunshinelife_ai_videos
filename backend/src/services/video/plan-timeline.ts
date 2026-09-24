import {
  ManimRule,
  normalizeShot,
  parseShotLine,
  parseShotPlanArticle,
  ShotSpec,
} from "./shot-plan-parser";
import { getActiveManimRules, getFixedShots } from "./shot-plan-store";
import { isCompositeType } from "./composite-shots";
import { resolveManimType, resolveRemotionType } from "./shot-plan-spec";
import { enrichManimParams, remotionFieldsFromShot } from "./shot-params";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  name?: string;
  fontFamily?: string;
  fontPresetId?: string;
  manimCjkFont?: string;
}

export interface TimelineItem {
  type: string;
  durationInFrames?: number;
  title?: string;
  text?: string;
  quote?: string;
  author?: string;
  items?: string[];
  steps?: string[];
  events?: string[];
  params?: Record<string, unknown>;
  manimType?: string;
  sourceUrl?: string;
  formula?: string;
  caption?: string;
  value?: string;
  label?: string;
  _autoManim?: boolean;
}

export interface ManimJob {
  timelineIndex: number;
  type: string;
  label: string;
  params?: Record<string, unknown>;
}

export interface GlobalOverlayProject {
  /** split = 竖屏底栏实拍；pip = 横屏画中画 */
  mode?: "split" | "pip";
  type?: "composite_split" | "composite_pip" | string;
  videoPath?: string;
  mainRatio?: number;
  overlayRatio?: number;
  pipPosition?: string;
  pipWidthRatio?: number;
  pipMargin?: number;
  /** 实拍短于成片时循环；默认 true */
  loop?: boolean;
  overlay?: { videoPath?: string };
}

export interface VideoProject {
  title?: string;
  theme?: ThemeConfig;
  shots?: ShotSpec[];
  /** 成片画幅；含 composite_split / globalOverlay.split 时默认 9:16 */
  aspect?: "16:9" | "9:16";
  /** 全片贯穿的实拍层（从第 0 帧到结尾，视频连续播放） */
  globalOverlay?: GlobalOverlayProject;
  /** 为 true 时在显式 shots 外再自动加标题/引言/片尾；默认 false（完全按 JSON 顺序） */
  autoWrap?: boolean;
  /**
   * 成片清晰度（Skill / JSON 可写死）
   * - high：Remotion 全分辨率 + Manim -qh（默认推荐）
   * - medium：Remotion 全分辨率 + Manim -qm
   * - preview：Remotion 半分辨率 + Manim -ql（试跑）
   */
  renderQuality?: "high" | "medium" | "preview";
}

export interface VideoPlan {
  title: string;
  timeline: TimelineItem[];
  manimJobs: ManimJob[];
  theme: ThemeConfig;
  resolvedShots: Array<{ kind: string; type: string; label: string }>;
}

const THEMES: ThemeConfig[] = [
  {
    name: "学术紫",
    primaryColor: "#a855f7",
    secondaryColor: "#312e81",
    backgroundColor: "#1e1b2e",
    accentColor: "#f472b6",
  },
  {
    name: "半导体绿",
    primaryColor: "#00c896",
    secondaryColor: "#1a3d2e",
    backgroundColor: "#0d1f17",
    accentColor: "#ffd166",
  },
  {
    name: "科技蓝",
    primaryColor: "#00d4ff",
    secondaryColor: "#1b3a57",
    backgroundColor: "#0a1628",
    accentColor: "#7b68ee",
  },
];

interface SequenceItem {
  kind: "manim" | "remotion";
  type: string;
  label: string;
  params?: Record<string, unknown>;
  durationInFrames?: number;
}

const DEFAULT_MANIM_FRAMES = 150;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function extractMainManimShot(composite: ShotSpec): ShotSpec {
  const mainRaw = composite.params?.main;
  if (mainRaw && typeof mainRaw === "object" && !Array.isArray(mainRaw)) {
    const merged = normalizeShot({
      ...(mainRaw as Record<string, unknown>),
      label: composite.label,
      durationInFrames: composite.durationInFrames,
    });
    if (merged) return merged;
  }
  return {
    type: "typewriter_text",
    label: composite.label,
    params: { text: composite.label, subtitle: "" },
    durationInFrames: composite.durationInFrames,
  };
}

function shotSpecToSequence(shots: ShotSpec[]): SequenceItem[] {
  const items: SequenceItem[] = [];
  for (const raw of shots) {
    const s = normalizeShot(raw);
    if (!s) continue;
    if (isCompositeType(s.type)) {
      const main = extractMainManimShot(s);
      const manimType = resolveManimType(main.type);
      if (manimType) {
        items.push({
          kind: "manim",
          type: manimType,
          label: s.label,
          params: enrichManimParams(manimType, s.label, main.params),
          durationInFrames: s.durationInFrames,
        });
      }
      items.push({
        kind: "remotion",
        type: s.type,
        label: s.label,
        params: s.params,
        durationInFrames: s.durationInFrames,
      });
      continue;
    }
    const manim = resolveManimType(s.type);
    if (manim) {
      items.push({
        kind: "manim",
        type: manim,
        label: s.label,
        params: enrichManimParams(manim, s.label, s.params),
        durationInFrames: s.durationInFrames,
      });
      continue;
    }
    const remotion = resolveRemotionType(s.type);
    if (remotion) {
      items.push({
        kind: "remotion",
        type: remotion,
        label: s.label,
        params: s.params,
        durationInFrames: s.durationInFrames,
      });
    }
  }
  return items;
}

function parseBriefSequence(brief: string): SequenceItem[] {
  const fromArticle = parseShotPlanArticle(brief);
  if (fromArticle.shots.length > 0) {
    return shotSpecToSequence(fromArticle.shots);
  }

  const items: SequenceItem[] = [];
  for (const line of brief.split(/\n/)) {
    const shot = parseShotLine(line);
    if (!shot) continue;
    const manim = resolveManimType(shot.type);
    if (manim) {
      items.push({ kind: "manim", type: manim, label: shot.label, params: shot.params });
      continue;
    }
    const remotion = resolveRemotionType(shot.type);
    if (remotion) {
      items.push({ kind: "remotion", type: remotion, label: shot.label, params: shot.params });
    }
  }
  return items;
}

/** 分镜优先级：project.shots > brief 内 JSON > 镜头规划已保存 shots > 关键词猜测 */
export function resolveVideoSequence(
  brief: string,
  project?: VideoProject
): SequenceItem[] {
  if (project?.shots?.length) {
    return shotSpecToSequence(project.shots);
  }
  const fromBrief = parseBriefSequence(brief);
  if (fromBrief.length > 0) return fromBrief;

  const saved = getFixedShots();
  if (saved.length > 0) return shotSpecToSequence(saved);

  return [];
}

function detectManimTypes(brief: string, rules: ManimRule[]): ManimRule[] {
  const n = normalize(brief);
  const found: ManimRule[] = [];
  const used = new Set<string>();

  for (const rule of rules) {
    if (used.has(rule.type)) continue;
    if (rule.keywords.some((kw) => n.includes(normalize(kw)))) {
      const resolved = resolveManimType(rule.type);
      if (resolved) {
        found.push({ ...rule, type: resolved });
        used.add(resolved);
      }
    }
  }
  return found.slice(0, 4);
}

function extractTitle(brief: string, explicit?: string, project?: VideoProject): string {
  if (project?.title?.trim()) return project.title.trim();
  if (explicit?.trim()) return explicit.trim();
  const firstLine = brief.split(/\n/)[0]?.trim();
  if (firstLine && firstLine.length <= 40 && !firstLine.startsWith("{")) {
    return firstLine.replace(/^[#\-\d.\s]+/, "");
  }
  return "科普视频";
}

function extractQuote(brief: string): string {
  const lines = brief.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const quoteLine = lines.find((l) => l.length >= 6 && l.length <= 60 && !l.startsWith("{"));
  return quoteLine || "理解优先于记忆";
}

function extractBullets(brief: string): string[] {
  const lines = brief
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => /^[-*•\d]+[.)]?\s*/.test(l));

  const bullets = lines
    .map((l) => l.replace(/^[-*•\d]+[.)]?\s*/, "").trim())
    .filter((l) => l.length > 1 && l.length < 50);

  return bullets.slice(0, 6);
}

function pickTheme(brief: string): ThemeConfig {
  const n = normalize(brief);
  if (/pn|mosfet|半导体|电路|buck|llc|能带/.test(n)) return THEMES[1];
  if (/学习|记忆|遗忘|费曼|技巧/.test(n)) return THEMES[0];
  return THEMES[2];
}

function remotionItemFromSequence(item: SequenceItem): TimelineItem {
  return remotionFieldsFromShot(
    item.type,
    item.label,
    item.params,
    item.durationInFrames
  ) as TimelineItem;
}

function appendSequence(
  sequence: SequenceItem[],
  timeline: TimelineItem[],
  manimJobs: ManimJob[]
): void {
  for (const item of sequence) {
    if (item.kind === "remotion") {
      if (isCompositeType(item.type)) {
        const mainIdx = timeline.length - 1;
        const wired = remotionItemFromSequence(item);
        timeline.push({
          ...wired,
          params: {
            ...(wired.params || {}),
            _mainManimTimelineIndex: mainIdx,
          },
        });
        continue;
      }
      timeline.push(remotionItemFromSequence(item));
      continue;
    }
    const idx = timeline.length;
    timeline.push({
      type: "manim_placeholder",
      durationInFrames: item.durationInFrames || DEFAULT_MANIM_FRAMES,
      title:
        (typeof item.params?.title === "string" && item.params.title) ||
        item.label,
      manimType: item.type,
      _autoManim: true,
    });
    manimJobs.push({
      timelineIndex: idx,
      type: item.type,
      label: item.label,
      params: item.params,
    });
  }
}

export function planFromBrief(
  brief: string,
  title?: string,
  project?: VideoProject
): VideoPlan {
  const videoTitle = extractTitle(brief, title, project);
  const rules = getActiveManimRules();
  const sequence = resolveVideoSequence(brief, project);
  const timeline: TimelineItem[] = [];
  const manimJobs: ManimJob[] = [];
  const hasExplicitShots = (project?.shots?.length ?? 0) > 0;
  const autoWrap = project?.autoWrap === true;

  const hasTitleShot = sequence.some((s) => s.kind === "remotion" && s.type === "title");
  if ((!hasExplicitShots || autoWrap) && !hasTitleShot) {
    timeline.push({ type: "title", durationInFrames: 120, title: videoTitle });
    timeline.push({
      type: "quote",
      durationInFrames: 100,
      quote: extractQuote(brief),
      author: "",
    });
  }

  if (sequence.length > 0) {
    appendSequence(sequence, timeline, manimJobs);
  } else if (!hasExplicitShots) {
    const typesToRender =
      detectManimTypes(brief, rules).length > 0
        ? detectManimTypes(brief, rules)
        : [
            {
              keywords: [],
              type: "forgetting_curve",
              label: "遗忘曲线",
              params: { title: "遗忘曲线" },
            },
            {
              keywords: [],
              type: "typewriter_text",
              label: "学习技巧",
              params: { text: "在此填写口播文案", subtitle: "" },
            },
          ];

    for (const m of typesToRender) {
      const idx = timeline.length;
      const manimParams = enrichManimParams(m.type, m.label, m.params);
      timeline.push({
        type: "manim_placeholder",
        durationInFrames: 150,
        title:
          (typeof manimParams.title === "string" && manimParams.title) ||
          m.label,
        manimType: m.type,
        _autoManim: true,
      });
      manimJobs.push({
        timelineIndex: idx,
        type: m.type,
        label: m.label,
        params: manimParams,
      });
    }
  }

  const bullets = extractBullets(brief);
  if ((!hasExplicitShots || autoWrap) && bullets.length >= 2) {
    timeline.push({
      type: "bullet_list",
      durationInFrames: 150,
      title: "核心要点",
      items: bullets,
    });
  }

  if (!hasExplicitShots || autoWrap) {
    timeline.push({
      type: "fade_text",
      durationInFrames: 90,
      text: "感谢观看 · 点赞收藏",
    });
  }

  const autoTheme = pickTheme(brief);
  const theme = project?.theme ? { ...autoTheme, ...project.theme } : autoTheme;

  return {
    title: videoTitle,
    timeline,
    manimJobs,
    theme,
    resolvedShots: sequence.map((s) => ({
      kind: s.kind,
      type: s.type,
      label: s.label,
    })),
  };
}
