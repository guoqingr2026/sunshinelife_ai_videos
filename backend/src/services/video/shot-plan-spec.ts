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
  concept_tree: "concept_network",
  interleave: "flowchart",
  deep_work: "keyword_pop",
  exam_simulation: "timeline_horizontal",
  study_group: "concept_network",
  brain_health: "learning_curve",
  vocabulary: "vocab_card",
  vocab: "vocab_card",
  grammar: "grammar_highlight",
  dialogue: "dialogue_scene",
  conversation: "dialogue_scene",
  mathtex: "mathtex_formula",
  latex_formula: "mathtex_formula",
  derivation: "mathtex_derivation",
  formula_derivation: "mathtex_derivation",
  "3d_surface": "scene_3d_surface",
  "3d_orbit": "scene_3d_orbit",
  three_d: "scene_3d_surface",
  cardioid: "manim_cardioid",
  rose_curve: "manim_rose_curve",
  archimedean_spiral: "manim_archimedean_spiral",
  exponential_spiral: "manim_exponential_spiral",
  lemniscate: "manim_lemniscate",
  cycloid: "manim_cycloid",
  lorenz_attractor: "manim_lorenz_attractor",
  mandelbrot: "manim_mandelbrot_zoom",
  mandelbrot_zoom: "manim_mandelbrot_zoom",
  lissajous: "manim_lissajous",
  manim_custom: "manim_custom",
  custom_scene: "manim_custom",
  universe_scene: "manim_custom",
  julia_set: "manim_julia_set",
  koch_snowflake: "manim_koch_snowflake",
  three_body: "manim_three_body",
  curve_3d: "manim_curve_3d",
  rossler: "manim_rossler",
  parametric_surface: "manim_parametric_surface",
  parametric_curve: "manim_parametric_curve",
  moving_frame_box: "manim_moving_frame_box",
  point_with_trace: "manim_point_with_trace",
  formula_curve: "formula_curve",
  curve_formula: "formula_curve",
  image: "image_focus",
  picture: "image_focus",
  svg: "svg_icon",
  video_clip: "video_embed",
};

