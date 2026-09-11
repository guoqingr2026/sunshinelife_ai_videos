export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  name?: string;
}

export const COLOR_SCHEMES: ThemeConfig[] = [
  {
    name: "工程红",
    primaryColor: "#e94560",
    secondaryColor: "#0f3460",
    backgroundColor: "#1a1a2e",
    accentColor: "#f5a623",
  },
  {
    name: "科技蓝",
    primaryColor: "#00d4ff",
    secondaryColor: "#1b3a57",
    backgroundColor: "#0a1628",
    accentColor: "#7b68ee",
  },
  {
    name: "半导体绿",
    primaryColor: "#00c896",
    secondaryColor: "#1a3d2e",
    backgroundColor: "#0d1f17",
    accentColor: "#ffd166",
  },
  {
    name: "学术紫",
    primaryColor: "#a855f7",
    secondaryColor: "#312e81",
    backgroundColor: "#1e1b2e",
    accentColor: "#f472b6",
  },
  {
    name: "简约白",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    backgroundColor: "#f8fafc",
    accentColor: "#ef4444",
  },
  {
    name: "B站粉",
    primaryColor: "#fb7299",
    secondaryColor: "#23ade5",
    backgroundColor: "#141420",
    accentColor: "#ffe066",
  },
];

export interface TimelineModule {
  type: string;
  label: string;
  description: string;
  defaultItem: Record<string, unknown>;
}

export const TIMELINE_MODULES: TimelineModule[] = [
  {
    type: "title",
    label: "标题",
    description: "大标题开场",
    defaultItem: { type: "title", durationInFrames: 120, title: "视频标题" },
  },
  {
    type: "chapter",
    label: "章节",
    description: "章节切换",
    defaultItem: { type: "chapter", durationInFrames: 90, title: "第一章" },
  },
  {
    type: "params",
    label: "参数",
    description: "键值参数展示",
    defaultItem: {
      type: "params",
      durationInFrames: 120,
      params: { 电压: "9V", 电流: "1A" },
    },
  },
  {
    type: "bullet_list",
    label: "要点",
    description: "逐条要点列表",
    defaultItem: {
      type: "bullet_list",
      durationInFrames: 150,
      title: "核心要点",
      items: ["要点一", "要点二", "要点三"],
    },
  },
  {
    type: "subtitle",
    label: "字幕条",
    description: "底部字幕",
    defaultItem: {
      type: "subtitle",
      durationInFrames: 120,
      text: "这里是字幕内容",
    },
  },
  {
    type: "fade_text",
    label: "淡入文字",
    description: "过渡说明",
    defaultItem: {
      type: "fade_text",
      durationInFrames: 90,
      text: "过渡说明文字",
    },
  },
  {
    type: "compare",
    label: "对比",
    description: "左右对比卡片",
    defaultItem: {
      type: "compare",
      durationInFrames: 120,
      leftTitle: "Before",
      rightTitle: "After",
      leftText: "旧方法",
      rightText: "新方法",
    },
  },
  {
    type: "arrow",
    label: "箭头",
    description: "流程箭头",
    defaultItem: { type: "arrow", durationInFrames: 90 },
  },
  {
    type: "device_toggle",
    label: "器件",
    description: "开关亮灭",
    defaultItem: { type: "device_toggle", durationInFrames: 90 },
  },
  {
    type: "manim_clip",
    label: "Manim片段",
    description: "插入 Manim MP4",
    defaultItem: {
      type: "manim_clip",
      durationInFrames: 150,
      sourceUrl: "/files/manim/任务ID.mp4",
    },
  },
  {
    type: "hyperframes_clip",
    label: "HF片段",
    description: "插入 HyperFrames MP4",
    defaultItem: {
      type: "hyperframes_clip",
      durationInFrames: 150,
      sourceUrl: "/video/任务ID.mp4",
    },
  },
  {
    type: "quote",
    label: "引用",
    description: "名言/观点引用卡",
    defaultItem: {
      type: "quote",
      durationInFrames: 120,
      quote: "理解优先于记忆",
      author: "费曼",
    },
  },
  {
    type: "stat",
    label: "数据高亮",
    description: "大数字统计展示",
    defaultItem: {
      type: "stat",
      durationInFrames: 90,
      value: "80%",
      label: "记忆留存",
    },
  },
  {
    type: "flow_steps",
    label: "流程步骤",
    description: "横向编号步骤",
    defaultItem: {
      type: "flow_steps",
      durationInFrames: 150,
      steps: ["输入", "理解", "回忆", "应用"],
    },
  },
  {
    type: "timeline_bar",
    label: "时间轴",
    description: "Remotion 时间轴条",
    defaultItem: {
      type: "timeline_bar",
      durationInFrames: 150,
      title: "学习路径",
      events: ["入门", "理解", "练习", "掌握"],
    },
  },
  {
    type: "formula_card",
    label: "公式卡",
    description: "公式高亮展示",
    defaultItem: {
      type: "formula_card",
      durationInFrames: 120,
      caption: "核心公式",
      formula: "P = V × I",
    },
  },
  {
    type: "manim_placeholder",
    label: "Manim占位",
    description: "规划 Manim 片段位置",
    defaultItem: {
      type: "manim_placeholder",
      durationInFrames: 120,
      title: "Manim 动画",
      manimType: "forgetting_curve",
      note: "渲染后替换为 manim_clip",
    },
  },
];

