/** MVP 测试用 — 唯一有效的项目 JSON 格式（一键成片直接粘贴） */

import { DEFAULT_PROJECT_THEME } from "./project-theme";

export const MVP_LEARNING_PROJECT = {
  title: "学习与记忆 MVP",
  theme: DEFAULT_PROJECT_THEME,
  shots: [
    { type: "forgetting_curve", label: "遗忘曲线", params: { title: "艾宾浩斯遗忘曲线" } },
    { type: "chapter", label: "02 间隔重复" },
    { type: "typewriter_text", label: "主动回忆", params: { text: "主动回忆 · Active Recall", subtitle: "学习技巧" } },
    { type: "chapter", label: "01 主动回忆" },
    { type: "concept_network", label: "概念网络", params: { center: "理解优先", nodes: ["联系", "应用", "长期记忆"] } },
  ],
};

export const MVP_PROJECT_JSON = JSON.stringify(MVP_LEARNING_PROJECT, null, 2);

export const MVP_WORKFLOW_HELP = `
【项目 JSON】含 title、可选 theme（配色/字体）、shots 分镜数组。
系统流程：项目 JSON → 规划时间轴 → Manim 渲染 → Remotion 合成 → 自动打包 output 工程（ZIP 可下载到本地）。
页面「成片配色」默认 B站粉；也可在 JSON 写 theme 块，或点「将配色写入 JSON theme」。

type 说明：
- Manim：forgetting_curve, typewriter_text, concept_network, learning_curve, flowchart 等（见镜头规划规格表）
- Remotion：chapter, quote, bullet_list, fade_text, flow_steps, timeline_bar

不要混用 memory_recall 等 GPT 自造 ID，请用标准 ID。
`;
