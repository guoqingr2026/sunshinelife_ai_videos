/** 一键成片页默认占位 JSON（非学习内容，避免误用 MVP 口播） */

import { DEFAULT_PROJECT_THEME } from "./project-theme";

/** 学习/记忆示例 — 仅通过按钮「加载学习 MVP 示例」填入 */
export const MVP_LEARNING_PROJECT = {
  title: "学习与记忆 MVP",
  theme: DEFAULT_PROJECT_THEME,
  shots: [
    { type: "forgetting_curve", label: "遗忘曲线", params: { title: "艾宾浩斯遗忘曲线" } },
    { type: "chapter", label: "02 间隔重复" },
    {
      type: "typewriter_text",
      label: "主动回忆",
      text: "主动回忆 · Active Recall",
      subtitle: "学习技巧",
    },
    { type: "chapter", label: "01 主动回忆" },
    {
      type: "concept_network",
      label: "概念网络",
      params: { center: "理解优先", nodes: ["联系", "应用", "长期记忆"] },
    },
  ],
};

/** 页面初始空白模板 — 用户粘贴自己的 shots 或从镜头规划导入 */
export const DEFAULT_COMPOSE_PROJECT = {
  title: "我的视频标题",
  theme: DEFAULT_PROJECT_THEME,
  shots: [
    { type: "chapter", label: "01 开场" },
    {
      type: "typewriter_text",
      label: "口播",
      text: "在此填写口播文案，一句一段。",
      highlight: ["关键词"],
    },
  ],
};

export const MVP_PROJECT_JSON = JSON.stringify(MVP_LEARNING_PROJECT, null, 2);
export const DEFAULT_COMPOSE_PROJECT_JSON = JSON.stringify(DEFAULT_COMPOSE_PROJECT, null, 2);

export const MVP_WORKFLOW_HELP = `
【项目 JSON】含 title、可选 theme（配色/字体）、shots 分镜数组。
系统流程：项目 JSON → 规划时间轴 → Manim 渲染 → Remotion 合成 → 自动打包 output 工程（ZIP 可下载到本地）。
页面「成片配色」默认 B站粉；也可在 JSON 写 theme 块，或点「将配色写入 JSON theme」。

**重要**：粘贴完整 shots 后，成片将严格按 JSON 顺序渲染，不会自动插入「主动回忆」等默认镜头。
若需要系统自动加标题卡/片尾，在 JSON 根级设 "autoWrap": true。

type 说明：
- Manim：forgetting_curve, typewriter_text, manim_cardioid 等（见镜头规划规格表）
- Remotion：chapter, quote, bullet_list, fade_text

不要混用 memory_recall 等 GPT 自造 ID，请用标准 ID。
`;
