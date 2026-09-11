/** Manim 镜头类型完整规格 — 供镜头规划文章与 GPT 提示词生成 */

export interface ManimTypeSpec {
  id: string;
  label: string;
  category: string;
  desc: string;
  keywords: string[];
}

const VALID_MANIM_IDS = new Set<string>();

export const MANIM_TYPE_ALIASES: Record<string, string> = {
  memory_recall: "concept_network",
  active_recall: "typewriter_text",
  neural_connection: "concept_network",
  concept_simplify: "formula_steps",
  feynman: "concept_network",
  feynman_technique: "concept_network",
  spaced_repetition: "forgetting_curve",
  ebbinghaus: "forgetting_curve",
  spaced_repetition_curve: "forgetting_curve",
  learning_tips: "typewriter_text",
  knowledge_tree: "concept_network",
  mind_map: "concept_network",
};

/** GPT 常编造的非 Manim 类型 → Remotion 模块 */
export const REMOTION_TYPE_ALIASES: Record<string, string> = {
  cornell_notes: "bullet_list",
  cornell: "bullet_list",
  notes: "bullet_list",
  subtitle: "subtitle",
  quote: "quote",
  title_card: "title",
  outro: "fade_text",
};

export const MANIM_TYPE_SPECS: ManimTypeSpec[] = [
  // 工程 / 物理 / 电气
  { id: "pn_junction", label: "PN 结", category: "工程", desc: "N/P 型、耗尽层、电流方向", keywords: ["pn结", "pn", "耗尽层", "二极管", "扩散"] },
  { id: "band_structure", label: "能带结构", category: "工程", desc: "导带、价带、载流子", keywords: ["能带", "导带", "价带", "载流子", "禁带"] },
  { id: "current_arrow", label: "电路电流", category: "工程", desc: "电阻电路与电流方向", keywords: ["电流", "电阻", "欧姆", "电路", "电压", "欧姆定律"] },
  { id: "photon_breakdown", label: "光子激发", category: "工程", desc: "光子激发电子、击穿", keywords: ["光子", "击穿", "光激发", "光电"] },
  { id: "semiconductor_layers", label: "半导体层", category: "工程", desc: "多层半导体结构", keywords: ["半导体层", "多层", "外延", "叠层"] },
  { id: "mosfet_channel", label: "MOSFET", category: "工程", desc: "G/S/D 沟道示意", keywords: ["mosfet", "沟道", "场效应", "栅极", "源极", "漏极"] },
  { id: "buck_converter", label: "Buck 拓扑", category: "工程", desc: "降压开关电源", keywords: ["buck", "降压", "开关电源", "dcdc", "电感", "电容"] },
  { id: "sine_waveform", label: "正弦波形", category: "工程", desc: "频率与波形", keywords: ["波形", "正弦", "频率", "hz", "交流", "信号"] },
  { id: "llc_resonant", label: "LLC 谐振", category: "工程", desc: "LLC 谐振腔", keywords: ["llc", "谐振", "变压器", "谐振腔"] },
  // 数学 / 几何
  { id: "function_graph", label: "函数曲线", category: "数学", desc: "sin/cos 等函数图像", keywords: ["函数", "sin", "cos", "曲线", "图像", "绘图"] },
  { id: "coordinate_grid", label: "坐标系", category: "数学", desc: "网格与坐标点", keywords: ["坐标", "坐标系", "平面", "网格", "xy"] },
  { id: "vector_sum", label: "向量合成", category: "数学", desc: "向量与合向量", keywords: ["向量", "合成", "平行四边形", "力的合成"] },
  { id: "bar_chart", label: "数据统计", category: "数学", desc: "柱状图", keywords: ["柱状", "统计", "图表", "数据", "对比数据"] },
  // 信息图表
  { id: "timeline_horizontal", label: "时间轴", category: "信息图", desc: "横向事件时间线", keywords: ["时间轴", "时间线", "里程碑", "阶段"] },
  { id: "flowchart", label: "流程图", category: "信息图", desc: "纵向流程步骤", keywords: ["流程", "步骤", "流程图", "工序"] },
  { id: "forgetting_curve", label: "遗忘曲线", category: "信息图", desc: "记忆随时间衰减", keywords: ["遗忘", "艾宾浩斯", "记忆曲线", "遗忘曲线"] },
  { id: "concept_network", label: "概念网络", category: "信息图", desc: "中心概念与关联", keywords: ["概念", "知识树", "知识网络", "结构图", "思维导图"] },
  { id: "learning_curve", label: "学习效率", category: "信息图", desc: "学习效率曲线", keywords: ["学习效率", "学习曲线", "留存", "长期记忆"] },
  // 文本动画
  { id: "typewriter_text", label: "逐字出现", category: "文本", desc: "打字机式标题", keywords: ["间隔重复", "主动回忆", "费曼", "打字机", "逐字"] },
  { id: "keyword_pop", label: "关键词高亮", category: "文本", desc: "关键词弹出强调", keywords: ["关键词", "高亮", "强调", "弹出"] },
  { id: "formula_steps", label: "公式拆解", category: "文本", desc: "分步展示公式", keywords: ["公式", "拆解", "推导", "等式"] },
  { id: "chapter_banner", label: "章节横幅", category: "文本", desc: "章节标题动画", keywords: ["章节", "横幅", "开篇", "第一章"] },
  // 结构
  { id: "isometric_stack", label: "层叠结构", category: "结构", desc: "PCB/能带层叠伪3D", keywords: ["层叠", "pcb", "叠层", "多层结构"] },
  { id: "orbit_paths", label: "轨道路径", category: "结构", desc: "旋转轨道示意", keywords: ["轨道", "旋转", "路径", "圆周", "公转"] },
];