/** GPT 常编造的非 Manim 类型 → Remotion 模块 */
export const REMOTION_TYPE_ALIASES: Record<string, string> = {
  cornell_notes: "bullet_list",
  cornell: "bullet_list",
  notes: "bullet_list",
  subtitle: "subtitle",
  quote: "quote",
  title_card: "title",
  title: "title",
  outro: "fade_text",
  manim_clip: "fade_text",
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
  { id: "pie_chart", label: "饼图", category: "数学", desc: "占比扇形图", keywords: ["饼图", "占比", "比例", "扇形"] },
  { id: "line_chart_compare", label: "折线对比", category: "数学", desc: "双系列折线对比", keywords: ["折线", "对比", "趋势", "曲线对比"] },
  { id: "circuit_loop", label: "电路回路", category: "工程", desc: "闭合电路回路", keywords: ["电路", "回路", "闭合", "电源"] },
  { id: "band_temperature", label: "能带温度", category: "工程", desc: "能带随温度变化", keywords: ["能带", "温度", "禁带", "热激发"] },
  { id: "crystal_lattice", label: "晶体点阵", category: "结构", desc: "晶格点阵伪3D", keywords: ["晶体", "点阵", "晶格", "lattice"] },
  { id: "code_highlight", label: "代码高亮", category: "文本", desc: "代码逐行展示", keywords: ["代码", "编程", "高亮", "python"] },
  { id: "transform_demo", label: "变换动画", category: "结构", desc: "Transform 形变", keywords: ["变换", "transform", "形变", "转换"] },
  // 英语
  { id: "vocab_card", label: "单词卡", category: "英语", desc: "词汇、音标、释义、例句", keywords: ["单词", "词汇", "vocabulary", "音标", "背单词", "英语单词"] },
  { id: "grammar_highlight", label: "语法高亮", category: "英语", desc: "句型模式与例句强调", keywords: ["语法", "grammar", "句型", "时态", "从句", "语法点"] },
  { id: "dialogue_scene", label: "对话场景", category: "英语", desc: "双人气泡对话", keywords: ["对话", "口语", "情景对话", "conversation", "dialogue", "交流"] },
  // 媒体 / 公式 / 3D
  { id: "mathtex_formula", label: "MathTex公式", category: "媒体", desc: "LaTeX 公式展示", keywords: ["公式", "latex", "mathtex", "方程", "等式", "数学公式"] },
  { id: "mathtex_derivation", label: "公式推导", category: "媒体", desc: "分步 MathTex 推导", keywords: ["推导", "证明", "derivation", "化简", "公式推导"] },
  { id: "scene_3d_surface", label: "3D曲面", category: "媒体", desc: "ThreeDScene 曲面环绕", keywords: ["3d", "三维", "曲面", "立体", "surface"] },
  { id: "scene_3d_orbit", label: "3D轨道", category: "媒体", desc: "ThreeDScene 轨道运动", keywords: ["3d轨道", "环绕", "orbit", "旋转", "公转"] },
  { id: "image_focus", label: "图片聚焦", category: "媒体", desc: "图片/SVG 展示缩放", keywords: ["图片", "配图", "示意图", "image", "插图", "照片"] },
  { id: "svg_icon", label: "SVG图标", category: "媒体", desc: "矢量图标动画", keywords: ["svg", "图标", "矢量", "icon"] },
  { id: "video_embed", label: "视频嵌入", category: "媒体", desc: "VideoMobject 片段", keywords: ["视频", "录像", "片段", "video", "实拍"] },
  // 高级
  { id: "custom_dsl", label: "JSON场景", category: "高级", desc: "JSON DSL 自定义", keywords: ["dsl", "json", "自定义场景"] },
  { id: "custom_python", label: "自定义Python", category: "高级", desc: "粘贴 Manim Scene 代码", keywords: ["python", "自定义代码", "scene", "manim代码"] },
  // 蒙提霍尔 / 概率科普（ECS 自定义镜头）
  { id: "manim_probability_tree", label: "概率树状图", category: "数学", desc: "分支路径与概率标注", keywords: ["概率树", "蒙提霍尔", "贝叶斯", "分支", "probability_tree"] },
  { id: "manim_formula", label: "公式推导卡", category: "数学", desc: "主公式 + 分步说明", keywords: ["贝叶斯", "公式推导", "manim_formula", "概率公式"] },
  { id: "manim_simulation_chart", label: "模拟实验图", category: "数学", desc: "蒙特卡洛收敛曲线", keywords: ["模拟", "蒙特卡洛", "收敛", "simulation_chart"] },
  { id: "manim_cardioid", label: "心形线", category: "数学", desc: "极坐标心形线 r=1-cosθ", keywords: ["心形线", "cardioid", "极坐标", "浪漫"] },
  { id: "manim_rose_curve", label: "玫瑰线", category: "数学", desc: "玫瑰曲线 r=sin(kθ)", keywords: ["玫瑰线", "rose", "花瓣", "极坐标"] },
  { id: "manim_archimedean_spiral", label: "阿基米德螺线", category: "数学", desc: "r=a+bθ 等距螺线", keywords: ["阿基米德", "螺线", "spiral", "展开"] },
  { id: "manim_exponential_spiral", label: "指数螺线", category: "数学", desc: "r=a·e^(bθ) 对数螺线", keywords: ["指数螺线", "对数螺线", "加速", "growth"] },
  { id: "manim_lemniscate", label: "莱姆尼斯盖特", category: "数学", desc: "∞ 形对称曲线", keywords: ["莱姆尼斯盖特", "lemniscate", "无限", "对称"] },
  { id: "manim_cycloid", label: "摆线", category: "数学", desc: "轮子滚动轨迹", keywords: ["摆线", "cycloid", "滚动", "轨迹"] },
  { id: "manim_lissajous", label: "李萨如图形", category: "数学", desc: "双频率正弦叠加", keywords: ["李萨如", "lissajous", "频率", "音乐"] },
  { id: "manim_lorenz_attractor", label: "洛伦兹吸引子", category: "数学", desc: "混沌蝴蝶三维轨迹", keywords: ["洛伦兹", "lorenz", "混沌", "吸引子", "蝴蝶"] },
  { id: "manim_mandelbrot_zoom", label: "曼德布罗集", category: "数学", desc: "分形边界放大", keywords: ["曼德布罗", "mandelbrot", "分形", "迭代", "复平面"] },
  { id: "manim_custom", label: "数学宇宙（万能）", category: "高级", desc: "params.scene 指定宇宙场景名，无需逐个注册", keywords: ["manim_custom", "数学宇宙", "曲线宇宙", "scene"] },
  { id: "manim_curve_3d", label: "3D 空间曲线", category: "数学", desc: "ThreeDAxes + 3D 参数轨迹", keywords: ["3d曲线", "curve_3d", "空间曲线", "螺旋"] },
  { id: "manim_parametric_surface", label: "3D 参数曲面", category: "数学", desc: "z=sin(u)cos(v) 美学曲面", keywords: ["曲面", "surface", "鞍面", "波浪面"] },
  { id: "manim_parametric_curve", label: "通用参数曲线", category: "数学", desc: "2D 参数曲线骨架", keywords: ["参数曲线", "parametric", "摆线族"] },
  { id: "formula_curve", label: "公式曲线生成器", category: "数学", desc: "输入 x(t)/y(t)/r(t) 公式自动生成动画", keywords: ["公式曲线", "参数方程", "formula", "输入公式", "曲线生成"] },
  { id: "manim_rossler", label: "Rössler 吸引子", category: "数学", desc: "混沌吸引子轨迹", keywords: ["rossler", "混沌", "吸引子"] },
  { id: "manim_julia_set", label: "朱利亚集", category: "数学", desc: "Julia 分形", keywords: ["julia", "朱利亚", "分形"] },
  { id: "manim_koch_snowflake", label: "Koch 雪花", category: "数学", desc: "Koch 分形雪花", keywords: ["koch", "雪花", "分形"] },
  { id: "manim_three_body", label: "三体问题", category: "数学", desc: "三质点引力轨迹", keywords: ["三体", "引力", "混沌"] },
  // 读书 / 学习方法专题
  { id: "manim_outline", label: "大纲结构图", category: "学习", desc: "章节树状大纲动画", keywords: ["大纲", "结构", "outline", "索引"] },
  { id: "manim_teacher_resources", label: "老师资源图", category: "学习", desc: "讲义笔记考古题汇聚考点", keywords: ["老师", "讲义", "考古题", "考点"] },
  { id: "manim_draw_diagram", label: "结构绘制", category: "学习", desc: "画图理解复杂结构", keywords: ["画图", "绘制", "diagram", "理解"] },
  { id: "manim_compare_table", label: "左右对比表", category: "学习", desc: "易混淆概念并列比较", keywords: ["比较", "对比", "compare", "表格"] },
  { id: "manim_vocabulary_focus", label: "单字放大", category: "学习", desc: "单字击破重复记忆", keywords: ["单字", "词汇", "vocabulary", "重复"] },
  { id: "manim_multi_explanation", label: "多人解释", category: "学习", desc: "不同讲法不同角度", keywords: ["解释", "多角度", "multi", "讲法"] },
  { id: "manim_explanation_highlight", label: "详解高亮", category: "学习", desc: "详解关键字框选强调", keywords: ["详解", "关键字", "highlight", "重点"] },
  { id: "manim_recall_page", label: "翻页复述", category: "学习", desc: "翻页前自问学到了什么", keywords: ["复述", "翻页", "recall", "检核"] },
  { id: "manim_phone_fade", label: "手机淡出", category: "学习", desc: "减少干扰习惯养成", keywords: ["手机", "干扰", "习惯", "fade"] },
  { id: "manim_keybook", label: "考前重点本", category: "学习", desc: "厚书浓缩易忘点", keywords: ["重点本", "易忘点", "keybook", "考前"] },
  // Manim 官方画廊精选
  { id: "manim_moving_frame_box", label: "公式框选", category: "数学", desc: "分段 MathTex + 框选高亮切换（乘积求导等）", keywords: ["movingframebox", "框选", "mathtex", "求导", "surrounding"] },
  { id: "manim_point_with_trace", label: "动点轨迹", category: "数学", desc: "动点留痕；demo 旋转平移或 parametric 公式曲线", keywords: ["pointwithtrace", "轨迹", "trace", "updater", "参数曲线"] },
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
    "remotion_doors", "remotion_open_door", "remotion_car_reveal",
  ]);
  if (remotionTypes.has(t)) return t;
  return REMOTION_TYPE_ALIASES[t] || null;
}

