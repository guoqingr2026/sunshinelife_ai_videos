import { ManimRule, parseShotLine, parseShotPlanArticle } from "./shot-plan-parser";
import { getActiveManimRules, getFixedShots } from "./shot-plan-store";
import { resolveManimType, resolveRemotionType } from "./shot-plan-spec";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  name?: string;
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

export interface VideoPlan {
  title: string;
  timeline: TimelineItem[];
  manimJobs: ManimJob[];
  theme: ThemeConfig;
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

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function detectManimTypes(brief: string, rules: ManimRule[]): ManimRule[] {
  const n = normalize(brief);
  const found: ManimRule[] = [];
  const used = new Set<string>();

  for (const rule of rules) {
    if (used.has(rule.type)) continue;
    if (rule.keywords.some((kw) => n.includes(normalize(kw)))) {
      found.push(rule);
      used.add(rule.type);
    }
  }
  return found.slice(0, 4);
}

function extractTitle(brief: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const firstLine = brief.split(/\n/)[0]?.trim();
  if (firstLine && firstLine.length <= 40) return firstLine.replace(/^[#\-\d.\s]+/, "");
  return "科普视频";
}

function extractQuote(brief: string): string {
  const lines = brief.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const quoteLine = lines.find((l) => l.length >= 6 && l.length <= 60);
  return quoteLine || "理解优先于记忆";
}

function extractBullets(brief: string): string[] {
  const lines = brief
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => /^[-*•\d]+[.)]?\s*/.test(l) || (l.length > 2 && l.length < 40));

  const bullets = lines
    .map((l) => l.replace(/^[-*•\d]+[.)]?\s*/, "").trim())
    .filter((l) => l.length > 1 && l.length < 50);

  if (bullets.length >= 2) return bullets.slice(0, 6);

  const parts = brief
    .split(/[，,；;。]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 4 && p.length <= 30);

  return parts.slice(0, 4);
}

function pickTheme(brief: string): ThemeConfig {
  const n = normalize(brief);
  if (/pn|mosfet|半导体|电路|buck|llc|能带/.test(n)) return THEMES[1];
  if (/学习|记忆|遗忘|费曼|技巧/.test(n)) return THEMES[0];
  return THEMES[2];
}

interface SequenceItem {
  kind: "manim" | "remotion";
  type: string;
  label: string;
  params?: Record<string, unknown>;
}

/** 从「视频要求」正文解析 GPT 分镜行（type | 标签） */
function parseBriefSequence(brief: string): SequenceItem[] {
  const fromArticle = parseShotPlanArticle(brief);
  if (fromArticle.shots.length > 0) {
    return fromArticle.shots
      .map((s) => {
        const manim = resolveManimType(s.type);
        if (manim) return { kind: "manim" as const, type: manim, label: s.label, params: s.params };
        const remotion = resolveRemotionType(s.type);
        if (remotion) return { kind: "remotion" as const, type: remotion, label: s.label, params: s.params };
        return null;
      })
      .filter(Boolean) as SequenceItem[];
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

function remotionItemFromSequence(item: SequenceItem): TimelineItem {
  switch (item.type) {
    case "chapter":
      return { type: "chapter", durationInFrames: 90, title: item.label };
    case "bullet_list":
      return {
        type: "bullet_list",
        durationInFrames: 120,
        title: item.label,
        items: ["要点一", "要点二", "要点三"],
      };
    case "flow_steps":
      return { type: "flow_steps", durationInFrames: 150, steps: ["输入", "理解", "输出"] };
    case "quote":
      return { type: "quote", durationInFrames: 100, quote: item.label, author: "" };
    case "fade_text":
      return { type: "fade_text", durationInFrames: 90, text: item.label };
    default:
      return { type: "chapter", durationInFrames: 90, title: item.label };
  }
}

export function planFromBrief(brief: string, title?: string): VideoPlan {
  const videoTitle = extractTitle(brief, title);
  const rules = getActiveManimRules();
  const fixedShots = getFixedShots();
  const briefSequence = parseBriefSequence(brief);
  const timeline: TimelineItem[] = [];
  const manimJobs: ManimJob[] = [];

  timeline.push({ type: "title", durationInFrames: 120, title: videoTitle });
  timeline.push({
    type: "quote",
    durationInFrames: 100,
    quote: extractQuote(brief),
    author: "",
  });

  if (briefSequence.length > 0) {
    for (const item of briefSequence) {
      if (item.kind === "remotion") {
        timeline.push(remotionItemFromSequence(item));
        continue;
      }
      timeline.push({ type: "chapter", durationInFrames: 90, title: item.label });
      const idx = timeline.length;
      timeline.push({
        type: "manim_placeholder",
        durationInFrames: 150,
        title: item.label,
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
  } else {
    const typesToRender: ManimRule[] =
      fixedShots.length > 0
        ? fixedShots.map((s) => ({
            keywords: [],
            type: resolveManimType(s.type) || s.type,
            label: s.label,
            params: s.params,
          }))
        : detectManimTypes(brief, rules).length > 0
          ? detectManimTypes(brief, rules)
          : [
              {
                keywords: [],
                type: "concept_network",
                label: "核心概念",
                params: {
                  center: videoTitle.slice(0, 10),
                  nodes: ["背景", "原理", "应用", "总结"],
                },
              },
            ];

    for (const m of typesToRender) {
      timeline.push({ type: "chapter", durationInFrames: 90, title: m.label });
      const idx = timeline.length;
      timeline.push({
        type: "manim_placeholder",
        durationInFrames: 150,
        title: m.label,
        manimType: m.type,
        _autoManim: true,
      });
      manimJobs.push({
        timelineIndex: idx,
        type: m.type,
        label: m.label,
        params: m.params,
      });
    }
  }

  const bullets = extractBullets(brief);
  if (bullets.length >= 2) {
    timeline.push({
      type: "bullet_list",
      durationInFrames: 150,
      title: "核心要点",
      items: bullets,
    });
  }

  if (/学习|记忆|复习|间隔/.test(normalize(brief))) {
    timeline.push({
      type: "flow_steps",
      durationInFrames: 150,
      steps: ["观察", "理解", "回忆", "应用"],
    });
    timeline.push({
      type: "timeline_bar",
      durationInFrames: 150,
      title: "复习节奏",
      events: ["第1天", "第3天", "第7天", "第30天"],
    });
  }

  if (/公式|欧姆|功率/.test(normalize(brief))) {
    timeline.push({
      type: "formula_card",
      durationInFrames: 120,
      caption: "核心公式",
      formula: "V = I × R",
    });
  }

  timeline.push({
    type: "fade_text",
    durationInFrames: 90,
    text: "感谢观看 · 点赞收藏",
  });

  return {
    title: videoTitle,
    timeline,
    manimJobs,
    theme: pickTheme(brief),
  };
}