for (const spec of MANIM_TYPE_SPECS) {
  VALID_MANIM_IDS.add(spec.id);
}

export function isValidManimType(type: string): boolean {
  return VALID_MANIM_IDS.has(type);
}

export function resolveManimType(type: string): string | null {
  const t = type.trim().toLowerCase();
  if (VALID_MANIM_IDS.has(t)) return t;
  const alias = MANIM_TYPE_ALIASES[t];
  if (alias && VALID_MANIM_IDS.has(alias)) return alias;
  return null;
}

export function resolveRemotionType(type: string): string | null {
  const t = type.trim().toLowerCase();
  const remotionTypes = new Set([
    "title", "chapter", "params", "bullet_list", "subtitle", "fade_text",
    "compare", "arrow", "quote", "stat", "flow_steps", "timeline_bar", "formula_card",
  ]);
  if (remotionTypes.has(t)) return t;
  return REMOTION_TYPE_ALIASES[t] || null;
}

function ruleLine(spec: ManimTypeSpec): string {
  return `${spec.keywords.join(", ")} → ${spec.id} | ${spec.label}`;
}

export function buildKeywordRulesSection(): string {
  const groups = ["工程", "数学", "信息图", "文本", "结构"];
  const lines: string[] = [];
  for (const g of groups) {
    lines.push(`### ${g}`);
    for (const spec of MANIM_TYPE_SPECS.filter((s) => s.category === g)) {
      lines.push(ruleLine(spec));
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function buildDefaultShotPlanArticle(): string {
  return `# 镜头规划文章

> 把 GPT 按下方规格生成的分镜贴到「## 关键词规则」和「## 镜头序列」两节，保存后一键成片自动读取。

---

## 格式规范（给 GPT 看）

### 1. 关键词规则（每行一条）

\`\`\`
关键词1, 关键词2 → manim类型ID | 显示标签
\`\`\`

示例：
\`\`\`
pn结, pn → pn_junction | PN 结
遗忘, 记忆曲线 → forgetting_curve | 遗忘曲线
\`\`\`

### 2. 固定镜头序列（可选）

若填写此节，一键成片**按顺序**使用这些镜头，不再靠关键词匹配：

\`\`\`
## 镜头序列
1. pn_junction | PN 结原理
2. band_structure | 能带结构
3. forgetting_curve | 遗忘曲线
\`\`\`

每行格式：\`序号. 类型ID | 镜头标题\`

### 3. JSON 整段（推荐 GPT 直接输出）

\`\`\`json
{
  "rules": [
    { "keywords": ["pn结", "pn"], "type": "pn_junction", "label": "PN 结" }
  ],
  "shots": [
    { "type": "pn_junction", "label": "PN 结原理" },
    { "type": "forgetting_curve", "label": "遗忘曲线" }
  ]
}
\`\`\`

- \`rules\`：关键词 → Manim 类型映射（视频要求里出现关键词时自动选用）
- \`shots\`：固定分镜顺序（优先级高于关键词）
- \`params\`：可选，传给 Manim 模板的参数对象

---

## 全部 Manim 类型与推荐关键词（24 种）

${buildKeywordRulesSection()}

---

## 关键词规则

（在此粘贴或保留 GPT 生成的规则行，可从上表复制）

pn结, pn → pn_junction | PN 结
能带, 导带 → band_structure | 能带结构
遗忘, 记忆曲线 → forgetting_curve | 遗忘曲线
mosfet, 沟道 → mosfet_channel | MOSFET
间隔重复, 主动回忆 → typewriter_text | 学习技巧

## 镜头序列

（可选：粘贴 GPT 生成的有序分镜列表）

1. pn_junction | PN 结原理
2. forgetting_curve | 遗忘曲线
3. typewriter_text | 学习技巧
`;
}

/** 可复制到 ChatGPT 的系统提示词 */
export function buildGptPrompt(): string {
  const typeTable = MANIM_TYPE_SPECS.map(
    (s) => `- **${s.id}**（${s.label}，${s.category}）：${s.desc}；关键词：${s.keywords.join("、")}`
  ).join("\n");

  return `你是「低成本网页动画生产系统」的分镜规划助手。请根据用户的视频主题，输出符合以下规格的镜头规划。

## 你必须遵守的输出格式

请输出一个 JSON 代码块，结构如下：

\`\`\`json
{
  "rules": [
    { "keywords": ["关键词1", "关键词2"], "type": "manim类型ID", "label": "显示标签" }
  ],
  "shots": [
    { "type": "manim类型ID", "label": "镜头标题", "params": {} }
  ]
}
\`\`\`

说明：
- \`rules\`：从用户主题中提取可能用到的关键词，映射到下方 Manim 类型（每条 1 个 type）
- \`shots\`：按视频叙事顺序列出 2～5 个 Manim 镜头（必填，按顺序播放）
- \`params\`：仅当需要自定义文字/数据时填写，否则省略
- **type 必须从下方列表中选择，不得编造**

## 可用 Manim 类型（共 ${MANIM_TYPE_SPECS.length} 种）

${typeTable}

## 行格式备选（若用户要求文本格式）

关键词规则每行：\`关键词1, 关键词2 → 类型ID | 标签\`
镜头序列每行：\`1. 类型ID | 镜头标题\`

## 规划建议

1. 科普/学习类：开场用 concept_network 或 chapter_banner，原理用工程/数学类，技巧用 forgetting_curve / learning_curve / typewriter_text
2. 半导体/电路类：pn_junction → band_structure → mosfet_channel → current_arrow
3. 每个视频 shots 建议 2～4 个 Manim 镜头，不要过多
4. label 用中文简短标题，不超过 12 字

请根据用户描述，直接输出 JSON 代码块，不要多余解释。`;
}