export const BUILTIN_TEMPLATES = [
  {
    name: "科普开场",
    templateId: "simple-electric",
    timeline: [
      { type: "title", durationInFrames: 120, title: "科普视频标题" },
      { type: "bullet_list", durationInFrames: 150, title: "本期内容", items: ["背景", "原理", "应用"] },
      { type: "chapter", durationInFrames: 90, title: "开始" },
    ],
    theme: COLOR_SCHEMES[0],
  },
  {
    name: "学习方法",
    templateId: "simple-electric",
    timeline: [
      { type: "title", durationInFrames: 120, title: "高效学习方法" },
      { type: "compare", durationInFrames: 120, leftTitle: "被动", rightTitle: "主动", leftText: "只看", rightText: "回忆" },
      { type: "fade_text", durationInFrames: 90, text: "主动回忆是关键" },
      { type: "params", durationInFrames: 120, params: { 方法: "Active Recall", 频率: "每日" } },
    ],
    theme: COLOR_SCHEMES[3],
  },
  {
    name: "电路参数",
    templateId: "simple-electric",
    timeline: [
      { type: "title", durationInFrames: 90, title: "电路分析" },
      { type: "params", durationInFrames: 120, params: { 电压: "9V", 电流: "1A", 阻值: "9Ω" } },
      { type: "arrow", durationInFrames: 90 },
      { type: "device_toggle", durationInFrames: 90 },
    ],
    theme: COLOR_SCHEMES[1],
  },
  {
    name: "Manim+Remotion 完整科普",
    templateId: "simple-electric",
    timeline: [
      { type: "title", durationInFrames: 120, title: "科普视频标题" },
      { type: "quote", durationInFrames: 120, quote: "理解优先于记忆", author: "" },
      { type: "chapter", durationInFrames: 90, title: "原理讲解" },
      {
        type: "manim_placeholder",
        durationInFrames: 150,
        title: "原理动画",
        manimType: "function_graph",
        note: "在 Manim 页渲染后，改为 manim_clip 并填入 sourceUrl",
      },
      { type: "bullet_list", durationInFrames: 150, title: "核心要点", items: ["定义", "机制", "应用"] },
      { type: "flow_steps", durationInFrames: 150, steps: ["观察", "理解", "回忆", "应用"] },
      { type: "chapter", durationInFrames: 90, title: "学习技巧" },
      {
        type: "manim_placeholder",
        durationInFrames: 150,
        title: "遗忘曲线",
        manimType: "forgetting_curve",
        note: "替换为 manim_clip",
      },
      { type: "timeline_bar", durationInFrames: 150, title: "复习节奏", events: ["第1天", "第3天", "第7天", "第30天"] },
      { type: "stat", durationInFrames: 90, value: "2×", label: "主动回忆效率提升" },
      { type: "fade_text", durationInFrames: 90, text: "感谢观看 · 点赞收藏" },
    ],
    theme: COLOR_SCHEMES[3],
  },
  {
    name: "半导体工程片",
    templateId: "simple-electric",
    timeline: [
      { type: "title", durationInFrames: 120, title: "半导体器件原理" },
      { type: "chapter", durationInFrames: 90, title: "PN 结" },
      { type: "manim_placeholder", durationInFrames: 150, title: "PN 结示意", manimType: "pn_junction" },
      { type: "chapter", durationInFrames: 90, title: "MOSFET" },
      { type: "manim_placeholder", durationInFrames: 150, title: "沟道结构", manimType: "mosfet_channel" },
      { type: "formula_card", durationInFrames: 120, caption: "欧姆定律", formula: "V = I × R" },
      { type: "params", durationInFrames: 120, params: { 电压: "12V", 电流: "2A" } },
    ],
    theme: COLOR_SCHEMES[2],
  },
];