function ruleLine(spec: ManimTypeSpec): string {
  return `${spec.keywords.join(", ")} → ${spec.id} | ${spec.label}`;
}

export function buildKeywordRulesSection(): string {
  const groups = ["工程", "数学", "信息图", "文本", "结构", "英语", "媒体", "高级"];
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

## 全部 Manim 类型与推荐关键词（${MANIM_TYPE_SPECS.length} 种）

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

  return `你是「低成本网页动画生产系统」的分镜规划助手。请根据用户的视频主题，输出**完整项目 JSON**（可直接粘贴到「一键成片」）。

## 你必须遵守的输出格式

\`\`\`json
{
  "title": "视频标题",
  "theme": {
    "name": "B站粉",
    "primaryColor": "#fb7299",
    "secondaryColor": "#23ade5",
    "backgroundColor": "#141420",
    "accentColor": "#ffe066",
    "fontPresetId": "noto-sans-sc"
  },
  "shots": [
    {
      "type": "typewriter_text",
      "text": "口播字幕全文，一句一段",
      "highlight": ["关键词1", "关键词2"]
    },
    { "type": "chapter", "label": "01 章节名" },
    {
      "type": "manim类型ID",
      "label": "镜头标题",
      "params": { "自定义参数": "值" }
    }
  ]
}
\`\`\`

说明：
- \`title\`：视频标题（必填，纯字符串，不要带引号转义）
- \`theme\`：成片配色，推荐 B站粉（见上例）
- \`shots\`：按播放顺序的完整分镜列表（可 10～30 镜）
- **口播字幕**用 \`typewriter_text\`，必须把 \`text\` 写在镜头对象上；\`highlight\` 为要高亮的关键词数组
- 动画镜头（Manim/Remotion 自定义）用 \`params\` 传参；\`label\` 为简短标题
- **type 必须从下方列表中选择，不得编造**；Remotion 章节用 \`chapter\`

## 可用 Manim 类型（共 ${MANIM_TYPE_SPECS.length} 种）

${typeTable}

## 行格式备选（若用户要求文本格式）

关键词规则每行：\`关键词1, 关键词2 → 类型ID | 标签\`
镜头序列每行：\`1. 类型ID | 镜头标题\`

## 规划建议

1. 科普/学习类：开场 concept_network 或 chapter_banner，原理用工程/数学类，技巧用 forgetting_curve / typewriter_text
2. 半导体/电路：pn_junction → band_structure → mosfet_channel → current_arrow
3. 数学：mathtex_formula → function_graph → mathtex_derivation
4. 英语：vocab_card → grammar_highlight → dialogue_scene
5. 每个视频 shots 建议 2～5 个 Manim 镜头；避免 scene_3d_*（需 OpenGL）除非用户明确要求
6. label 中文 ≤12 字；配色/背景由 Remotion theme 处理，不在 Manim params 里设置
7. 完整参数手册见仓库 docs/manim-automation-guide.md

请根据用户描述，直接输出 JSON 代码块，不要多余解释。`;
}
