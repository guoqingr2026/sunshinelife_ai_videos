/** 全流程模板提示词（手动复制 → 未来 API 自动） */

export interface WorkflowStep {
  id: string;
  order: number;
  title: string;
  route: string;
  purpose: string;
  manualSteps: string[];
  automationNote: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "shot-plan",
    order: 1,
    title: "镜头规划",
    route: "/config/shot-plan",
    purpose: "根据主题生成符合 Manim 类型的分镜 JSON，是一键成片的唯一上游输入。",
    manualSteps: [
      "复制「GPT 分镜提示词」到 ChatGPT / Claude",
      "描述视频主题，要求输出 JSON 代码块（含 shots 数组）",
      "将 AI 回复粘贴到镜头规划页并保存",
      "点「发送到一键成片」导入项目 JSON",
    ],
    automationNote: "后续：POST /api/video/shot-plan 可由后端直连 LLM 生成并保存。",
  },
  {
    id: "compose",
    order: 2,
    title: "一键成片",
    route: "/config/auto-video",
    purpose: "读取项目 JSON，自动 Manim 渲染 → Remotion 时间轴 → 导出工程包。",
    manualSteps: [
      "确认项目 JSON 中 title 与 shots 正确",
      "可选「预览分镜」检查 Manim / Remotion 分配",
      "选择字体预设后点「一键生成视频」",
      "在任务管理或本页下载 MP4 / output.zip",
    ],
    automationNote: "项目 JSON 格式固定；brief 字段已弃用，以 project.shots 为准。",
  },
  {
    id: "subtitle",
    order: 3,
    title: "字幕编辑",
    route: "/editor/subtitle",
    purpose: "上传 SRT/TXT，断句修复；字幕可供给 B 站文案步骤。",
    manualSteps: ["上传或粘贴字幕", "保存后供 B 站包装文案选用"],
    automationNote: "后续：Whisper 转写 API 写入字幕库。",
  },
  {
    id: "manim",
    order: 4,
    title: "Manim 单镜调试",
    route: "/config/manim",
    purpose: "单独测试某个 Manim 模板，不经过一键成片流水线。",
    manualSteps: ["从能力索引选择类型", "填写 params JSON", "提交后在任务管理查看"],
    automationNote: "一键成片会自动批量提交 Manim 任务。",
  },
  {
    id: "hyperframes",
    order: 5,
    title: "HyperFrames",
    route: "/config/hyperframes",
    purpose: "AI 关键帧插值手绘动画；需 IMAGE_API_KEY 与 ffmpeg。",
    manualSteps: [
      "检查页顶环境状态（API Key、ffmpeg）",
      "填写英文/中文场景描述与风格",
      "生成后在任务管理下载 MP4 或帧目录",
    ],
    automationNote: "未配置 Key 时仅生成占位图；未装 ffmpeg 时任务会标记失败。",
  },
  {
    id: "remotion",
    order: 6,
    title: "Remotion 合成",
    route: "/config/remotion",
    purpose: "手动编辑 timeline JSON 并单独渲染 Remotion 成片。",
    manualSteps: ["选择模板与配色", "编辑 timeline", "提交渲染任务"],
    automationNote: "一键成片会自动生成 timeline 并调用 Remotion。",
  },
  {
    id: "bilibili",
    order: 7,
    title: "B 站文案",
    route: "/packaging/bilibili",
    purpose: "根据字幕生成标题、简介、钩子与封面文案。",
    manualSteps: ["选择字幕或粘贴讲稿", "复制提示词到 AI", "将回复贴回本页存档"],
    automationNote: "后续：包装 API 直连 LLM。",
  },
  {
    id: "tasks",
    order: 8,
    title: "任务管理",
    route: "/tasks",
    purpose: "查看 Manim / Remotion / HyperFrames / 一键成片任务状态与下载。",
    manualSteps: ["按类型筛选", "失败任务查看 error 字段排查"],
    automationNote: "Worker 每 2 秒轮询 pending 任务。",
  },
];

export function buildComposeProjectPromptExample(): string {
  return `请根据以下主题，输出「一键成片」可直接使用的项目 JSON（不要其它说明）：

\`\`\`json
{
  "title": "视频标题",
  "shots": [
    { "type": "chapter_banner", "label": "开场" },
    { "type": "pn_junction", "label": "PN 结原理" },
    { "type": "forgetting_curve", "label": "遗忘曲线" },
    { "type": "typewriter_text", "label": "学习技巧", "params": { "lines": ["要点一", "要点二"] } }
  ]
}
\`\`\`

规则：
- type 必须是系统已注册的 Manim 或 Remotion 镜头类型 ID
- shots 按播放顺序排列，建议 2～8 个镜头
- params 仅在需要自定义文字时填写`;
}

const HF_STYLE_PREFIX: Record<string, string> = {
  handdrawn: "Hand-drawn sketch style, pencil lines, educational diagram, white background:",
  ui: "Clean modern UI style, flat design, tech illustration, dark theme:",
  engineering: "Technical engineering schematic, precise lines, labeled components, blueprint style:",
};

export function buildHyperFramesPrompt(
  scene: string,
  style: "handdrawn" | "ui" | "engineering" = "handdrawn"
): string {
  const prefix = HF_STYLE_PREFIX[style] || HF_STYLE_PREFIX.handdrawn;
  return `${prefix} ${scene.trim()}

（提交到 HyperFrames 时只需填写场景描述；系统会自动加风格前缀。若手动调 DALL·E，请保留英文风格前缀。）`;
}

export function buildManimDebugPrompt(typeId: string): string {
  return `我要测试 Manim 模板「${typeId}」。请给出适合该类型的 params JSON 示例（仅 JSON，无解释）：

\`\`\`json
{
  "type": "${typeId}",
  "params": {}
}
\`\`\`

参考仓库 docs/manim-automation-guide.md 中的参数说明。`;
}

export function buildSubtitleCleanupPrompt(rawText: string): string {
  return `你是字幕编辑助手。请将以下字幕断句、去口语赘词，输出规范 SRT 风格文本（序号 + 时间轴可省略，保留分段）：

---
${rawText.trim()}
---`;
}
