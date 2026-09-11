export interface ManimParamField {
  key: string;
  label: string;
  type: "text" | "number" | "string_list";
}

export interface ManimTemplate {
  id: string;
  label: string;
  desc: string;
  category: string;
  defaultParams?: Record<string, unknown>;
  paramFields?: ManimParamField[];
}

export const MANIM_CATEGORIES = [
  { id: "engineering", label: "工程 / 物理 / 电气" },
  { id: "math", label: "数学 / 几何 / 图表" },
  { id: "infographic", label: "信息图表" },
  { id: "text", label: "文本动画" },
  { id: "structure", label: "结构 / 轨道" },
] as const;

export const MANIM_TEMPLATES: ManimTemplate[] = [
  // 工程
  { id: "pn_junction", label: "PN 结示意图", desc: "N/P 型、耗尽层、电流方向", category: "engineering", defaultParams: { voltage: 9, current: 1 } },
  { id: "band_structure", label: "能带结构", desc: "导带、价带、载流子", category: "engineering" },
  { id: "current_arrow", label: "电流箭头", desc: "电阻电路与电流", category: "engineering", defaultParams: { voltage: 9, current: 1, resistance: 9 } },
  { id: "photon_breakdown", label: "光子击穿", desc: "光子激发电子", category: "engineering" },
  { id: "semiconductor_layers", label: "半导体层", desc: "多层半导体结构", category: "engineering" },
  { id: "mosfet_channel", label: "MOSFET 沟道", desc: "G/S/D 与沟道示意", category: "engineering" },
  { id: "buck_converter", label: "Buck 降压拓扑", desc: "开关、电感、电容", category: "engineering" },
  { id: "sine_waveform", label: "正弦波形", desc: "频率与波形", category: "engineering", defaultParams: { freq: "50Hz", title: "正弦波形" }, paramFields: [{ key: "freq", label: "频率", type: "text" }, { key: "title", label: "标题", type: "text" }] },
  { id: "llc_resonant", label: "LLC 谐振腔", desc: "变压器与谐振元件", category: "engineering" },
  // 数学
  { id: "function_graph", label: "函数曲线", desc: "sin 等函数图像", category: "math", defaultParams: { title: "y = sin(x)", label: "sin(x)" }, paramFields: [{ key: "title", label: "标题", type: "text" }, { key: "label", label: "曲线标签", type: "text" }] },
  { id: "coordinate_grid", label: "坐标系", desc: "网格与向量点", category: "math", defaultParams: { title: "坐标系" }, paramFields: [{ key: "title", label: "标题", type: "text" }] },
  { id: "vector_sum", label: "向量合成", desc: "两向量与合向量", category: "math", defaultParams: { title: "向量合成" }, paramFields: [{ key: "title", label: "标题", type: "text" }] },
  { id: "bar_chart", label: "柱状图", desc: "数据统计柱状图", category: "math", defaultParams: { title: "数据统计", values: [3, 5, 2, 7, 4] } },
  // 信息图表
  { id: "timeline_horizontal", label: "时间轴", desc: "横向事件时间线", category: "infographic", defaultParams: { events: ["起点", "阶段1", "阶段2", "终点"] } },
  { id: "flowchart", label: "流程图", desc: "纵向流程步骤", category: "infographic", defaultParams: { steps: ["输入", "处理", "输出"] } },
  { id: "forgetting_curve", label: "遗忘曲线", desc: "记忆随时间衰减", category: "infographic", defaultParams: { title: "遗忘曲线" }, paramFields: [{ key: "title", label: "标题", type: "text" }] },
  { id: "concept_network", label: "概念网络", desc: "中心概念与关联节点", category: "infographic", defaultParams: { center: "核心概念", nodes: ["A", "B", "C", "D"] } },
  { id: "learning_curve", label: "学习效率曲线", desc: "理解优先、长期留存", category: "infographic", defaultParams: { title: "学习效率曲线" }, paramFields: [{ key: "title", label: "标题", type: "text" }] },
  // 文本
  { id: "typewriter_text", label: "逐字出现", desc: "打字机式标题", category: "text", defaultParams: { text: "主动回忆 · 间隔重复", subtitle: "学习技巧" }, paramFields: [{ key: "subtitle", label: "副标题", type: "text" }, { key: "text", label: "正文", type: "text" }] },
  { id: "keyword_pop", label: "关键词高亮", desc: "关键词弹出强调", category: "text", defaultParams: { keywords: ["理解", "记忆", "应用", "反馈"] } },
  { id: "formula_steps", label: "公式拆解", desc: "分步展示公式", category: "text", defaultParams: { steps: ["P = V × I", "V = I × R", "P = I² × R"] } },
  { id: "chapter_banner", label: "章节横幅", desc: "章节标题动画", category: "text", defaultParams: { chapter: "第一章", title: "半导体基础" }, paramFields: [{ key: "chapter", label: "章节", type: "text" }, { key: "title", label: "标题", type: "text" }] },
  // 结构
  { id: "isometric_stack", label: "层叠结构", desc: "PCB/能带层叠（伪3D）", category: "structure" },
  { id: "orbit_paths", label: "轨道路径", desc: "旋转/轨道示意", category: "structure" },
];

export function getManimTemplate(id: string): ManimTemplate | undefined {
  return MANIM_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultParams(id: string): Record<string, unknown> {
  const t = getManimTemplate(id);
  return { ...(t?.defaultParams ?? {}) };
}
