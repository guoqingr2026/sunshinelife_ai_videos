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

interface ManimRule {
  keywords: string[];
  type: string;
  label: string;
  params?: Record<string, unknown>;
}

const MANIM_RULES: ManimRule[] = [
  { keywords: ["pn结", "pn 结", "pn"], type: "pn_junction", label: "PN 结" },
  { keywords: ["能带", "导带", "价带"], type: "band_structure", label: "能带结构" },
  { keywords: ["mosfet", "沟道", "场效应"], type: "mosfet_channel", label: "MOSFET" },
  { keywords: ["buck", "降压", "开关电源"], type: "buck_converter", label: "Buck 拓扑" },
  { keywords: ["llc", "谐振"], type: "llc_resonant", label: "LLC 谐振" },
  { keywords: ["电流", "电阻", "欧姆", "电路"], type: "current_arrow", label: "电路电流" },
  { keywords: ["波形", "正弦", "频率", "hz"], type: "sine_waveform", label: "波形" },
  { keywords: ["光子", "击穿"], type: "photon_breakdown", label: "光子激发" },
  { keywords: ["半导体层", "多层"], type: "semiconductor_layers", label: "半导体层" },
  { keywords: ["遗忘", "艾宾浩斯", "记忆曲线"], type: "forgetting_curve", label: "遗忘曲线" },
  { keywords: ["学习效率", "学习曲线", "留存"], type: "learning_curve", label: "学习效率" },
  { keywords: ["间隔重复", "主动回忆", "费曼"], type: "typewriter_text", label: "学习技巧", params: { text: "主动回忆 · 间隔重复", subtitle: "学习技巧" } },
  { keywords: ["流程", "步骤"], type: "flowchart", label: "流程图", params: { steps: ["输入", "理解", "回忆", "输出"] } },
  { keywords: ["时间轴", "时间线"], type: "timeline_horizontal", label: "时间轴", params: { events: ["第1天", "第3天", "第7天", "第30天"] } },
  { keywords: ["概念", "知识树", "知识网络", "结构图"], type: "concept_network", label: "概念网络" },
  { keywords: ["函数", "sin", "曲线", "图像"], type: "function_graph", label: "函数曲线" },
  { keywords: ["向量", "合成"], type: "vector_sum", label: "向量" },
  { keywords: ["坐标", "坐标系"], type: "coordinate_grid", label: "坐标系" },
  { keywords: ["柱状", "统计", "图表"], type: "bar_chart", label: "数据统计" },
  { keywords: ["公式", "拆解"], type: "formula_steps", label: "公式拆解", params: { steps: ["P = V × I", "V = I × R", "P = I² × R"] } },
  { keywords: ["关键词", "高亮"], type: "keyword_pop", label: "关键词" },
  { keywords: ["层叠", "pcb", "结构"], type: "isometric_stack", label: "层叠结构" },
  { keywords: ["轨道", "旋转", "路径"], type: "orbit_paths", label: "轨道路径" },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function detectManimTypes(brief: string): ManimRule[] {
  const n = normalize(brief);
  const found: ManimRule[] = [];
  const used = new Set<string>();

  for (const rule of MANIM_RULES) {
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

export function planFromBrief(brief: string, title?: string): VideoPlan {
  const videoTitle = extractTitle(brief, title);
  const manimTypes = detectManimTypes(brief);
  const timeline: TimelineItem[] = [];
  const manimJobs: ManimJob[] = [];

  timeline.push({ type: "title", durationInFrames: 120, title: videoTitle });
  timeline.push({
    type: "quote",
    durationInFrames: 100,
    quote: extractQuote(brief),
    author: "",
  });

  const typesToRender =
    manimTypes.length > 0
      ? manimTypes
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
